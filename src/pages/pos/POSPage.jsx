import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import "./pos.css";

import POSCatalog from "./components/POSCatalog";
import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
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
import { useOfflineSync } from "../../hooks/sync/useOfflineSync";
import { useBrowserOnline } from "../../hooks/sync/useBrowserOnline";
import { buildPOSCartWithItem } from "@/utils/pos/posCartUtils";
import { toast } from "@/components/ui/toast";
import {
  POS_FEEDBACK,
  getPOSAddedDescription,
  getPOSStatusFeedback,
  getPOSToastFeedback,
} from "@/utils/pos/posFeedback";
import {
  savePosManagementCache,
  readPOSRefreshState,
  completePOSRefresh,
} from "../../services/pos/posCacheService";
import {
  preparePOSCatalog,
  getPOSDisplayProducts,
  getPOSCatalogGroups,
} from "../../utils/pos/posCatalogUtils";

const POSPage = () => {
  const { user, profile } = React.useContext(AuthContext);
  const cashierId = user ? user.id : null;
  const isOnline = useBrowserOnline();
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
  const [orderRefreshStatus, setOrderRefreshStatus] = useState("idle");
  const [hasLoadedMenu, setHasLoadedMenu] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
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
  const checkoutInFlightRef = React.useRef(false);
  const syncInFlightRef = React.useRef(false);
  const savedOrderRefreshRef = React.useRef(null);
  const orderRefreshRequestRef = React.useRef(null);
  const syncCompletionRef = React.useRef(null);
  const syncRefreshRequiredRef = React.useRef(false);
  const syncRefreshPromiseRef = React.useRef(null);
  const recoveryCheckPromiseRef = React.useRef(null);

  React.useEffect(
    () => () => {
      orderRefreshRequestRef.current = null;
    },
    [],
  );

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // The mutation tracks the real cache operation, including offline reads.
  const { mutateAsync: prepareMenu, isPending: isMenuLoading } = useMutation({
    networkMode: "always",
    retry: false,
    mutationFn: async ({ freshPosData, menuSource }) => {
      let data, addonsData, categoriesData, inventoryStockData;
      const hasFreshPosData = freshPosData !== null;
      const shouldLoadOnlineData = menuSource.isOnline || hasFreshPosData;

      if (shouldLoadOnlineData) {
        if (!hasFreshPosData && menuSource.error) {
          throw new Error(menuSource.error);
        }

        if (hasFreshPosData) {
          data = freshPosData.items || [];
          addonsData = freshPosData.addons || [];
          categoriesData = freshPosData.categories || [];
          inventoryStockData = freshPosData.inventory_stock || [];
        } else {
          data = menuSource.items;
          addonsData = menuSource.addons;
          categoriesData = menuSource.categories;
          inventoryStockData = menuSource.inventory_stock;
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

      return preparePOSCatalog(
        data,
        addonsData,
        categoriesData,
        inventoryStockData,
      );
    },
    onSuccess: (catalog) => {
      setGlobalAddons(catalog.addons);
      setCategories(catalog.categories);
      setPosProducts(catalog.products);
    },
    onError: (error, variables) => {
      console.error("Failed to load menu for POS:", error);
      if (variables.notifyError) alert("Error loading menu: " + error.message);
    },
    onSettled: () => {
      setHasLoadedMenu(true);
    },
  });

  const loadMenu = React.useCallback(
    async (
      freshPosData = null,
      { notifyError = true, loadOnline = isOnline } = {},
    ) => {
      try {
        await prepareMenu({
          freshPosData,
          notifyError,
          menuSource: {
            isOnline: loadOnline,
            items: menuItems,
            addons,
            categories: posCategories,
            inventory_stock: posInventoryStock,
            error: posDataError,
          },
        });
        return true;
      } catch {
        // The mutation's onError callback already handles the error.
        return false;
      }
    },
    [
      addons,
      isOnline,
      menuItems,
      posCategories,
      posDataError,
      posInventoryStock,
      prepareMenu,
    ],
  );

  // Retrying this operation only reloads data; it never submits orders.
  const {
    mutateAsync: refreshSyncData,
    isPending: isSyncRefreshPending,
    isError: hasSyncRefreshFailed,
  } = useMutation({
    mutationKey: ["offline-sync-refresh"],
    networkMode: "always",
    retry: false,
    mutationFn: async () => {
      if (!navigator.onLine) throw new Error(POS_FEEDBACK.ORDER_REFRESH_FAILED);

      // Capture the reminder before fetching; newer uploads need a newer refresh.
      const refreshState = await readPOSRefreshState();
      const freshPosResult = await refetchPosManagement();
      if (freshPosResult.error || !freshPosResult.data) {
        throw freshPosResult.error || new Error(POS_FEEDBACK.ORDER_REFRESH_FAILED);
      }

      const refreshed = await loadMenu(freshPosResult.data, {
        notifyError: false,
        loadOnline: true,
      });
      if (!refreshed) throw new Error(POS_FEEDBACK.ORDER_REFRESH_FAILED);

      // Keep recovery locked if preparation or clearing the reminder fails.
      const completed = await completePOSRefresh(refreshState.revision);
      if (!completed) throw new Error(POS_FEEDBACK.ORDER_REFRESH_FAILED);

      // Confirmation is allowed only after an accepted upload's refresh succeeds.
      return {
        refreshedSavedOrders: refreshState.required === true,
        completedAt: Date.now(),
      };
    },
    onSuccess: () => {
      syncRefreshRequiredRef.current = false;
    },
    onError: (error) => {
      console.error("Orders uploaded, but POS refresh failed:", error);
    },
  });

  const requestSyncRefresh = React.useCallback(() => {
    if (syncRefreshPromiseRef.current) return syncRefreshPromiseRef.current;

    syncRefreshRequiredRef.current = true;
    const completion = refreshSyncData(cashierId).finally(() => {
      syncRefreshPromiseRef.current = null;
    });
    syncRefreshPromiseRef.current = completion;
    return completion;
  }, [cashierId, refreshSyncData]);

  // Reopen unfinished recovery before normal cache work or checkout can run.
  const {
    mutateAsync: restorePOSReadiness,
    data: restoredCashierId,
    isSuccess: hasRestoredPOS,
    isError: hasRecoveryCheckFailed,
    error: recoveryCheckError,
  } = useMutation({
    networkMode: "always",
    retry: false,
    mutationFn: async (currentCashierId) => {
      const refreshState = await readPOSRefreshState();
      if (refreshState.required || syncRefreshRequiredRef.current) {
        await requestSyncRefresh();
      }
      return currentCashierId;
    },
  });

  const isRecoveryReady = hasRestoredPOS && restoredCashierId === cashierId;

  const requestPOSRecovery = React.useCallback(() => {
    if (recoveryCheckPromiseRef.current) return recoveryCheckPromiseRef.current;

    const completion = restorePOSReadiness(cashierId).finally(() => {
      recoveryCheckPromiseRef.current = null;
    });
    recoveryCheckPromiseRef.current = completion;
    return completion;
  }, [cashierId, restorePOSReadiness]);

  const onRecoveryRequested = React.useEffectEvent(() => {
    if (!cashierId || isRecoveryReady) return;
    // The mutation retains failures so the existing dialog can offer a retry.
    requestPOSRecovery().catch(() => {});
  });

  React.useEffect(() => {
    onRecoveryRequested();
    window.addEventListener("online", onRecoveryRequested);
    return () => window.removeEventListener("online", onRecoveryRequested);
  }, [cashierId]);

  // Failed refreshes remain blocking even after the upload mutation settles.
  const isAwaitingSyncRefresh = isSyncRefreshPending || hasSyncRefreshFailed;
  // A failed required refresh stays locked until an explicit retry succeeds.
  const isAwaitingOrderRefresh = orderRefreshStatus !== "idle";
  const hasOrderRefreshFailed = orderRefreshStatus === "failed";
  // Initial loading, cache work, and post-order refresh all block checkout.
  const isLoading =
    !isRecoveryReady ||
    !hasLoadedMenu ||
    isMenuLoading ||
    isAwaitingSyncRefresh ||
    isAwaitingOrderRefresh ||
    (isOnline && isPosDataLoading);

  React.useEffect(() => {
    // Receipt/sync recovery owns preparation after a saved order. Do not start
    // another cache write from the refetch's query update or reconnect event.
    if (
      !isRecoveryReady ||
      savedOrderRefreshRef.current ||
      syncRefreshRequiredRef.current ||
      (isOnline && isPosDataLoading)
    ) {
      return;
    }

    loadMenu();
  }, [isOnline, isPosDataLoading, isRecoveryReady, loadMenu]);

  // Pending remains true until the upload and required refresh finish.
  const { mutateAsync: syncOfflineOrders, isPending: isSyncing } =
    useOfflineSync({
      onSuccess: async (result) => {
        if (result.failed > 0) {
          setCheckoutError(
            `${result.failed} offline order(s) could not be synchronized.`,
          );
        }

        if (result.synced > 0) {
          // Keep the POS locked until the required refresh actually succeeds.
          await requestSyncRefresh();

          console.log(
            `Successfully auto-synced ${result.synced} offline orders!`,
          );

          // Refresh secondary pages without delaying the refreshed POS.
          Promise.allSettled([
            refreshInventoryManagement(),
            refreshAuditLogs(),
            refreshInventoryValuation(),
            refreshOrderManagement(),
            refreshSalesReport(),
          ]);
        }
      },
      onError: (error) => {
        // The blocking refresh dialog owns recovery for already-saved orders.
        if (syncRefreshRequiredRef.current) return;
        setCheckoutError(
          error.message || "Unable to synchronize offline orders.",
        );
      },
      onSettled: () => {
        syncInFlightRef.current = false;
      },
    });

  // Read the latest callbacks without syncing again when menu data changes.
  const onSyncRequested = React.useEffectEvent(() => {
    if (
      !navigator.onLine ||
      !cashierId ||
      !isRecoveryReady ||
      syncInFlightRef.current ||
      syncRefreshRequiredRef.current
    ) {
      return;
    }
    syncInFlightRef.current = true;
    // Receipt refresh can await an already-running sync without starting
    // another upload. Existing mutation callbacks still own sync errors.
    syncCompletionRef.current = syncOfflineOrders(cashierId).catch(() => {});
  });

  React.useEffect(() => {
    if (!cashierId || !isRecoveryReady) return;

    // 1. Run sync immediately in case they just opened the app with internet
    onSyncRequested();

    // 2. Listen for when internet comes back online
    window.addEventListener("online", onSyncRequested);

    return () => {
      window.removeEventListener("online", onSyncRequested);
    };
  }, [cashierId, isRecoveryReady]);

  // Cart Actions
  const handleModalAddToCart = (selection) => {
    if (
      !isRecoveryReady ||
      checkoutInFlightRef.current ||
      savedOrderRefreshRef.current ||
      syncRefreshRequiredRef.current
    )
      return false;
    const cartId = `${selection.id}-${Date.now()}`;
    const updatedCart = buildPOSCartWithItem(cartItems, selection, cartId);
    const stockStatus = getInventoryStockStatus(updatedCart);

    if (!stockStatus.hasEnoughStock) {
      toast.add({
        id: `pos-cart-${selection.id}-${selection.selectedVariantId}`,
        type: "warning",
        title: POS_FEEDBACK.CART_STOCK_TITLE,
        description: POS_FEEDBACK.CART_STOCK_DESCRIPTION,
      });
      return false;
    }

    setCartItems(updatedCart);
    toast.add({
      id: `pos-cart-${selection.id}-${selection.selectedVariantId}`,
      type: "success",
      title: POS_FEEDBACK.ADDED_TO_ORDER,
      description: getPOSAddedDescription(selection),
    });
    return true;
  };

  const handleUpdateQty = (cartId, newQty) => {
    if (
      !isRecoveryReady ||
      checkoutInFlightRef.current ||
      savedOrderRefreshRef.current ||
      syncRefreshRequiredRef.current
    ) return;
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
    if (
      !isRecoveryReady ||
      checkoutInFlightRef.current ||
      savedOrderRefreshRef.current ||
      syncRefreshRequiredRef.current
    ) return;
    setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    if (
      !isRecoveryReady ||
      checkoutInFlightRef.current ||
      savedOrderRefreshRef.current ||
      syncRefreshRequiredRef.current
    ) return;
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
    // A ref blocks repeat clicks before React renders the disabled controls.
    if (
      checkoutInFlightRef.current ||
      savedOrderRefreshRef.current ||
      syncRefreshRequiredRef.current ||
      processedOrder ||
      cartItems.length === 0
    )
      return;
    if (isSyncing || isLoading) {
      setCheckoutError(POS_FEEDBACK.CHECKOUT_REFRESHING);
      return;
    }

    checkoutInFlightRef.current = true;
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
          cashier_id: user.id,
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
      savedOrderRefreshRef.current = {
        transactionId: result.order_number,
        requiresOnline: isCheckoutOnline,
      };
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
      checkoutInFlightRef.current = false;
      setIsProcessingOrder(false);
    }
  };

  const refreshAfterOrder = async () => {
    const savedOrder = savedOrderRefreshRef.current;
    if (!savedOrder || orderRefreshRequestRef.current) return;
    const request = {};
    orderRefreshRequestRef.current = request;
    setOrderRefreshStatus("pending");

    try {
      // A reconnect may already be uploading offline orders and rebuilding
      // stock. Let that finish before preparing the next order's catalog.
      await syncCompletionRef.current;
      if (orderRefreshRequestRef.current !== request) return;
      if (syncRefreshRequiredRef.current) {
        // An accepted upload requires a fresh server read, even for an
        // originally offline receipt. Never unlock using its old local cache.
        await requestSyncRefresh();
      }
      if (orderRefreshRequestRef.current !== request) return;
      const loadOnline = navigator.onLine;
      // Never unlock with a pre-sale offline cache after an online checkout.
      if (savedOrder.requiresOnline && !loadOnline) {
        throw new Error(POS_FEEDBACK.ORDER_REFRESH_FAILED);
      }
      let freshData = null;
      if (loadOnline) {
        const result = await refetchPosManagement();
        if (result.error || !result.data) {
          throw result.error || new Error(POS_FEEDBACK.ORDER_REFRESH_FAILED);
        }
        freshData = result.data;
      }
      if (orderRefreshRequestRef.current !== request) return;
      const refreshed = await loadMenu(freshData, {
        notifyError: false,
        loadOnline,
      });
      if (!refreshed) throw new Error(POS_FEEDBACK.ORDER_REFRESH_FAILED);
      if (orderRefreshRequestRef.current !== request) return;
      savedOrderRefreshRef.current = null;
      setOrderRefreshStatus("idle");
      toast.add({
        id: `pos-order-refresh-${savedOrder.transactionId}`,
        ...getPOSToastFeedback("ORDER_REFRESH_READY"),
      });
    } catch (error) {
      if (orderRefreshRequestRef.current !== request) return;
      console.error("Order saved, but POS refresh failed:", error);
      setOrderRefreshStatus("failed");
    } finally {
      if (orderRefreshRequestRef.current === request) {
        orderRefreshRequestRef.current = null;
      }
    }
  };

  const handleRetrySyncRefresh = async () => {
    try {
      if (!isRecoveryReady) {
        await requestPOSRecovery();
      } else {
        await requestSyncRefresh();
      }
      // A closed receipt may also have been waiting for this same recovery.
      if (savedOrderRefreshRef.current && !processedOrder) {
        await refreshAfterOrder();
      }
    } catch {
      // The refresh mutation keeps the error dialog and checkout lock active.
    }
  };

  const handleCloseReceipt = () => {
    if (!processedOrder || orderRefreshRequestRef.current) return;
    setProcessedOrder(null);
    // Clear the completed cart once; retries only refresh data.
    setCartItems([]);
    setAmountPaid("");
    pendingCheckoutIdRef.current = null;
    setIsCartOpen(false);
    refreshAfterOrder();
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

  // Keep a single dialog open until all active blocking operations have finished.
  let blockingFeedback = null;
  if (isProcessingOrder) {
    blockingFeedback = getPOSStatusFeedback("ORDER_PROCESSING");
  } else if (isSyncing) {
    // The sync mutation stays pending while its final refresh runs.
    blockingFeedback = getPOSStatusFeedback(
      isSyncRefreshPending ? "POS_REFRESHING" : "ORDERS_SYNCING",
    );
  } else if (isAwaitingSyncRefresh) {
    blockingFeedback = getPOSStatusFeedback(
      hasSyncRefreshFailed ? "ORDER_REFRESH_FAILED" : "POS_REFRESHING",
    );
  } else if (hasRecoveryCheckFailed) {
    // A failed storage inspection must not claim the menu is safe to use.
    blockingFeedback = {
      ...getPOSStatusFeedback("ORDER_REFRESH_FAILED"),
      message: recoveryCheckError.message,
    };
  } else if (isAwaitingOrderRefresh) {
    blockingFeedback = getPOSStatusFeedback(
      hasOrderRefreshFailed ? "ORDER_REFRESH_FAILED" : "ORDER_REFRESH_PENDING",
    );
  }

  return (
    <section className="pos-page-shell bg-[var(--app-color-canvas)]">
      <BlockingFeedback
        open={Boolean(blockingFeedback)}
        title={blockingFeedback ? blockingFeedback.title : ""}
        message={blockingFeedback ? blockingFeedback.message : ""}
        status={blockingFeedback?.type === "critical" ? "error" : "loading"}
        action={
          blockingFeedback?.type === "critical"
            ? {
                label: blockingFeedback.buttonLabel,
                onClick: hasSyncRefreshFailed || hasRecoveryCheckFailed
                  ? handleRetrySyncRefresh
                  : refreshAfterOrder,
              }
            : undefined
        }
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
          isOrderLocked={
            !isRecoveryReady ||
            isProcessingOrder ||
            isAwaitingOrderRefresh ||
            isSyncing ||
            isAwaitingSyncRefresh
          }
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
            isProcessingOrder={isProcessingOrder}
            isCheckoutBlocked={isSyncing || isLoading}
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
        {totalQty > 0 && (
          <span className="min-w-6 rounded-full bg-white/20 px-[var(--app-space-2)] text-center">
            {totalQty}
          </span>
        )}
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
