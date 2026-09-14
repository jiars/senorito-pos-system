# Temporary Task List

Updated: September 11, 2026

Legend: `[ ]` pending, `[~]` active, `[x]` completed, `[-]` intentionally skipped

## Paused Database Cleanup

- [x] Review staged and unstaged work.
- [x] Create a safe Git checkpoint (`a5e37d7`).
- [-] Create a fresh database backup before changes — skipped by owner.
- [x] Inspect Menu price statuses and current database default.
- [x] Create the Menu price status cleanup migration.
- [x] Add the cleanup, corrected default, and status constraint to the migration.
- [x] Fix quoted Menu price status values.
- [x] Fix the Menu price status default.
- [x] Add and verify the allowed status constraint.
- [x] Test Menu and POS after status cleanup.
- [x] Inspect Menu Category schema, usage, and current hard-delete flow.
- [x] Confirm Menu Category rule: no archive; permanent deletion is allowed only when unused.
- [x] Confirm Inventory Category rule: no archive; permanent deletion is allowed only when unused.
- [ ] Decide archive/delete rules for Expenses and Expense Categories.
- [ ] Review UUIDs, foreign keys, unique fields, and decimal constraints.
- [ ] Fix Laravel users/profile migration mismatches.
- [ ] Review and reduce unsafe Supabase RLS policies.

## Authentication and Authorization

- [ ] Return Profile with Role from `/user`.
- [ ] Remove the React default-to-Owner behavior.
- [ ] Add Laravel role authorization.
- [ ] Add login throttling.
- [ ] Hide password hashes and private fields.
- [ ] Plan the `User` to `Profile` model rename.
- [ ] Add standard Axios handling for 401, 403, and 422.

## Secure Menu Reference

- [x] Remove unused Menu Item store/update methods; Add/Edit use orchestrators.
- [x] Create the `protect_menu_category_references` migration.
- [x] Protect Menu Category foreign keys so used categories cannot be deleted.
- [x] Add Laravel unused-only validation before deleting a Menu Category.
- [x] Test used and unused Menu Category deletion behavior.
- [ ] Create Menu Form Requests — postponed until the main system migration is complete.
- [x] Disconnect postponed Menu Form Requests and Laravel pricing calculations from Add and Edit.
- [ ] Validate all prices, variants, recipes, categories, units, and UUIDs.
- [ ] Require at least one ingredient.
- [x] Add duplicate-ingredient validation to React `menuValidation.js`.
- [ ] Protect price and recipe parent ownership.
- [ ] Move cost, profit, and margin calculations to Laravel — postponed; temporarily trust React calculations.
- [~] Complete Menu Item and Add-on archive/unarchive.
  - [x] Exclude archived Menu Items and Add-ons from active fetches.
  - [ ] Fetch active and archived records separately.
  - [ ] Add Laravel unarchive endpoints.
  - [ ] Add frontend archive views and restore actions.
  - [ ] Correct Delete wording and icons to Archive.
- [~] Filter archived records correctly.
- [ ] Move remaining Menu activity logs to Laravel.
- [ ] Generate `menu_item_prices.item_code` consistently in Laravel after the parent Menu Item code is created.
- [ ] Test transactions and rollback.

## Inventory Migration

- [x] Replace Inventory Category archive behavior with unused-only hard deletion.
  - [x] Block deletion when any active or archived Inventory Item uses the category.
  - [x] Remove Inventory Category archive code from Laravel and React.
    - [x] Remove Laravel references.
    - [x] Remove React references.
  - [x] Safely remove the `inventory_categories.archived` column.
  - [x] Return the complete Inventory Item usage count for each category.
  - [x] Test used and unused Inventory Category deletion.
- [x] Return units through Laravel instead of Supabase RPC.
- [x] Create Add Inventory Item orchestrator.
  - [x] Refactor Add Inventory Item modal into CBA components.
    - [x] Connect Base Info, Initial Purchase, Conversion Units, and Expiry/Note components.
    - [x] Verify all modal fields and validation in the browser.
    - [x] Move Add Inventory validation into a dedicated utility.
    - [x] Build one nested payload inside the JSX.
  - [x] Create the Laravel orchestrator and child operations.
    - [x] Configure Purchase History and Audit Log as create-only models.
    - [x] Create the initial Inventory Batch operation.
    - [x] Create the Purchase History operation.
    - [x] Create the Conversion Units Add operation.
    - [x] Create the Inventory Audit Log operation.
    - [x] Add Item, initial Batch, Purchase History, conversions, and Audit Log in one transaction.
    - [x] Register the protected Add Inventory API route.
  - [x] Move the Add Inventory Item service to Axios.
  - [x] Test and verify all created records.
  - [ ] Add an automated transaction rollback test.
- [x] Refactor Edit Inventory Item and create its Laravel sync orchestrator.
  - [x] Split the Edit modal into reusable UI components.
  - [x] Move Edit validation to the Inventory validation folder.
  - [x] Build one nested Edit payload in the JSX.
  - [x] Keep database IDs separate from temporary UI IDs.
  - [x] Visually verify the refactored Edit modal.
  - [x] Require Minimum Level to be at least 1 in Add and Edit.
  - [x] Add scoped conversion insert, update, and delete child operations.
  - [x] Create and connect the Laravel Edit orchestrator.
  - [x] Move the Edit Inventory service from Supabase to Axios.
  - [x] Test main item edits and mixed conversion insert/update/delete.
- [x] Sync conversion units safely during Edit Inventory.
  - [x] Insert only newly added conversion units.
  - [x] Update existing conversion units using their IDs.
  - [x] Delete only conversion units explicitly removed by the user.
  - [x] Never delete and reinsert all conversion units during editing.
  - [ ] Preserve conversion behavior: ordered quantity × equivalent base amount is deducted from base stock.
- [x] Add item archive/unarchive.
  - [x] Return active and archived items through one Inventory init request.
  - [x] Rename the shared hook to `useInventoryManagement`.
  - [x] Refetch the same Inventory query after Add, Edit, Archive, and Unarchive.
  - [x] Add and populate the dedicated `archived_at` timestamp.
  - [x] Add protected Laravel archive/unarchive routes and return the archived list through init.
  - [x] Move Archive/Unarchive services from Supabase to Axios.
  - [x] Refactor Archive and Unarchive modals into separate components.
  - [x] Test archive, archived list, unarchive, and shared refetch in the browser.
- [~] Check affected Menu Items and Add-ons before archive.
  - [x] Add the Laravel affected-record endpoint.
  - [x] Display Menu Items and Add-ons separately in each modal.
  - [ ] Verify affected Menu Items and Add-ons in the browser.
- [~] Create the Restock orchestrator; Form Request validation remains postponed.
  - [x] Refactor Stock Log into smaller frontend components.
  - [x] Move Stock Log validation into the Inventory validation folder.
  - [x] Build the nested Restock payload in `StockLogModal.jsx`.
  - [x] Use batches and current stock returned by Inventory init.
  - [x] Visually test Restock, Wastage, and Correction forms before backend migration.
  - [x] Add the protected Laravel Restock endpoint and Axios service.
    - [x] Create and connect the Restock Axios service.
    - [x] Register the protected Laravel Restock route.
  - [x] Save Restock through one database transaction.
  - [x] Keep Restock, Wastage, and Correction in separate frontend service files.
    - [x] Create `stock/restockService.js` without removing the legacy Inventory Stock service.
    - [x] Connect Restock to its service while preserving the legacy stock service.
  - [x] Keep the HTTP controller, orchestrator, and record operations in separate backend files.
    - [x] Scaffold `InventoryRestockController.php`.
    - [x] Scaffold `InventoryRestockOrchestrator.php`.
  - [x] Keep Expense code under Expense Management, not Inventory Management.
  - [x] Test Restock and verify stock, batch, purchase, audit, and expense records.
  - [x] Require the Restock total cost to be at least 1 in React and Laravel.
- [x] Create a new batch for every restock.
- [x] Connect Restock with purchase history, audit logs, and an Inventory Purchase expense.
- [x] Create Wastage operation.
  - [x] Review the legacy Supabase Wastage and batch-deduction behavior.
  - [x] Create the separate Wastage Axios service and connect its payload.
  - [x] Create the Wastage HTTP controller and orchestrator.
  - [x] Deduct from the selected batch, then continue through eligible batches when needed.
  - [x] Update the Inventory Item and create an Audit Log in one transaction.
  - [x] Prevent negative item and batch stock.
  - [x] Add a shared transaction reference to Inventory Audit Logs.
  - [x] Create one grouped audit row for every batch affected by Wastage.
  - [x] Register and test the protected Wastage endpoint.
    - [x] Register and verify the protected Wastage route.
    - [x] Test Wastage and its database changes in the browser.
- [x] Create Correction operation.
  - [x] Review and correct the legacy Correction behavior.
  - [x] Create a separate Correction Axios service and payload.
  - [x] Create the Correction HTTP controller and orchestrator.
  - [x] Handle selected-batch additions and deductions without negative stock.
  - [x] Create a batch-specific Audit Log in one transaction.
  - [x] Register and test the protected Correction endpoint.
- [~] Migrate automatic expired-batch cleanup to Laravel before enabling it again.
  - [x] Create the expired-batch worker controller and Laravel orchestrator.
  - [x] Create and register the `inventory:cleanup-expired` Artisan command.
  - [x] Schedule cleanup daily at 12:05 AM Philippine time without overlap.
  - [x] Test using a controlled expired batch and verify stock, audit, and cost changes.
  - [-] Configure the scheduler runner — postponed until deployment/polishing.
- [~] Preserve FIFO/FEFO batch behavior.
  - [x] Apply the effective-cost rule in Laravel Restock, Wastage, Correction, and Expiry Cleanup.
  - [ ] Apply the same behavior to POS when POS checkout is migrated.
- [~] Prevent negative stock.
  - [x] Protect Laravel Wastage, Correction, and Expiry Cleanup.
  - [ ] Protect POS deductions when POS checkout is migrated.
- [x] Move the complete Inventory Audit Log to Laravel; per-item Stock History is intentionally skipped.
  - [x] Review the current Supabase fetches and required response data.
  - [-] Migrate the per-item Stock History modal — intentionally skipped because it may be removed later.
  - [x] Refactor the complete Inventory Audit Log page into smaller components.
  - [x] Move Audit Log filtering, formatting, and Excel export into a dedicated utility.
  - [x] Add a TanStack Query hook for Inventory Audit Logs.
  - [x] Preload fresh Audit Log data after Add, Restock, Wastage, and Correction.
  - [x] Refetch Audit Logs when the page opens or the browser regains focus.
  - [x] Add the read-only Laravel Audit Log endpoint.
  - [x] Move the frontend Audit Log service to Axios.
  - [x] Connect and test the complete Audit Log page.
  - [x] Do not expose update or delete operations for Purchase History and Audit Logs.
- [x] Refactor and migrate Inventory Valuation data fetching to Laravel.
  - [x] Create a TanStack Query hook while temporarily keeping the current data source.
  - [x] Move valuation calculations, filtering, sorting, chart preparation, and Excel export into dedicated JS utilities.
  - [x] Split the visible report into focused React components.
  - [x] Move the complete print-only layout into its own component.
  - [x] Preserve the current batch-value and weighted-average-cost formulas in JavaScript.
  - [x] Run frontend lint and visually test totals, filters, chart, export, and print.
    - [x] Pass focused ESLint and the production frontend build.
    - [x] Verify the extracted print layout in browser print preview.
  - [x] Add a dedicated read-only Laravel valuation endpoint.
  - [x] Add the Axios valuation service and switch the hook from Supabase to Laravel.
  - [x] Refresh the Valuation cache after Add, Restock, Wastage, and Correction.
  - [x] Refetch Valuation on page open/focus for server-created Expiry changes.
  - [x] Compare Laravel results against the current report before removing its old fetch.
  - [-] Move valuation calculations to Laravel — postponed until the main system migration is complete.
- [ ] Remove replaced Inventory Supabase calls after testing.

## Later Modules

- [~] Prepare Expense Category CRUD while building Restock.
  - [x] Create a separate Expense Category controller.
  - [x] Add Expense and Expense Category model relationships.
  - [x] Add index, store, update, and unused-only destroy operations.
  - [x] Register protected category routes.
  - [ ] Move the Expense Category frontend service to Axios using the existing Laravel endpoints.
  - [ ] Connect Expense Category UI refresh to TanStack Query.
  - [ ] Test add, edit, and unused-only delete behavior.
- [-] Migrate Employees and remove the frontend service-role key — paused for team discussion about account creation and login design.
  - [x] Review the `profiles` and `roles` schema, current modals, and frontend payloads.
  - [ ] Detach `profiles.id` from Supabase `auth.users.id` and add automatic UUID generation.
  - [ ] Confirm profile email/username uniqueness and status values before creating employees through Laravel.
  - [ ] Fix the Laravel User/Profile model fields and add its Role relationship.
  - [ ] Create the Employee Management init endpoint for employees and roles.
  - [ ] Create separate store, update, activate, and deactivate backend operations.
  - [ ] Hash staff passwords in Laravel and reject login for deactivated profiles.
  - [ ] Replace the Employee Supabase service with Axios and TanStack Query.
  - [ ] Refactor the Employee page and modals while keeping the current UI behavior.
  - [ ] Remove `supabaseAdmin.js` and its frontend service-role environment variable after testing.
- [ ] Rotate the Supabase service-role key.
- [ ] Migrate Expenses.
- [ ] Migrate POS checkout.
- [ ] Migrate Orders.
- [ ] Migrate Reports.
- [ ] Complete Profile and password management.

## Offline Mode

- [ ] Add offline lock screen.
- [ ] Allow only POS while offline.
- [ ] Add client transaction UUID and database uniqueness.
- [ ] Add Laravel sync endpoint and idempotency protection.
- [ ] Match online and offline stock calculations.
- [ ] Test failed and repeated sync.
- [ ] Test Cash and GCash offline behavior.

## Final Checks

- [ ] Configure and verify the Laravel scheduler runner for local use and production hosting.
- [ ] Review backend folder structure and move non-HTTP business logic from Controllers into Actions or Services.
- [ ] Run frontend lint and build.
- [ ] Run Laravel tests.
- [ ] Test every role and protected endpoint.
- [ ] Run security review.
- [ ] Test production deployment and backups.

## Next Task

Migrate the Expense Category frontend flow to Axios and connect it to the existing Laravel CRUD endpoints.
