// Choose one visible status without changing orders or sending requests.
export function getSyncStatus(state = {}) {
  // A failed local check must never appear as Synced.
  if (state.queueReadFailed || state.syncFailed)
    return { key: "needs_attention", label: "Needs attention" };

  if (state.isChecking !== false)
    return { key: "checking", label: "Checking…" };

  if (!state.isOnline) {
    let label = "Offline";

    if (state.pendingCount > 0)
      label = `Offline · ${state.pendingCount} pending`;

    return { key: "offline", label };
  }

  if (state.isSyncing) return { key: "syncing", label: "Syncing…" };

  if (state.signInRequired)
    return { key: "sign_in_required", label: "Sign in required" };

  if (state.refreshFailed || state.refreshRequired)
    return { key: "needs_attention", label: "Needs attention" };

  if (state.connectionIssue)
    return { key: "connection_issue", label: "Connection issue" };

  if (state.attentionCount > 0)
    return {
      key: "needs_attention",
      label: `Needs attention · ${state.attentionCount}`,
    };

  if (state.pendingCount > 0)
    return {
      key: "pending",
      label: `Pending · ${state.pendingCount}`,
    };

  if (state.hasOtherOrders)
    return { key: "needs_attention", label: "Needs attention" };

  return { key: "online", label: "Online" };
}

// Count saved orders without modifying their stored status.
export function summarizeOfflineQueue(orders, cashierId) {
  const summary = {
    pendingCount: 0,
    attentionCount: 0,
    awaitingAuthCount: 0,
    otherCashierCount: 0,
    unknownOwnerCount: 0,
    connectionFailureCount: 0,
    pendingOrders: [],
    attentionOrders: [],
  };

  const pendingStatuses = [
    "pending_sync",
    "failed",
    "syncing",
    "awaiting_auth",
  ];

  for (const order of orders) {
    // Never assume an unidentified order belongs to the current cashier.
    if (!order.cashier_id) {
      summary.unknownOwnerCount++;
      continue;
    }

    if (order.cashier_id !== cashierId) {
      summary.otherCashierCount++;
      continue;
    }

    // Expose only the fields needed by the read-only order lists.
    const orderDetails = {
      id: order.id,
      orderNumber: order.offline_order_number || `Local order #${order.id}`,
      status: order.status,
      lastError: order.last_error || null,
      lastErrorStatus: order.last_error_status || null,
    };

    const hasRequiredPayload =
      order.checkout_payload && order.client_transaction_id;

    if (!hasRequiredPayload || !pendingStatuses.includes(order.status)) {
      summary.attentionCount++;
      summary.attentionOrders.push(orderDetails);
      continue;
    }

    summary.pendingCount++;
    summary.pendingOrders.push(orderDetails);

    if (order.status === "failed") summary.connectionFailureCount++;

    if (order.status === "awaiting_auth") summary.awaitingAuthCount++;
  }

  return summary;
}

// Combine observed information; never upload or change stored orders.
export function buildSyncStatusInput({ isBrowserOnline, queue, sync }) {
  const summary = queue.summary;

  const state = {
    isOnline: isBrowserOnline,
    isChecking: queue.isChecking || !summary,
    queueReadFailed: queue.queueReadFailed,
    isSyncing: sync.isSyncing || sync.isRefreshing,
    refreshFailed: sync.refreshFailed,
    refreshRequired: false,
    syncFailed: false,
    signInRequired: false,
    connectionIssue: false,
    pendingCount: 0,
    attentionCount: 0,
    hasOtherOrders: false,
  };

  if (summary) {
    state.pendingCount = summary.pendingCount;
    state.attentionCount = summary.attentionCount;
    state.signInRequired = summary.awaitingAuthCount > 0;
    state.connectionIssue = summary.connectionFailureCount > 0;
    state.refreshRequired = summary.refreshRequired === true;

    // Do not claim this device is fully synced while other orders remain.
    state.hasOtherOrders =
      summary.otherCashierCount > 0 || summary.unknownOwnerCount > 0;
  }

  if (sync.latestSync && sync.latestSync.status === "error") {
    // A refresh started after this upload is tracked separately.
    // Its successful retry must not leave the old upload error displayed.
    const hasFollowingRefresh =
      sync.latestRefresh &&
      sync.latestRefresh.submittedAt >= sync.latestSync.submittedAt;

    state.syncFailed = !hasFollowingRefresh;
  }

  return state;
}
