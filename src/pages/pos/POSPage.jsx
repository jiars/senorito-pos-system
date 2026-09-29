import React, { useState } from "react";
import "./pos.css";

import CategoryScroller from "./components/CategoryScroller";
import ProductCard from "./components/ProductCard";
import ProductAreaLoader from "./components/ProductAreaLoader";
import PosBlockingLoader from "./components/PosBlockingLoader";
import CartSidebar from "./components/CartSidebar";
import CheckoutErrorBanner from "./components/CheckoutErrorBanner";
import CustomizeOrderModal from "./CustomizeOrderModal/CustomizeOrderModal";
import ReceiptModal from "./ReceiptModal/ReceiptModal";

// We will populate posProducts dynamically from the database!

import imgDefault from "../../assets/images/default_menu_picture.jpg";
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
import { formatCurrency } from "../../utils/currencyFormatters";
import {
  calculateInventoryDeductions,
  getRecipeAvailabilityStatus,
  hasEnoughInventoryStock,
} from "../../utils/pos/checkoutCalculations";
import { syncPendingOfflineOrders } from "../../services/pos/offlineOrderSyncService";

// Place the trusted usable stock inside every Menu and Add-on recipe.
const applyInventoryStock = (records, recipeKey, stockById) => {
  return records.map((record) => {
    const recipes = record[recipeKey] || [];

    return {
      ...record,
      [recipeKey]: recipes.map((recipe) => {
        const stock = stockById.get(recipe.inventory_item_id);
        let inventoryItem = recipe.inventory_items;

        if (inventoryItem) {
          inventoryItem = {
            ...inventoryItem,
            current_stock:
              Number(stock?.usable_stock ?? stock?.current_stock) || 0,
            usable_stock:
              Number(stock?.usable_stock ?? stock?.current_stock) || 0,
            minimum_level: Number(stock?.minimum_level) || 0,
            archived: Boolean(stock?.archived ?? inventoryItem.archived),
          };
        }

        return {
          ...recipe,
          inventory_items: inventoryItem,
        };
      }),
    };
  });
};

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

  // Customize Order Modal State
  const [customizingProduct, setCustomizingProduct] = useState(null);

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

          inventoryStockData = inventoryStockData.map((item) => ({
            id: item.id,
            item_name: item.item_name,
            base_unit: item.base_unit,
            current_stock: Number(item.current_stock) || 0,
            usable_stock:
              Number(item.usable_stock ?? item.current_stock) || 0,
            minimum_level: Number(item.minimum_level) || 0,
            archived: Boolean(item.archived),
          }));

          // Replace the complete refreshable cache together.
          await db.transaction(
            "rw",
            [db.menuItems, db.addons, db.categories, db.inventoryStock],
            async () => {
              await Promise.all([
                db.menuItems.clear(),
                db.addons.clear(),
                db.categories.clear(),
                db.inventoryStock.clear(),
              ]);

              if (data.length > 0) await db.menuItems.bulkPut(data);
              if (addonsData.length > 0) await db.addons.bulkPut(addonsData);
              if (categoriesData.length > 0) {
                await db.categories.bulkPut(categoriesData);
              }
              if (inventoryStockData.length > 0) {
                await db.inventoryStock.bulkPut(inventoryStockData);
              }
            },
          );

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

        const stockById = new Map();
        inventoryStockData.forEach((item) => {
          stockById.set(item.id, item);
        });

        const menuItemsWithStock = applyInventoryStock(
          data,
          "menu_recipes",
          stockById,
        );
        const addonsWithStock = applyInventoryStock(
          addonsData,
          "addon_recipes",
          stockById,
        );

        const categoryNames = [
          "All",
          ...categoriesData.map((c) => c.category_name),
        ];
        setCategories(categoryNames);

        setGlobalAddons(addonsWithStock);
        // Transform Laravel or cached data into the shape POSPage expects.
        const formattedProducts = menuItemsWithStock.map((item) => {
          let basePrice = 0;
          let displayPrice = formatCurrency(0);
          let variants = [];
          let defaultPriceId = null;
          let defaultVariantName = "Reg";
          let defaultPricePosStatus = "Available";
          let defaultRecipeStatus = "Incomplete";
          const itemPrices = (item.menu_prices || []).filter((price) => !price.archived);
          const itemRecipes = item.menu_recipes || [];

          if (itemPrices.length === 1) {
            const regularPriceObj = itemPrices[0];
            basePrice = Number(regularPriceObj?.selling_price) || 0;
            displayPrice = formatCurrency(basePrice);
            defaultPriceId = regularPriceObj?.id || null;
            defaultVariantName = regularPriceObj?.variant_name || "Reg";
            defaultPricePosStatus = regularPriceObj?.pos_status || "Available";
            defaultRecipeStatus =
              regularPriceObj?.recipe_status || "Incomplete";
          } else {
            // Sort variants by price (lowest to highest) for display
            const sortedPrices = [...itemPrices].sort(
              (a, b) => a.selling_price - b.selling_price,
            );
            if (sortedPrices.length > 0) {
              basePrice = sortedPrices[0].selling_price;
              const minPrice = Number(sortedPrices[0].selling_price) || 0;
              const maxPrice =
                Number(sortedPrices[sortedPrices.length - 1].selling_price) ||
                0;

              if (minPrice === maxPrice) {
                displayPrice = formatCurrency(minPrice);
              } else {
                displayPrice = `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
              }

              variants = sortedPrices.map((p) => ({
                id: p.id,
                name: p.variant_name,
                price: Number(p.selling_price) || 0,
                posStatus: p.pos_status || "Unavailable",
                recipeStatus: p.recipe_status || "Incomplete",
              }));
            }
          }

          return {
            id: `p-${item.id}`,
            name: item.item_name,
            category: item.menu_categories?.category_name || "Uncategorized",
            categoryId: item.category_id,
            price: displayPrice,
            basePrice,
            defaultPriceId,
            defaultVariantName,
            defaultPricePosStatus,
            defaultRecipeStatus,
            posStatus: item.pos_status,
            imageURL: item.image_url || imgDefault,
            variants,
            rawRecipes: itemRecipes,
            isAvailable: item.pos_status === "Available" && !item.archived && itemPrices.length > 0,
          };
        });

        // Sort: Alphabetical, but Unavailable items always at the very end
        formattedProducts.sort((a, b) => {
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          return a.name.localeCompare(b.name);
        });

        setPosProducts(formattedProducts);
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
  const handleAddToCart = (product) => {
    if (isSyncing || isLoading) return;
    if (!product.isAvailable) return;

    // ALWAYS open the customization modal so they can add add-ons or adjust quantity
    setCustomizingProduct(product);
  };

  const handleModalAddToCart = (customizedData) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => {
        if (item.productId !== customizedData.id) return false;
        if (item.variant !== customizedData.selectedVariant) return false;
        if (item.addOns.length !== customizedData.selectedAddOns.length)
          return false;

        // Check if add-ons match exactly
        return customizedData.selectedAddOns.every((newAo) =>
          item.addOns.some(
            (existAo) =>
              existAo.name === newAo.name && existAo.qty === newAo.qty,
          ),
        );
      });

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: updated[existingIdx].qty + customizedData.drinkQty,
        };

        if (!hasEnoughInventoryStock(updated)) return prev;
        return updated;
      }

      const cartId = `${customizedData.id}-${Date.now()}`;
      const newItem = {
        cartId,
        productId: customizedData.id,
        priceId: customizedData.selectedVariantId || null,
        name: customizedData.name,
        variant: customizedData.selectedVariant,
        price: customizedData.totalPrice, // Base + Add-ons price
        basePrice: customizedData.basePrice || customizedData.totalPrice,
        qty: customizedData.drinkQty,
        addOns: customizedData.selectedAddOns,
        recipeIngredients:
          customizedData.rawRecipes?.filter(
            (r) =>
              r.menu_item_price_id === customizedData.selectedVariantId ||
              r.menu_item_price_id === null,
          ) || [],
      };
      const updated = [...prev, newItem];
      if (!hasEnoughInventoryStock(updated)) return prev;

      return updated;
    });
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
    if (!posProducts || posProducts.length === 0) return [];

    return posProducts.map((product) => {
      const variants = product.variants.map((variant) => {
        const recipes = product.rawRecipes.filter(
          (recipe) =>
            recipe.menu_item_price_id === variant.id ||
            recipe.menu_item_price_id === null,
        );

        const availability = getRecipeAvailabilityStatus({
          recipes,
          cartItems,
          posStatus:
            product.posStatus === "Available"
              ? variant.posStatus
              : "Unavailable",
          recipeStatus: variant.recipeStatus,
        });

        return {
          ...variant,
          ...availability,
        };
      });

      let availability;

      if (variants.length > 0) {
        availability =
          variants.find((variant) => variant.status === "Available") ||
          variants.find((variant) => variant.isAvailable) ||
          variants[0];
      } else {
        const recipes = product.rawRecipes.filter(
          (recipe) =>
            recipe.menu_item_price_id === product.defaultPriceId ||
            recipe.menu_item_price_id === null,
        );

        availability = getRecipeAvailabilityStatus({
          recipes,
          cartItems,
          posStatus:
            product.posStatus === "Available"
              ? product.defaultPricePosStatus
              : "Unavailable",
          recipeStatus: product.defaultRecipeStatus,
        });
      }

      return {
        ...product,
        variants,
        status: availability.status,
        isAvailable: availability.isAvailable,
        blockingIngredients: availability.blockingIngredients,
        lowStockIngredients: availability.lowStockIngredients,
      };
    });
  }, [posProducts, cartItems]);

  const isPosBlocked = isSyncing || isProcessingOrder;
  let blockingTitle = "Processing Order...";
  let blockingMessage = "";

  if (isSyncing) {
    blockingTitle = "Syncing offline orders...";
    blockingMessage = "Refreshing menu and stock. Please wait.";
  }

  return (
    <div className="pos-container">
      <PosBlockingLoader
        isVisible={isPosBlocked}
        title={blockingTitle}
        message={blockingMessage}
      />

      <CheckoutErrorBanner
        message={checkoutError}
        onClose={() => setCheckoutError("")}
      />

      <div className="pos-main-wrapper">
        {/* Left Side: Products */}
        <div className="pos-content-left">
          <div className="pos-search-wrapper">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="pos-search-input"
              placeholder="Search item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="pos-product-browser">
            {!hasLoadedMenu && isLoading ? (
              <ProductAreaLoader label="Loading menu..." />
            ) : (
              <>
                <CategoryScroller
                  categories={categories}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                />

                <div className="pos-product-grid">
                  {displayProducts.filter(
                    (p) =>
                      activeCategory === "All" || p.category === activeCategory,
                  ).length === 0 ? (
                    <div className="pos-product-empty">
                      No available items found.
                    </div>
                  ) : (
                    displayProducts
                      .filter(
                        (p) =>
                          activeCategory === "All" ||
                          p.category === activeCategory,
                      )
                      .filter((p) =>
                        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onAdd={handleAddToCart}
                        />
                      ))
                  )}
                </div>

                {isLoading && (
                  <ProductAreaLoader label="Refreshing menu..." overlay />
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Side: Cart */}
        <CartSidebar
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
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
        />
      </div>

      {/* Phone: overlay backdrop when cart is open */}
      <div
        className={`pos-cart-overlay ${isCartOpen ? "visible" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Phone: floating action button to open cart */}
      <button className="pos-mobile-fab" onClick={() => setIsCartOpen(true)}>
        <i className="bi bi-cart3"></i>
        <span>Cart</span>
        {totalQty > 0 && <span className="pos-fab-badge">{totalQty}</span>}
      </button>

      {/* Customize Order Modal */}
      {customizingProduct && (
        <CustomizeOrderModal
          product={customizingProduct}
          allAddons={globalAddons}
          cartItems={cartItems}
          onClose={() => setCustomizingProduct(null)}
          onAddToCart={handleModalAddToCart}
        />
      )}

      {/* Receipt Modal */}
      {processedOrder && (
        <ReceiptModal
          orderDetails={processedOrder}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
};

export default POSPage;
