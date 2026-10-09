import { getInventoryQrRequest } from "@/utils/inventory/inventoryQr";

// Only accept the supported internal QR destination, never an arbitrary URL.
export const getInventoryQrReturnPath = (value) => {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "";

  let url;
  try {
    url = new URL(value, window.location.origin);
  } catch {
    return "";
  }
  if (url.origin !== window.location.origin || url.pathname !== "/inventory") return "";

  const request = getInventoryQrRequest(url.searchParams);
  if (!request) return "";

  // Rebuild the link from known fields; ignore unrelated redirect parameters.
  const params = new URLSearchParams();
  const action = url.searchParams.get("action");
  params.set("action", action);
  params.set(action === "view_item" ? "id" : "item_id", request.itemId);
  return `/inventory?${params.toString()}`;
};
