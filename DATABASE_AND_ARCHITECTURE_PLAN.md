# Senorito POS System — Complete Database Schema & Architecture Plan

## 1. Executive Summary
This document serves as the master specification for the **Senorito POS System** database architecture and frontend domain-driven service structure. It outlines the exact schema across all tables and establishes clean, college-student-friendly separation of concerns (`cba` - Component-Based Architecture and 1-Entity-per-Service organization).

---

## 2. Complete Database Schema (PostgreSQL / Supabase)

### A. Users & Authentication Domain
#### `users`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Supabase Auth user / employee ID |
| `username` | `text` (UNIQUE) | Login username |
| `password_hash` | `text` | Never store plain text passwords |
| `first_name` | `text` | First name |
| `last_name` | `text` | Last name |
| `email` | `text` | Contact email |
| `contact_number` | `text` | Phone number |
| `role_id` | `uuid` (FK) | References `roles(id)` |
| `status` | `text` | `active` / `deactivated` |
| `created_at` | `timestamp` | Record creation timestamp |

#### `roles`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Role ID |
| `role_name` | `text` | e.g., `Admin`, `Cashier`, `Manager` |

---

### B. Inventory & Stock Management Domain
#### `inventory_categories`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Category ID |
| `category_name` | `text` | e.g., `Dairy`, `Syrups`, `Packaging`, `Coffee Beans` |
| `archived` | `boolean` | Soft delete flag (default `false`) |

#### `inventory_items`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Inventory Item ID |
| `qr_code` | `text` (UNIQUE) | Barcode / QR tracking code |
| `item_name` | `text` | e.g., `Whole Milk`, `Espresso Beans`, `22oz Cup` |
| `category_id` | `uuid` (FK) | References `inventory_categories(id)` |
| `base_unit` | `text` | e.g., `ml`, `g`, `pc` |
| `minimum_level` | `decimal` | Reorder alert threshold |
| `supplier` | `text` | Default supplier name |
| `cost_per_unit` | `decimal` | Calculated cost per `base_unit` (used for recipe costs) |
| `current_stock` | `decimal` | Current total quantity in stock (`base_unit`) |
| `track_expiry` | `boolean` | Whether batches require expiration date tracking |
| `archived` | `boolean` | Soft delete flag (default `false`) |
| `created_at` | `timestamp` | Record creation timestamp |

#### `inventory_batches`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Batch ID |
| `inventory_item_id` | `uuid` (FK) | References `inventory_items(id)` |
| `batch_number` | `text` | Lot/Batch tracking identifier |
| `quantity` | `decimal` | Remaining quantity in this specific batch |
| `expiration_date` | `date` | Expiry date |
| `received_date` | `date` | Date received at store |
| `source` | `text` | Purchase / Delivery origin |
| `status` | `text` | `Active`, `Expired`, `Depleted` |

#### `inventory_purchase_history`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Purchase Log ID |
| `inventory_item_id` | `uuid` (FK) | References `inventory_items(id)` |
| `batch_id` | `uuid` (FK) | References `inventory_batches(id)` |
| `quantity_purchased`| `decimal` | Amount bought |
| `purchase_unit` | `text` | Unit purchased in (e.g., `Box`, `Liter`, `Sack`) |
| `total_cost` | `decimal` | Total receipt price paid |
| `cost_per_unit` | `decimal` | Normalized cost per base unit (`total_cost / quantity`) |
| `supplier` | `text` | Supplier name |
| `purchased_at` | `timestamp` | Date of purchase |
| `created_by` | `uuid` (FK) | References `users(id)` |

#### `inventory_conversion_units`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Conversion ID |
| `inventory_item_id` | `uuid` (FK) | References `inventory_items(id)` |
| `converted_unit` | `text` | Secondary unit (e.g., `pump`, `shot`, `tbsp`) |
| `equivalent_base_amount` | `decimal` | Amount in `base_unit` (e.g., `1 pump = 15 ml`) |

#### `inventory_audit_logs`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Audit ID |
| `inventory_item_id` | `uuid` (FK) | References `inventory_items(id)` |
| `batch_id` | `uuid` (FK) | References `inventory_batches(id)` (nullable) |
| `action` | `text` | `Purchase`, `POS Sale`, `Wastage`, `Manual Adjustment` |
| `source` | `text` | Module trigger source |
| `quantity_change` | `decimal` | Positive (+in) or Negative (-out) change |
| `stock_before` | `decimal` | Stock level before action |
| `stock_after` | `decimal` | Stock level after action |
| `reason_reference`| `text` | Order #, Wastage Reason, or Note |
| `performed_by` | `uuid` (FK) | References `users(id)` |
| `created_at` | `timestamp` | Timestamp of log |


### C. Menu, Pricing & Recipe Domain
#### `menu_categories`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Category ID |
| `category_name` | `text` | e.g., `Iced Coffee`, `Pastries`, `Frappuccino` |

#### `menu_items`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Menu Item ID |
| `item_name` | `text` | Display name on POS and Menu |
| `category_id` | `uuid` (FK) | References `menu_categories(id)` |
| `recipe_status` | `recipe_status_enum`| `'Complete'` or `'Incomplete'` |
| `pos_status` | `pos_status_enum` | `'Available'` or `'Unavailable'` |
| `pricing_type` | `text` | `'Fixed'` (Single price) or `'Variants'` (Multiple sizes) |
| `estimated_cost` | `decimal` | Total cost of ingredients (auto-calculated from recipe) |
| `profit` | `decimal` | `selling_price - estimated_cost` (or lowest variant profit) |
| `margin` | `decimal` | `(profit / selling_price) * 100` |
| `archived` | `boolean` | Soft delete flag (default `false`) |

#### `menu_item_prices`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Price Variant ID |
| `menu_item_id` | `uuid` (FK) | References `menu_items(id)` |
| `variant_name` | `text` | e.g., `Regular`, `Large`, `16oz`, `22oz` |
| `selling_price` | `decimal` | POS selling price for this specific variant |

#### `menu_recipes`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Recipe Ingredient Link ID |
| `menu_item_id` | `uuid` (FK) | References `menu_items(id)` |
| `inventory_item_id` | `uuid` (FK) | References `inventory_items(id)` (the raw ingredient) |
| `quantity` | `decimal` | Amount consumed per order |
| `conversion_unit_id`| `uuid` (FK) | References `inventory_conversion_units(id)` (optional) |
| `estimated_cost` | `decimal` | `quantity * cost_per_unit` of the ingredient |

#### `addons` & `addon_categories`
| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| `addons` | `id`, `addon_name`, `selling_price`, `estimated_cost`, `profit`, `margin` | `uuid`, `text`, `decimal`... | Extra items/toppings available at POS |
| `addon_categories` | `id`, `addon_id`, `menu_category_id` | `uuid` (PK/FK) | Links which add-ons appear for which menu categories |

---

### D. Orders & POS Transaction Domain
#### `orders`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Order ID |
| `order_number` | `text` (UNIQUE) | Receipt invoice number |
| `cashier_id` | `uuid` (FK) | References `users(id)` |
| `order_datetime` | `timestamp` | Time of checkout |
| `order_source` | `text` | e.g., `Dine-In`, `Takeout`, `GrabFood`, `FoodPanda` |
| `payment_method` | `text` | e.g., `Cash`, `GCash`, `Card` |
| `discount_type` | `text` | e.g., `Senior Citizen`, `PWD`, `Promo` |
| `subtotal` | `decimal` | Total before discounts |
| `discount_amount`| `decimal` | Total discount value applied |
| `total` | `decimal` | Final payable amount (`subtotal - discount_amount`) |
| `amount_paid` | `decimal` | Cash/Payment tendered by customer |
| `change_amount` | `decimal` | Return change (`amount_paid - total`) |
| `status` | `text` | `Completed`, `Voided`, `Refunded` |

#### `order_items` & `order_item_addons`
| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| `order_items` | `id`, `order_id`, `menu_item_id`, `price_id`, `quantity`, `unit_price`, `subtotal` | `uuid`, `integer`, `decimal` | Individual line items in an order |
| `order_item_addons`| `id`, `order_item_id`, `addon_id`, `quantity`, `price` | `uuid`, `integer`, `decimal` | Specific add-ons applied to an order line item |


### E. Expenses & Wastage Domain
#### `expense_categories` & `expenses`
| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| `expense_categories`| `id`, `category_name` | `uuid`, `text` | e.g., `Utilities`, `Payroll`, `Repairs` |
| `expenses` | `id`, `category_id`, `description`, `amount`, `vendor`, `payment_method`, `receipt_reference`, `receipt_file`, `expense_date`, `recorded_by` | `uuid`, `decimal`, `date`... | Operational store costs |

#### `wastage`
| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | `uuid` (PK) | Wastage Log ID |
| `inventory_item_id` | `uuid` (FK) | References `inventory_items(id)` |
| `batch_id` | `uuid` (FK) | References `inventory_batches(id)` |
| `quantity` | `decimal` | Amount wasted/spoiled (`base_unit`) |
| `reason` | `text` | Spoilage, Dropped, Expired, Quality Failure |
| `cost` | `decimal` | Financial loss (`quantity * cost_per_unit`) |
| `recorded_by` | `uuid` (FK) | References `users(id)` |
| `receipt_file` | `text` | Photo evidence (optional URL) |
| `created_at` | `timestamp` | Log timestamp |

---

## 3. Domain-Driven Service Folder Architecture

To keep the codebase maintainable, highly organized, and easy to explain for college defenses (`AGENTS.md` rules), we organize all Supabase interactions into **Entity-Specific Service Files** grouped inside **Domain Folders**:

```text
src/
├── services/
│   ├── supabaseClient.js                 # Central Supabase Client initialization
│   ├── auth/                             # Authentication Domain
│   │   ├── authService.js                # Login, logout, session state
│   │   └── userService.js                # User profile & role queries
│   │
│   ├── menu/                             # Menu & Recipe Domain
│   │   ├── menuItemsService.js           # CRUD & Archive for menu_items
│   │   ├── menuCategoriesService.js      # CRUD for menu_categories
│   │   ├── menuPricesService.js          # Variant pricing queries for menu_item_prices
│   │   ├── menuRecipesService.js         # Recipe ingredient link queries for menu_recipes
│   │   └── addonsService.js              # Add-ons & addon category mappings
│   │
│   ├── inventory/                        # Inventory & Stock Domain
│   │   ├── inventoryItemsService.js      # CRUD & stock level calculations
│   │   ├── inventoryCategoriesService.js # Inventory category management
│   │   ├── inventoryBatchesService.js    # Expiry and lot tracking
│   │   └── wastageService.js             # Spoilage & wastage logging
│   │
│   ├── pos/                              # POS Transactions Domain
│   │   └── ordersService.js              # Checkout execution, invoice generation
│   │
│   └── finance/                          # Expenses Domain
│       └── expensesService.js            # Operational cost logging & filtering
```

---

## 4. Recommended Implementation Sequence (Workflow Roadmap)

### Phase 1: Menu Foundation (Active - Completed)
- [x] Convert enum columns (`pos_status`, `recipe_status`).
- [x] Establish `menuCategoriesService.js` and `menuItemsService.js`.
- [x] Refactor `ManageMenuCategoriesModal` and `ConfirmDeleteMenuItemModal` (`archived: true`).

### Phase 2: Inventory Prerequisites (Next Immediate Step)
Before wiring up `AddMenuItemModal` / `EditMenuItemModal` to save real recipes (`menu_recipes`), we need:
1. **Create `inventoryItemsService.js`**: To fetch raw ingredients (e.g., `Whole Milk`, `Coffee Beans`, `Sugar`, `Cups`) from `inventory_items`.
2. **Insert Sample Inventory Ingredients in Supabase**: So the recipe builder dropdown inside `AddMenuItemModal` has real data to pick from!

### Phase 3: Menu Item Creation & Recipe Linking
Once `inventory_items` are queryable:
1. Create **`menuRecipesService.js`** (`addMenuRecipe`, `fetchMenuRecipes`).
2. Update **`AddMenuItemModal.jsx`**:
   - On open, fetch active `categories` and `inventory_items`.
   - On save:
     1. Insert row into `menu_items`.
     2. Insert pricing rows into `menu_item_prices`.
     3. Insert recipe ingredient rows into `menu_recipes` linking the `menu_item_id` to each `inventory_item_id`.
3. Update **`EditMenuItemModal.jsx`** to load and modify existing variants & recipe items.

### Phase 4: POS & Automatic Stock Deduction
When an order is completed at POS (`ordersService`):
1. For every item in `order_items`, look up its `menu_recipes`.
2. Automatically deduct `quantity * recipe.quantity` from `inventory_items.current_stock` and record an entry inside `inventory_audit_logs`.
