export const getInventoryItemQrUrl = (itemId, origin) => {
  const url = new URL("/inventory", origin);
  url.searchParams.set("action", "restock");
  url.searchParams.set("item_id", itemId);
  return url.toString();
};

export const getInventoryQrRequest = (searchParams) => {
  const action = searchParams.get("action");
  if (action === "restock") {
    return { itemId: searchParams.get("item_id") || "" };
  }
  // Existing printed item labels can still open Restock.
  if (action === "view_item") {
    return { itemId: searchParams.get("id") || "" };
  }
  return null;
};

export const clearInventoryQrRequest = (searchParams) => {
  const nextParams = new URLSearchParams(searchParams);
  const action = nextParams.get("action");
  if (!getInventoryQrRequest(nextParams)) return nextParams;

  nextParams.delete("action");
  if (action === "view_item") {
    nextParams.delete("id");
  } else {
    nextParams.delete("item_id");
  }
  return nextParams;
};

export const getInventoryQrPrintSheets = (items) => {
  const sheets = [];
  // Three columns and four rows on each Letter sheet.
  for (let index = 0; index < items.length; index += 12) {
    sheets.push(items.slice(index, index + 12));
  }
  return sheets;
};

export const getInventoryQrLogoSettings = (size) => {
  return {
    src: "/smoke.png",
    width: size * 0.2,
    height: size * 0.2,
    // Clear only the small logo area; keep the outer QR quiet zone intact.
    excavate: true,
  };
};
