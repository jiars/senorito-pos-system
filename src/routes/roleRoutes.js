export const ROLE_ROUTES = {
    owner: [
        "/dashboard",
        "/pos",
        "/orders",
        "/inventory",
        "/inventory/valuation",
        "/inventory/audit",
        "/reports/sales",
        "/expenses",
        "/menu",
        "/profile"
    ],

    inventory_clerk: [
        "/dashboard",
        "/inventory",
        "/inventory/valuation",
        "/inventory/audit",
        "/profile"
    ],

    cashier: [
        "/dashboard",
        "/pos",
        "/orders",
        "/profile"
    ]
};
