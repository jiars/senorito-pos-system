export const filterAndSortMenuItems = ({
  items = [],
  searchTerm = "",
  categories = [],
  statuses = [],
  sort = "0-z",
}) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    const itemName = String(item.item_name || "").toLowerCase();
    const categoryName = String(
      item.menu_categories?.category_name || "",
    ).toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 ||
      itemName.includes(normalizedSearch) ||
      categoryName.includes(normalizedSearch);

    const matchesCategory =
      categories.length === 0 ||
      categories.includes(item.menu_categories?.category_name);

    const matchesStatus =
      statuses.length === 0 || statuses.includes(item.pos_status);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return [...filteredItems].sort((firstItem, secondItem) => {
    const firstName = String(firstItem.item_name || "");
    const secondName = String(secondItem.item_name || "");

    const comparison = firstName.localeCompare(secondName, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return sort === "z-0" ? -comparison : comparison;
  });
};

export const filterAndSortAddons = ({
  items = [],
  searchTerm = "",
  categories = [],
  statuses = [],
  sort = "0-z",
}) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredItems = items.filter((item) => {
    const addonName = String(item.addon_name || "").toLowerCase();

    const categoryNames = (item.addon_categories || [])
      .map((entry) => entry.menu_categories?.category_name)
      .filter(Boolean);

    const searchableCategories = categoryNames.join(" ").toLowerCase();

    const matchesSearch =
      normalizedSearch.length === 0 ||
      addonName.includes(normalizedSearch) ||
      searchableCategories.includes(normalizedSearch);

    const matchesCategory =
      categories.length === 0 ||
      categoryNames.some((categoryName) => categories.includes(categoryName));

    const matchesStatus =
      statuses.length === 0 || statuses.includes(item.pos_status);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return [...filteredItems].sort((firstItem, secondItem) => {
    const firstName = String(firstItem.addon_name || "");
    const secondName = String(secondItem.addon_name || "");

    const comparison = firstName.localeCompare(secondName, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return sort === "z-0" ? -comparison : comparison;
  });
};
