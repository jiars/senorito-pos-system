const INVENTORY_CLEANUP_PENDING_KEY = "inventory_cleanup_pending_user";

// This only controls the popup; Laravel still controls access and daily cleanup.
export const markInventoryCleanupPending = (user) => {
  try {
    const role = user?.role?.role_name;

    if (user?.id && (role === "Owner" || role === "Inventory Clerk")) {
      sessionStorage.setItem(INVENTORY_CLEANUP_PENDING_KEY, user.id);
    } else {
      sessionStorage.removeItem(INVENTORY_CLEANUP_PENDING_KEY);
    }
  } catch (error) {
    // A browser storage restriction must not turn a successful login into failure.
    console.error("Error remembering the expiry popup:", error.message);
  }
};

export const isInventoryCleanupPending = (userId) => {
  try {
    return (
      Boolean(userId) &&
      sessionStorage.getItem(INVENTORY_CLEANUP_PENDING_KEY) === userId
    );
  } catch (error) {
    console.error("Error reading the expiry popup status:", error.message);
    return false;
  }
};

// Used after a successful logout, and later when the result modal is dismissed.
export const clearInventoryCleanupPending = () => {
  try {
    sessionStorage.removeItem(INVENTORY_CLEANUP_PENDING_KEY);
  } catch (error) {
    console.error("Error clearing the expiry popup status:", error.message);
  }
};
