import React, { useState } from "react";
import "./pos.css";

import POSCatalog from "./components/POSCatalog";
import PosBlockingLoader from "./components/PosBlockingLoader";
import POSCartSidebar from "./components/cart-sidebar/POSCartSidebar";
import CheckoutErrorBanner from "./components/CheckoutErrorBanner";
import ReceiptModal from "./components/modals/ReceiptModal";

import { processOnlineCheckout } from "../../services/pos/checkoutService";
import { usePosManagement } from "../../hooks/usePosManagement";
import { useRefreshInventoryManagement } from "../../hooks/useInventoryManagement";
import { useRefreshInventoryAuditLogs } from "../../hooks/useInventoryAuditLogs";
import { useRefreshInventoryValuation } from "../../hooks/useInventoryValuation";
import { useRefreshOrderManagement } from "../../hooks/useOrderManagement";
import { useRefreshSalesReport } from "../../hooks/useSalesReport";
import { AuthContext } from "../../context/authContext";
import { db } from "../../utils/offlineDB";
import {
  generateClientTransactionId,
  generateOfflineTransactionId,
} from "../../utils/orderUtils";
import {
  calculateInventoryDeductions,
  hasEnoughInventoryStock,
  getInventoryStockStatus,
} from "../../utils/pos/checkoutCalculations";
import { syncPendingOfflineOrders } from "../../services/pos/offlineOrderSyncService";
import { buildPOSCartWithItem } from "@/utils/pos/posCartUtils";
import { toast } from "@/components/ui/toast";
import { savePosManagementCache } from "../../services/pos/posCacheService";
import {
  preparePOSCatalog,
  getPOSDisplayProducts,
  getPOSCatalogGroups,
} from "../../utils/pos/posCatalogUtils";

const POSPage = () => {
  const { user, profile } = React.useContext(AuthContext);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const refreshInventoryManagement = useRefreshInventoryManagement();
  const refreshAuditLogs = useRefreshInventoryAuditLogs();
  const refreshInventoryValuation = useRefreshInventoryValuation();
  const refreshOrderManagement = useRefreshOrderManagement();
  const refreshSalesReport = useRefreshSalesReport();

  const {
    menuItems,
    addons,
    categories: posCategories,
    inventoryStock: posInventoryStock,
    isLoading: isPosDataLoading,
    error: posDataError,
    refetchPosManagement,
  } = usePosManagement(isOnline);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [posProducts, setPosProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedMenu, setHasLoadedMenu] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [globalAddons, setGlobalAddons] = useState([]);

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [orderSource, setOrderSource] = useState("In-Store");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discountType, setDiscountType] = useState("None");
  const [amountPaid, setAmountPaid] = useState("");

  // Receipt Modal State
  const [processedOrder, setProcessedOrder] = useState(null);
  const pendingCheckoutIdRef = React.useRef(null);

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Format Laravel data online or use the saved Dexie data offline.
  const loadMenu = React.useCallback(
    async (freshPosData = null) => {
      try {
        setIsLoading(true);
        let data, addonsData, categoriesData, inventoryStockData;
        const hasFreshPosData = freshPosData !== null;
        const shouldLoadOnlineData = isOnline || hasFreshPosData;

        if (shouldLoadOnlineData) {
          if (!hasFreshPosData && posDataError) {
            throw new Error(posDataError);
          }

          if (hasFreshPosData) {
            data = freshPosData.items || [];
            addonsData = freshPosData.addons || [];
            categoriesData = freshPosData.categories || [];
            inventoryStockData = freshPosData.inventory_stock || [];
          } else {
            data = menuItems;
            addonsData = addons;
            categoriesData = posCategories;
            inventoryStockData = posInventoryStock;
          }

          const cachedData = await savePosManagementCache({
            items: data,
            addons: addonsData,
            categories: categoriesData,
            inventory_stock: inventoryStockData,
          });
          inventoryStockData = cachedData.inventory_stock;

          console.log("Online: Laravel POS data cached to Dexie.");
        } else {
          // Fetch Data from Dexie (Offline DB)
          console.log("Offline Mode: Loading menu from Dexie...");
          data = await db.menuItems.toArray();
          addonsData = await db.addons.toArray();
          categoriesData = await db.categories.toArray();
          inventoryStockData = await db.inventoryStock.toArray();

          if (data.length === 0) {
            console.warn(
              "No offline data found. Please connect to the internet first.",
            );
          }
        }

        const catalog = preparePOSCatalog(
          data,
          addonsData,
          categoriesData,
          inventoryStockData,
        );
        setGlobalAddons(catalog.addons);
        setCategories(catalog.categories);
        setPosProducts(catalog.products);
      } catch (error) {
        console.error("Failed to load menu for POS:", error);
        alert("Error loading menu: " + error.message);
      } finally {
        setIsLoading(false);
        setHasLoadedMenu(true);
      }
    },
    [
      addons,
      isOnline,
      menuItems,
      posCategories,
      posDataError,
      posInventoryStock,
    ],
  );

  React.useEffect(() => {
    if (isOnline && isPosDataLoading) {
      setIsLoading(true);
      return;
    }

    loadMenu();
  }, [isOnline, isPosDataLoading, loadMenu]);

  React.useEffect(() => {
    const updateConnectionStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);

    return () => {
      window.removeEventListener("online", updateConnectionStatus);
      window.removeEventListener("offline", updateConnectionStatus);
    };
  }, []);

  // Background Auto-Sync Offline Orders
  React.useEffect(() => {
    const runSync = async () => {
      if (!navigator.onLine) return;

      setIsSyncing(true);

      try {
        const result = await syncPendingOfflineOrders();

        if (result.synced > 0) {
          console.log(
            `Successfully auto-synced ${result.synced} offline orders!`,
          );

          // Keep the POS locked until the latest menu and stock are ready.
          const freshPosResult = await refetchPosManagement();

          if (freshPosResult.error) {
            throw freshPosResult.error;
          }

          await loadMenu(freshPosResult.data);

          // Refresh secondary pages without delaying the refreshed POS.
          Promise.allSettled([
            refreshInventoryManagement(),
            refreshAuditLogs(),
            refreshInventoryValuation(),
            refreshOrderManagement(),
            refreshSalesReport(),
          ]);
        }

        if (result.failed > 0) {
          setCheckoutError(
            `${result.failed} offline order(s) could not be synchronized.`,
          );
        }
      } catch (error) {
        setCheckoutError(
          error.message || "Unable to synchronize offline orders.",
        );
      } finally {
        setIsSyncing(false);
      }
    };

    // 1. Run sync immediately in case they just opened the app with internet
    runSync();

    // 2. Listen for when internet comes back online
    window.addEventListener("online", runSync);

    return () => {
      window.removeEventListener("online", runSync);
    };
  }, []);

  // Cart Actions
  const handleModalAddToCart = (selection) => {
    const cartId = `${selection.id}-${Date.now()}`;
    const updatedCart = buildPOSCartWithItem(cartItems, selection, cartId);
    const stockStatus = getInventoryStockStatus(updatedCart);

    if (!stockStatus.hasEnoughStock) {
      toast.add({
        id: `pos-cart-${selection.id}-${selection.selectedVariantId}`,
        type: "warning",
        title: "Not enough stock",
        description: "Reduce quantity or check ingredient stock.",
      });
      return false;
    }

    setCartItems(updatedCart);
    toast.add({
      id: `pos-cart-${selection.id}-${selection.selectedVariantId}`,
      type: "success",
      title: "Added to order",
      description: `${selection.drinkQty} × ${selection.name} (${selection.selectedVariant})`,
    });
    return true;
  };

  const handleUpdateQty = (cartId, newQty) => {
    if (newQty < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.cartId === cartId ? { ...item, qty: newQty } : item,
    );

    if (!hasEnoughInventoryStock(updatedCart)) return;
    setCartItems(updatedCart);
  };

  const canIncreaseCartItem = (cartId) => {
    const item = cartItems.find((cartItem) => cartItem.cartId === cartId);
    if (!item) return false;

    const updatedCart = cartItems.map((cartItem) =>
      cartItem.cartId === cartId
        ? { ...cartItem, qty: cartItem.qty + 1 }
        : cartItem,
    );

    return hasEnoughInventoryStock(updatedCart);
  };

  const handleRemoveItem = (cartId) => {
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAmountPaid("");
    pendingCheckoutIdRef.current = null;
  };

  const handleProcessOrder = async ({
    total,
    subtotal,
    discountAmount,
    change,
  }) => {
    if (isSyncing || isLoading) {
      setCheckoutError("Please wait while the menu and stock are refreshing.");
      return;
    }

    setCheckoutError("");
    setIsProcessingOrder(true);
    try {
      // Keep the same ID when an uncertain request needs to be retried.
      const clientTransactionId =
        pendingCheckoutIdRef.current || generateClientTransactionId();
      pendingCheckoutIdRef.current = clientTransactionId;

      const isCheckoutOnline = navigator.onLine;
      let transactionId = "";
      if (!isCheckoutOnline) {
        // Offline: Gamitin yung bago nating Utility function
        transactionId = generateOfflineTransactionId();
      } else {
        // Online: Ang Supabase Database ang bahalang mag-generate ng ORD-YYMMDD-XXXX nito
        transactionId = `SC-${Date.now().toString().slice(-6)}`;
      }

      const orderDetails = {
        transactionId,
        cashier_id: user?.id || null,
        cashier_name: profile
          ? `${profile.first_name} ${profile.last_name}`
          : "Cashier",
        cartItems: [...cartItems],
        orderSource,
        paymentMethod,
        discountType,
        subtotal,
        discountAmount,
        total,
        amountPaid:
          paymentMethod === "GCash" || paymentMethod === "External"
            ? total
            : parseFloat(amountPaid) || 0,
        change,
        date: new Date(),
      };

      // Use one Laravel checkout shape for immediate and queued orders.
      const checkoutPayload = {
        order: {
          ...(!isCheckoutOnline && { order_number: transactionId }),
          order_source: orderDetails.orderSource,
          payment_method: orderDetails.paymentMethod,
          discount_type: orderDetails.discountType,
          subtotal: orderDetails.subtotal,
          discount_amount: orderDetails.discountAmount,
          total: orderDetails.total,
          amount_paid: orderDetails.amountPaid,
          change_amount: orderDetails.change,
        },
        items: orderDetails.cartItems.map((item) => ({
          menu_item_id: item.productId.replace("p-", ""),
          price_id: item.priceId || null,
          quantity: item.qty,
          unit_price: item.price,
          subtotal: item.price * item.qty,
          addons: (item.addOns || []).map((addon) => ({
            addon_id: addon.id,
            quantity: addon.qty,
            price: addon.price,
          })),
        })),
        inventory_deductions: calculateInventoryDeductions(
          orderDetails.cartItems,
        ),
      };

      // Process online through Laravel or keep the existing offline flow.
      let result;
      if (isCheckoutOnline) {
        const response = await processOnlineCheckout(
          checkoutPayload,
          clientTransactionId,
        );

        // Prepare fresh related pages without delaying the receipt.
        Promise.allSettled([
          refreshInventoryManagement(),
          refreshAuditLogs(),
          refreshInventoryValuation(),
          refreshOrderManagement(),
          refreshSalesReport(),
        ]);

        result = {
          order_number: response.order.order_number,
        };
      } else {
        // --- OFFLINE MODE: Save to Dexie ---
        console.log("Offline Mode: Saving order to Dexie...");

        const offlinePayload = {
          client_transaction_id: clientTransactionId,
          offline_order_number: transactionId,
          checkout_payload: checkoutPayload,
          status: "pending_sync",
          sync_attempts: 0,
          last_error: null,
          created_at: new Date().toISOString(),
        };

        // Deduct local stock and queue the order in one transaction.
        await db.transaction(
          "rw",
          [db.inventoryStock, db.offlineOrders],
          async () => {
            for (const deduction of checkoutPayload.inventory_deductions) {
              const stock = await db.inventoryStock.get(
                deduction.inventory_item_id,
              );
              const currentStock = Number(stock?.current_stock) || 0;
              const usableStock =
                Number(stock?.usable_stock ?? stock?.current_stock) || 0;
              const quantityToDeduct = Number(deduction.quantity) || 0;

              if (!stock || usableStock < quantityToDeduct) {
                const itemName = stock
                  ? stock.item_name
                  : "an inventory ingredient";

                throw new Error(`Insufficient offline stock for ${itemName}.`);
              }

              await db.inventoryStock.update(deduction.inventory_item_id, {
                current_stock: Math.max(0, currentStock - quantityToDeduct),
                usable_stock: usableStock - quantityToDeduct,
              });
            }

            await db.offlineOrders.add(offlinePayload);
          },
        );

        // Return the local order number for the offline receipt.
        result = { order_number: transactionId };
      }

      // Show receipt modal only if successful (use the real DB-generated order number)
      setProcessedOrder({
        ...orderDetails,
        transactionId: result.order_number,
      });
    } catch (error) {
      console.error("Failed to process order:", error);
      setCheckoutError(
        error.message || "Unable to process the order. Please try again.",
      );
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleCloseReceipt = () => {
    setProcessedOrder(null);
    handleClearCart();
    setIsCartOpen(false);

    if (isOnline) {
      setIsLoading(true);
      refetchPosManagement();
    } else {
      loadMenu();
    }
  };

  // Recalculate product and variant availability against the current cart.
  const displayProducts = React.useMemo(() => {
    return getPOSDisplayProducts(posProducts, cartItems);
  }, [posProducts, cartItems]);

  const catalogGroups = React.useMemo(() => {
    return getPOSCatalogGroups(
      displayProducts,
      categories,
      activeCategory,
      searchTerm,
    );
  }, [activeCategory, categories, displayProducts, searchTerm]);

  const isPosBlocked = isSyncing || isProcessingOrder;
  let blockingTitle = "Processing Order...";
  let blockingMessage = "";

  if (isSyncing) {
    blockingTitle = "Syncing offline orders...";
    blockingMessage = "Refreshing menu and stock. Please wait.";
  }

  return (
    <section className="pos-page-shell bg-[var(--app-color-canvas)]">
      <PosBlockingLoader
        isVisible={isPosBlocked}
        title={blockingTitle}
        message={blockingMessage}
      />

      <CheckoutErrorBanner
        message={checkoutError}
        onClose={() => setCheckoutError("")}
      />

      <div
        className="pos-main-layout"
        role="region"
        aria-label="Point of sale workspace"
      >
        {/* Left Side: Products */}
        <POSCatalog
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          catalogGroups={catalogGroups}
          onAddToCart={handleModalAddToCart}
          allAddons={globalAddons}
          cartItems={cartItems}
          isLoading={isLoading}
          hasLoadedMenu={hasLoadedMenu}
        />
        {/* Right Side: Cart */}
        <aside
          aria-label="Current order"
          className={`pos-cart-sidebar-region max-sm:rounded-t-[var(--app-radius-panel-large)] ${isCartOpen ? "drawer-open" : ""}`}
        >
          <POSCartSidebar
            cartItems={cartItems}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            orderSource={orderSource}
            setOrderSource={setOrderSource}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            discountType={discountType}
            setDiscountType={setDiscountType}
            amountPaid={amountPaid}
            setAmountPaid={setAmountPaid}
            onProcessOrder={handleProcessOrder}
            canIncreaseQuantity={canIncreaseCartItem}
            isProcessingOrder={isProcessingOrder || isSyncing || isLoading}
            isLoading={!hasLoadedMenu && isLoading}
            setIsCartOpen={setIsCartOpen}
          />
        </aside>
      </div>

      {/* Phone: overlay backdrop when cart is open */}
      <div
        className={`pos-cart-overlay bg-black/40 ${isCartOpen ? "visible" : ""}`}
        aria-hidden="true"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Phone: floating action button to open cart */}
      <button
        type="button"
        className="pos-mobile-fab min-h-[var(--app-touch-target-min)] items-center gap-[var(--app-space-2)] rounded-full bg-[var(--app-color-brand)] px-[var(--app-space-6)] text-[length:var(--app-font-size-body-secondary)] font-semibold text-white shadow-[var(--app-shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
        aria-label={`Open current order, ${totalQty} items`}
        aria-expanded={isCartOpen}
        onClick={() => setIsCartOpen(true)}
      >
        <i className="bi bi-cart3"></i>
        <span>Cart</span>
        {totalQty > 0 && <span className="min-w-6 rounded-full bg-white/20 px-[var(--app-space-2)] text-center">{totalQty}</span>}
      </button>

      {/* Receipt Modal */}
      {processedOrder && (
        <ReceiptModal
          orderDetails={processedOrder}
          onClose={handleCloseReceipt}
        />
      )}
    </section>
  );
};

export default POSPage;
