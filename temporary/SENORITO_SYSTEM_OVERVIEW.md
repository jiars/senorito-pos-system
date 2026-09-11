# Senorito POS System - Complete Overview and AI Handoff

Last reviewed: September 10, 2026  
Current branch: `migrate-laravel-phase2`

## 1. Purpose of this file

This is the main handoff file for the Senorito POS System.

If another AI continues this project, ask it to read this file first. It contains:

- the owner's rules and preferences;
- the business rules of the cafe;
- the frontend and backend structure;
- the current Laravel migration status;
- how Menu Management works;
- how the backend orchestrator pattern should work;
- the database, security, validation, and offline-mode concerns;
- the recommended next steps.

This file describes the system as it currently exists. It does not mean that every current implementation is already safe or final.

## 2. How the AI should work with the owner

- Always use simple English. Taglish is okay and often preferred.
- Explain code step by step. Avoid complicated shortcuts.
- Use readable, beginner-friendly code even if it is longer.
- Do not dump a complete source file in chat. Show only the exact part that must be added or changed.
- The owner wants to learn Laravel. For Laravel controllers, models, migrations, routes, and frontend service files, guide the owner and let the owner type the code unless the owner clearly asks the AI to edit it.
- The AI may directly refactor JSX/UI files into smaller components.
- Do not overwrite or remove existing work without checking it first.
- Do not use hard delete for business records. Archive and unarchive them instead.
- Keep helpers, formatters, calculations, and reusable validation in `src/utils/`.
- Use Component-Based Architecture. Main page files should mainly connect state, data, page components, and modals.
- Use the current Menu Management structure as the main reference for future module migrations, but fix its security weaknesses before copying them.

The detailed coding agreement is in `.agents/rules/AGENTS.md`.

## 3. What the system does

Senorito is a web-based POS, inventory, expense, employee, and analytics system for a cafe.

### Authentication

- Staff cannot publicly sign up.
- The Owner creates staff accounts and gives them their passwords.
- Login and logout are already moving to Laravel Sanctum.
- The real account and personal-information table is `profiles`, not `users`.
- Laravel currently has a model named `User`, but that model points to the `profiles` table. It should later be renamed to `Profile` for clarity.

### Roles

The highest role is `Owner`.

Current roles:

- Owner
- Cashier
- Inventory Clerk

Current frontend access:

- Owner: all modules.
- Cashier: Dashboard, POS, Orders, and Profile.
- Inventory Clerk: Dashboard, Inventory, Inventory Valuation, Inventory Audit, and Profile.

Frontend route protection is only for user experience. Laravel must also check roles for every protected API endpoint.

### Dashboard

The Dashboard shows simple business summaries and charts. It already gets its main summary from a Laravel endpoint, but the React page is still large and should be split into smaller components later.

### Employees

The Owner manages staff accounts and personal information.

It still uses Supabase directly. It also uses a Supabase service-role key in the browser to create staff accounts. This is a critical security problem. A service-role key must never be shipped inside a frontend application.

When Employee Management is migrated, Laravel should create staff accounts. After that:

1. remove `src/services/supabaseAdmin.js`;
2. remove `VITE_SUPABASE_SERVICE_ROLE_KEY` from frontend environments;
3. rotate the old service-role key in Supabase.

### Expenses

Expenses contain the outgoing money of the cafe and their categories. The module currently supports create, read, update, and a delete-like action. The final rule is still archive/unarchive, not hard delete.

Some expenses are connected to inventory purchases and stock activity. This connection must be preserved when the module moves to Laravel.

### Inventory

Inventory stores the cafe's ingredients and supplies. Examples are milk, water, ice, cups, and coffee beans.

Important inventory behavior:

- Each item has a base unit and may have conversion units.
- Each restock creates a new inventory batch.
- Expiry tracking is supported but optional.
- Restock adds stock and records the purchase.
- Wastage records lost, spilled, expired, or thrown-away stock.
- Correction fixes a wrong physical stock count.
- Stock movements and audit history must remain traceable.
- Items and categories must be archived, never hard-deleted.
- Archived records can be restored with unarchive.
- FIFO batch handling is used by current Supabase stock logic.

Inventory migration has started. Laravel currently provides the Inventory init endpoint and category endpoints. Item CRUD, batches, stock movement, archive/unarchive, audit, and reports still use Supabase services.

### Menu Management

Menu Management is the best-organized module and the main reference for the new architecture.

Each menu item has:

- a name and category;
- an optional image stored in Supabase Storage;
- either one price or multiple variants, such as 16 oz and 22 oz;
- selling price, estimated cost, profit, and margin;
- at least one ingredient from Inventory;
- a recipe stored in `menu_recipes` and connected to the correct menu price/variant;
- an available/unavailable status;
- archive behavior instead of hard delete.

Menu items and add-ons are already handled mainly through Laravel API endpoints.

### Add-ons

An add-on has a name, selling price, recipe, status, and applicable menu categories.

`addon_categories` is a bridge/pivot table. This design is correct. It connects an add-on to the menu categories where it can be used. For example, espresso may apply to Coffee but not Pastry.

Add-ons must also be archived, never hard-deleted.

### Orders

Orders show receipt and order history from the database. This module still reads Supabase directly.

### POS

The POS displays menu products, variants, and valid add-ons. Checkout records the sale and reduces the needed inventory ingredients.

Supported payment methods include:

- Cash
- GCash

The POS currently uses Supabase for online checkout and Dexie for offline orders.

### Profile

The Profile page displays the current user's personal details, password area, and recent activity. Parts of it still use Supabase directly. The current password-change flow mixes Laravel login and Supabase password update and must be redesigned when Profile/Auth is completed.

### Reports

Reports cover:

- sales and popular menu items;
- incoming and outgoing inventory;
- stock valuation and wastage;
- expenses and other business totals.

Most reporting services still query Supabase directly. Some pages also export data through SheetJS/XLSX.

## 4. Current technology stack

### Frontend

- React 19
- Vite 8
- React Router 7
- Axios 1.20
- TanStack Query 5
- Supabase JavaScript client 2
- Dexie 4 for IndexedDB/offline storage
- SheetJS/XLSX for spreadsheet export
- `qrcode.react` for inventory QR codes
- Bootstrap Icons
- Vercel Analytics and Speed Insights
- Vite PWA plugin is installed

### Backend

- PHP 8.3 or newer
- Laravel 13
- Laravel Sanctum 4
- Eloquent ORM
- PostgreSQL hosted by Supabase

### Deployment direction

- React frontend can remain on Vercel.
- Laravel is intended to become the only application backend.
- Supabase can remain as PostgreSQL hosting and image storage while direct frontend database access is removed.
- Render was tested/planned for Laravel hosting. Deployment must include correct environment variables, trusted CORS origins, HTTPS, database SSL, migration handling, and protection against a sleeping backend.

## 5. Frontend architecture

### `src/context`

`AuthContext.jsx` determines the current session. It reads `auth_token` from local storage and calls Laravel `GET /user`.

Current concerns:

- It imports Supabase even though the current session check uses Laravel.
- It treats the Laravel user response as both `user` and `profile`.
- If role data is missing, it defaults the role to `Owner`. This is unsafe because a missing role should never grant the highest access.
- An offline page reload cannot restore the user if Laravel cannot be reached.

Target behavior:

- Laravel `/user` returns the profile with its role.
- No default-to-Owner behavior.
- Invalid or missing roles deny access.
- Offline mode uses a safe local session/lock design without allowing a different person to use the last cashier's session.

### `src/hooks`

- `useAuth.js`: exposes context login/logout/session behavior.
- `useMenuManagement.js`: uses TanStack Query and Laravel `GET /menu-management/init`.
- `useInventoryManagement.js`: uses TanStack Query and one Laravel `GET /inventory-management/init` request for categories, units, active items, and archived items.
- `useExpenses.js`: coordinates Expense service operations that still use Supabase.
- `usePasswordChange.js`: currently belongs to a mixed Laravel/Supabase auth flow.

Future organization should keep one clear data hook per module and use TanStack Query for server data, cache invalidation, loading, and errors.

### `src/pages`

Each module has its React page, CSS, components, and modals.

Menu Management is the CBA reference:

- `MenuManagementPage.jsx` is small and mainly connects data and modals.
- headers and tables are separate components;
- Add and Edit modals are separated;
- modal form sections and ingredient rows are separate components;
- Add-ons follow the same layout.

Inventory is already being partially refactored into this pattern. The remaining large pages should be refactored only when their module is being worked on. Large files include Dashboard, Expenses, POS, Inventory Audit, Inventory Valuation, and Sales Report.

The files under `src/components/ui/` are reusable controls. The three files under `src/components/feedback/` are currently empty and can later become shared loading, error, and empty-state components.

### `src/routes`

- `AppRoutes.jsx`: declares frontend pages.
- `ProtectedRoute.jsx`: checks login and allowed routes.
- `PublicOnlyRoute.jsx`: prevents a logged-in user from returning to public auth pages.
- `roleRoutes.js`: maps roles to frontend paths.

Frontend route protection is not enough. A user can call API endpoints without visiting React pages. Laravel middleware or policies must protect the real data.

### `src/services`

The preferred new pattern is:

`React page/modal -> module service -> shared Axios instance -> Laravel endpoint`

Already following this pattern:

- Menu item services
- Menu category services
- Most add-on operations
- Dashboard summary
- Inventory category services
- Menu and Inventory init hooks

Still using Supabase directly:

- Employees
- Expenses
- most Inventory item and stock operations
- Orders and POS checkout
- Offline order synchronization
- Sales reports
- recent profile activity
- menu image upload, which may remain a special storage case but must use safe storage rules or signed uploads

`axiosInstance.js` supplies the API base URL and adds the Sanctum bearer token to each request. It should later also handle standard 401/403/422 responses consistently.

### `src/utils`

Utilities currently cover:

- Axios configuration;
- currency, date, number, and string formatting;
- image uploads;
- inventory expiry display logic;
- Menu cost/profit/margin calculations;
- IndexedDB through Dexie;
- offline transaction ID creation;
- order helpers;
- Menu form validation.

Frontend validation is useful for fast feedback, but it is not security. Laravel must validate the same request again because browser requests can be changed or sent without React.

## 6. Backend architecture

### Main folders

The desired Laravel layout is organized by module:

```text
backend/app/Http/Controllers/Api/
  ModuleName/
    InitModuleController.php
    Categories/
    Items/
    Orchestrators/

backend/app/Models/
  ModuleName/

backend/app/Http/Requests/
  ModuleName/

backend/routes/api.php
```

The `Requests` folders do not exist yet, but Laravel Form Requests are recommended.

### What a Laravel Form Request is

A Form Request is a separate Laravel class that validates and authorizes one API request before a controller runs.

For example:

- `StoreMenuItemRequest` validates the complete Add Menu payload.
- `SyncMenuItemRequest` validates the complete Edit Menu payload.
- `StoreInventoryItemRequest` validates Add Inventory Item.
- `RestockInventoryItemRequest` validates batch, quantity, cost, date, and expiry.

Using Form Requests does not require changing the purpose of the Menu or Inventory UI. The JSON payload may stay the same. The controller changes its parameter from a general `Request` to the correct Form Request, then uses validated data. This keeps large nested validation rules out of controllers.

### Init controller pattern

Each main management page should normally load through one init endpoint. It returns the related data required by that page in one response.

Examples:

- `GET /menu-management/init`
- `GET /inventory-management/init`

This avoids many separate requests and keeps the initial page load consistent. Init endpoints should return only the data the current user is allowed to see and should clearly handle archived records.

### Orchestrator pattern

The orchestrator is a traffic controller for one business operation that changes several related tables.

The intended flow is:

1. Laravel authorizes the user.
2. A Form Request validates the full nested payload.
3. The orchestrator opens one database transaction.
4. It creates or updates the parent record.
5. It separates child records into insert, update, and remove/archive groups.
6. Smaller domain actions/controllers handle those groups.
7. Laravel calculates trusted totals where needed.
8. Laravel writes the audit log.
9. The transaction commits only if every step succeeds.
10. Laravel returns a consistent JSON response.

If one step fails, the transaction rolls back all related database changes.

This pattern is useful for Menu recipes, Inventory restocks, stock adjustments, expenses connected to purchases, and POS checkout.

Important improvement: controllers should not become tightly connected by repeatedly calling other HTTP controllers through `app(...)`. As the project grows, reusable business work can move into simple Action or Service classes. Controllers then stay responsible for HTTP input and output, while the orchestrator/action owns the transaction. The current pattern can be improved gradually; it does not need to be replaced immediately.

## 7. Exact Menu Management flow

### Page loading

1. `MenuManagementPage.jsx` calls `useMenuManagement()`.
2. TanStack Query calls Axios.
3. Axios sends `GET /menu-management/init` with the bearer token.
4. `InitMenuManagementController` loads categories, menu items, prices, recipes, add-ons, add-on categories, and add-on recipes.
5. The hook gives the data to Menu pages, tables, and modals.
6. Menu modals also use `useInventoryManagement()` data for ingredient choices and cost calculations.

### Add Menu Item

1. The Add modal keeps separate state for base info, pricing mode, prices/variants, and ingredients.
2. Smaller JSX components render each form section.
3. `menuValidation.js` checks required fields, positive prices, and ingredients.
4. A selected image is uploaded to Supabase Storage.
5. React builds one payload:

```text
base_info
  item_name
  category_id
  recipe_status
  pos_status
  pricing_type
  image_url
prices[]
  variant_name
  selling_price
  estimated_cost
  profit
  margin
  item_code
  pos_status
  recipes[]
    inventory_item_id
    quantity
    unit
    estimated_cost
```

6. `menuItemsService.js` sends `POST /menu-management/items`.
7. `MenuAddController` opens a transaction, creates the menu item, then delegates the prices and recipes.
8. React refetches the init query and closes the modal.

### Edit Menu Item

1. The Edit modal converts the stored item, prices, and recipes back into form state.
2. Existing UUIDs are kept. New temporary UI rows do not have database UUIDs.
3. React builds the full desired final state and sends `PUT /menu-management/items/{id}/sync`.
4. `MenuEditController` updates the parent and separates prices into insert, update, and delete groups.
5. `MenuItemPriceController` does the same for each price's recipes.
6. All operations run inside the orchestrator transaction.
7. React refetches Menu init.

This declarative sync approach is a good basis: React says what the finished record should look like, and Laravel determines the required database changes.

### Add-on flow

Add-ons use the same general idea:

- `base_info` for the add-on;
- `categories` containing menu category IDs;
- `recipes` containing inventory ingredients.

On edit, Laravel compares old and incoming category IDs. The difference determines which bridge rows are inserted or removed. Recipe UUIDs determine insert, update, and remove groups.

### Menu weaknesses to fix

Do not copy these weaknesses into Inventory:

- Laravel currently validates mainly the item/add-on name. It does not fully validate every nested field.
- React sends calculated cost, profit, margin, and recipe cost. A modified browser can fake them. Laravel should calculate trusted values from inventory data.
- Price and recipe update queries use child IDs without always proving they belong to the parent being edited. This can allow cross-record changes if a malicious request supplies another record's UUID.
- Requested category, inventory item, price, and recipe IDs need `exists` checks and parent ownership checks.
- Status, pricing type, units, image URL, array size, decimal precision, and positive quantity rules need backend validation.
- Init/index endpoints do not consistently filter archived Menu records.
- Menu Categories are not archived. They may be permanently deleted only when no Menu Item or Add-on uses them. Laravel must enforce this rule instead of trusting the React check.
- HTTP `DELETE` currently means archive for items/add-ons. It works, but an explicit endpoint such as `PATCH /items/{id}/archive` is clearer.
- Add-on service still writes a system activity log through Supabase.
- Image upload happens before the database request. If Laravel later rejects the payload, an unused image may remain in storage.
- Some generated item-code behavior is still done by React and may produce bad values when a base item code is missing.

## 8. Inventory migration status

### Already started in Laravel

- Inventory models for items, categories, batches, and conversion units.
- `GET /inventory-management/init`.
- Inventory category create, update, and current delete endpoint.
- React Inventory init uses TanStack Query and Axios.
- React Inventory pages are being split into smaller components.

### Still using Supabase

- unit enum loading;
- item create and edit;
- item archive and unarchive;
- affected-menu checks;
- batch loading and expiry cleanup;
- restock, wastage, and correction;
- FIFO quantity changes;
- purchase records and related expenses;
- stock audit logs and stock history;
- QR modal database fetch;
- inventory valuation data.

### Important current problem

`InventoryCategoryController::destroy()` currently calls hard delete. This conflicts with the permanent business rule. It must archive the category instead, and an unarchive endpoint is needed.

### Recommended Inventory backend structure

```text
InventoryManagement/
  InitInventoryManagementController.php
  Categories/
    InventoryCategoryController.php
  Items/
    InventoryItemController.php
  Batches/
    InventoryBatchController.php
  Stock/
    InventoryRestockController.php
    InventoryWastageController.php
    InventoryCorrectionController.php
  Orchestrators/
    InventoryAddController.php
    InventoryEditController.php
    InventoryRestockOrchestrator.php
    InventoryAdjustmentOrchestrator.php
  Audit/
    InventoryAuditController.php
```

The exact number of files can stay simple. The key rule is one clear owner for each business operation and a transaction whenever several tables change.

## 9. Authentication and authorization status

### Current Laravel auth

- `POST /login` validates email/password and creates a Sanctum token.
- `GET /user` returns the authenticated profile record.
- `POST /logout` removes the current token.
- The Eloquent model is named `User` but reads from `profiles`.
- All current business API routes only use `auth:sanctum`.

### Required cleanup

- Rename `User` to `Profile` later and update imports/references.
- Add the role relationship to the profile model.
- Make `/user` return role data in a deliberate response shape.
- Remove React's fallback role of Owner.
- Add server-side role middleware, policies, or gates.
- Apply least privilege per endpoint, not only per route prefix.
- Decide token expiry/revocation rules and remove old unused tokens.
- Add login throttling.
- Do not return private columns such as password hashes.
- Complete password change/reset using Laravel only.
- Move employee creation to Laravel before removing the service-role code.
- Audit Supabase RLS while direct frontend access still exists.

The dedicated tracking file is `.agents/security_authorization_cleanup_plan.md`.

## 10. Input validation and security rules

Every write operation should have three layers:

1. React validation for quick user feedback.
2. Laravel Form Request validation as the trusted API boundary.
3. Database constraints as the final safety net.

Laravel must validate:

- required fields and types;
- trimmed strings and maximum lengths;
- allowed enum/status values;
- UUID format;
- foreign-key existence;
- ownership of nested child IDs;
- positive quantities and valid money ranges;
- decimal precision;
- dates and logical expiry rules;
- allowed image type, size, and upload path;
- array minimums and maximums;
- at least one recipe ingredient;
- duplicate variants, units, categories, and ingredients;
- archived records that should no longer be selectable.

Use `$request->validated()` from a Form Request instead of `$request->all()` for mass assignment.

Laravel/Eloquent parameter binding already prevents normal SQL injection when used correctly. The larger current risks are exposed credentials, missing authorization, trusting frontend calculations, unsafe child IDs, broad Supabase RLS policies, and operations without transactions.

Never rely on sanitizing by removing random characters. Validate according to the field's meaning, store the correct value, and let React escape displayed text. Only allow HTML when it has a real business need and a strict sanitizer.

The detailed guide is `docs/input_validation_and_security_guide.md`.

## 11. Database findings

The fresh schema-only backup is `docs/database_schema_current.sql`. It contains structure, not business rows.

The older `database_backup.sql` is a full backup with data and should be treated as sensitive. It is older and should not be used as the only current schema reference.

Confirmed live findings during review:

- `public.users` exists but has no rows.
- `profiles` has three rows.
- Supabase `auth.users` has three linked rows.
- Two profiles were missing a Laravel password hash at review time.
- Sixteen Sanctum personal access tokens existed at review time.
- `menu_item_prices.pos_status` has an incorrect quoted default.
- Stored price statuses are inconsistent: values include `Available`, `'Available'`, and `Unavailable`.
- Many Supabase RLS policies are broad, including anonymous reads and broad authenticated writes/deletes.
- `addon_categories` is a valid bridge table, not a design error.
- Some category/business tables do not yet support the required archive rule.
- Laravel's default `users` and `sessions` migration does not match the UUID/profile-based design cleanly.
- The auth migration rollback removes an email column that its `up()` method did not create.

Before more production use, clean the status data/default, decide the final Laravel-owned identity design, add missing archive fields, add important constraints, and tighten RLS.

Supporting documents:

- `docs/database_cleanup_plan.md`
- `docs/database_schema_columns.md`
- `docs/database_schema_reference.md`

## 12. Offline mode

Current goal: when internet is lost, only the POS should be usable. It should process orders locally and automatically sync them when online again.

Current implementation:

- Dexie stores offline data in IndexedDB.
- POS checks `navigator.onLine`.
- Offline transaction IDs are generated locally.
- Pending orders are later passed to the current online checkout function.

Known gaps:

- Offline reload cannot currently restore Laravel user context safely.
- No offline lock screen exists.
- `navigator.onLine` can say online even when Laravel or Supabase is unreachable.
- Local stock deduction does not fully match online ingredient/add-on/conversion behavior.
- Sync has no strong idempotency protection, so retries may create duplicate orders.
- Multiple-device conflict rules are not designed. This is accepted for now because only one device is expected, but it should be reconsidered later.

Future requirements:

- only POS routes work offline;
- use an offline lock screen and local PIN/session protection;
- cache a safe menu snapshot, recipes, add-ons, and enough stock information;
- store a stable client transaction UUID;
- add a database unique constraint for idempotency;
- let Laravel process sync in one transaction;
- never trust totals or stock deductions calculated only by the offline client;
- show pending, syncing, synced, and failed states;
- handle GCash carefully because payment confirmation may need connectivity.

See `docs/offline_mode_guide.md` and `.agents/offline_mode_plan.md`.

## 13. Archive rule

The final rule is simple:

**Main business records must be archived and not permanently deleted through normal application use.**

This includes:

- inventory items and categories;
- menu items;
- add-ons;
- expenses and expense categories;
- employees/profiles where appropriate.

Internal child rows such as a recipe line or a pivot link may sometimes be physically removed during a controlled parent edit, because they represent the current composition rather than an independent business record. This must be decided per table and recorded in audit logs when important.

Menu Category is a confirmed exception. It can be permanently deleted only when no Menu Item or Add-on uses it. This must be checked again in Laravel because a frontend-only check can be bypassed.

Archived parents should be excluded from normal selection and POS use, but remain available to history and reports. Unarchive must check name conflicts and broken relationships.

## 14. API naming recommendation

Keep all application endpoints under a clear version prefix:

```text
/api/v1/auth/login
/api/v1/auth/logout
/api/v1/auth/profile

/api/v1/dashboard/init

/api/v1/menu-management/init
/api/v1/menu-management/items
/api/v1/menu-management/items/{item}/sync
/api/v1/menu-management/items/{item}/archive
/api/v1/menu-management/items/{item}/unarchive

/api/v1/inventory-management/init
/api/v1/inventory-management/items
/api/v1/inventory-management/items/{item}/sync
/api/v1/inventory-management/items/{item}/restock
/api/v1/inventory-management/items/{item}/wastage
/api/v1/inventory-management/items/{item}/correction
/api/v1/inventory-management/items/{item}/archive
/api/v1/inventory-management/items/{item}/unarchive
```

Laravel route model binding can later replace raw `{id}` parameters. Route names and response formats should remain consistent across modules.

## 15. Recommended next work

Do not continue by copying every Menu file directly. First make the shared foundation safe, then finish Inventory in small phases.

### Phase 0 - Protect existing work

1. Review staged and unstaged files separately.
2. Create a safe commit or backup before large changes.
3. Do not reset the current worktree; it contains the paused Inventory migration and Menu changes.

### Phase 1 - Database cleanup needed by Inventory

1. Fix inconsistent Menu price status values and the bad default.
2. Add missing archive fields and indexes.
3. confirm foreign keys, unique rules, and decimal/check constraints.
4. Decide how `profiles` and Supabase `auth.users` will be separated when Laravel fully owns auth.
5. Reduce dangerous RLS permissions without breaking modules that still depend on Supabase.

### Phase 2 - Shared Laravel safety foundation

1. Create Form Requests for nested Menu payloads.
2. Add role data to the authenticated profile response.
3. Add backend role authorization.
4. Remove the default-to-Owner behavior from React.
5. Add consistent API error responses and Axios handling.
6. Add tests for authentication, authorization, validation, transactions, archive behavior, and child ownership.

### Phase 3 - Stabilize Menu as the real reference

1. Move calculations to Laravel.
2. Scope all price/recipe/add-on child changes to their correct parent.
3. validate the full payload.
4. enforce unused-only Menu Category deletion in Laravel.
5. filter archived records correctly.
6. remove the remaining Supabase activity-log write from add-on service.

### Phase 4 - Finish Inventory migration

Recommended order:

1. inventory categories archive/unarchive;
2. Inventory init response contract;
3. Add Inventory Item orchestrator;
4. Edit Inventory Item declarative sync;
5. item archive/unarchive and affected-menu checks;
6. restock transaction and batch creation;
7. wastage and correction transactions;
8. audit/history endpoints;
9. valuation/report endpoints;
10. remove old Inventory Supabase calls only after each Laravel replacement is tested.

### Phase 5 - Continue module by module

Suggested order after Inventory:

1. Employees and complete Laravel auth ownership, so the frontend service-role key can be removed.
2. Expenses.
3. POS checkout and Orders.
4. Reports.
5. Profile and password management.
6. Offline mode hardening and sync.
7. Final removal of direct frontend database access.

## 16. Testing expectations

For every migrated operation, test at least:

- correct role succeeds;
- wrong role receives 403;
- no token receives 401;
- missing or malformed input receives 422;
- another parent's child UUID cannot be edited;
- duplicate names are handled;
- negative and zero quantities are rejected where invalid;
- failed child work rolls back the parent transaction;
- archive keeps the row and history;
- unarchive restores it safely;
- init endpoint returns the shape expected by React;
- React shows backend validation errors clearly.

Never remove the old Supabase implementation until the Laravel replacement passes its tests and the UI works end to end.

## 17. Current working-tree warning

At the time of this review, the branch already contains many staged changes from the paused migration, including:

- new Inventory Laravel controllers and models;
- changes to Laravel API routes and Menu models;
- Axios and TanStack Query setup;
- Menu and Inventory hook changes;
- Inventory page/component refactoring;
- Menu modal and service changes.

`index.html` also has an unstaged change.

These changes belong to the owner's current work. A future AI must inspect them before editing and must not use `git reset --hard`, blind checkout, or other destructive commands.

## 18. Documentation map

Read these files when working in their area:

- `.agents/rules/AGENTS.md` - coding and teaching agreement.
- `.agents/implementation_plan.md` - phased Laravel migration plan.
- `.agents/module_architecture_guide.md` - module structure guidance.
- `.agents/laravel_backup.md` - work completed before the earlier quota ended.
- `.agents/security_authorization_cleanup_plan.md` - authorization/security work list.
- `.agents/offline_mode_plan.md` - offline implementation plan.
- `docs/backend_orchestrator_pattern.md` - orchestrator explanation.
- `docs/backend_deployment_strategy.md` - deployment direction.
- `docs/database_cleanup_plan.md` - database cleanup tasks.
- `docs/database_schema_current.sql` - fresh schema-only backup.
- `docs/database_schema_columns.md` - table/column reference.
- `docs/database_schema_reference.md` - table relationships.
- `docs/input_validation_and_security_guide.md` - validation and security rules.
- `docs/offline_mode_guide.md` - current offline behavior.
- `docs/tech_stack_analysis.md` - stack and migration analysis.

Note: `.agents/`, `docs/`, and SQL files are currently ignored by `.gitignore`. They exist locally but do not normally appear in Git/Codex Diff or get committed. This root overview file is intentionally outside those ignored folders so it is easier to see and share.

## 19. Final direction

The long-term architecture is:

```text
React UI
  -> TanStack Query / module hooks
  -> module service
  -> shared Axios client
  -> Laravel API + Sanctum + role authorization
  -> Form Request validation
  -> orchestrator/action transaction
  -> Eloquent models
  -> PostgreSQL
```

Supabase should eventually be infrastructure, not an unrestricted second backend called directly by the browser. Laravel will own business rules, authorization, calculations, database writes, checkout, audit logs, and offline synchronization.

The next practical target is to secure and finish the Menu reference pattern, then complete Inventory one small operation at a time using that improved pattern.
