# Temporary Implementation Plan

Updated: September 11, 2026

## Goal

Move all backend work to Laravel safely, one module at a time. Keep the current system working during migration.

## Rules

- Archive main business records. An unused Menu Category may be permanently deleted because it has no business history connected to it.
- Do not remove Supabase code until its Laravel replacement is tested.
- React validates for user feedback; Laravel validates for security.
- Laravel owns authorization, calculations, transactions, and audit logs.
- Use Menu Management as the structure reference after fixing its weaknesses.

## Phase 1: Protect Current Work

1. Review staged and unstaged changes.
2. Make a safe Git checkpoint.
3. Back up the database before cleanup.

## Phase 2: Database Cleanup

1. Fix quoted `menu_item_prices.pos_status` values.
2. Fix the incorrect status default.
3. Add missing archive columns.
4. Review UUIDs, foreign keys, unique fields, money, and quantity constraints.
5. Fix the unused `users` table and profile/auth migration problems.
6. Tighten Supabase RLS without breaking modules still using Supabase.

## Phase 3: Authentication and Security Foundation

1. Return Profile with Role from Laravel `/user`.
2. Remove React's fallback to Owner.
3. Safely rename the application `profiles` table to `users` and keep Laravel's `User` model.
4. Add Laravel role middleware or policies.
5. Add login throttling.
6. Create consistent Axios handling for 401, 403, and 422 errors.

## Phase 4: Secure Menu Management

1. Add Form Requests for Menu Items, Add-ons, and Categories.
2. Validate complete nested payloads.
3. Check that price and recipe IDs belong to the correct parent.
4. Calculate cost, profit, and margin in Laravel.
5. Enforce safe Menu Category deletion in Laravel: allow it only when no Menu Item or Add-on uses it.
6. Correct archived-record filtering.
7. Move remaining activity logging to Laravel.

After this phase, Menu becomes the safe reference for other modules.

## Phase 5: Finish Inventory Migration

Recommended order:

1. Inventory init and category archive/unarchive.
2. Add Inventory Item orchestrator.
3. Edit Inventory Item sync orchestrator.
4. Item archive/unarchive and affected-menu checking.
5. Restock and new batch creation.
6. Wastage and correction.
7. Stock audit and history.
8. Inventory valuation.
9. Remove replaced Inventory Supabase calls.

Every multi-table operation must use one Laravel database transaction.

## Phase 6: Employees and Auth Ownership

1. Move Employee Management to Laravel.
2. Let Laravel create and hash staff passwords.
3. Add employee archive/unarchive.
4. Remove the frontend Supabase service-role key.
5. Rotate the exposed service-role key.
6. Complete Laravel password change/reset.

## Phase 7: Remaining Modules

Migrate in this order:

1. Expenses
2. Order History
3. Reports
4. Profile and activity logs
5. POS checkout

## Phase 8: Offline Mode

1. Add an offline lock screen.
2. Restrict offline access to POS only.
3. Cache safe Menu and recipe data.
4. Add a permanent client transaction UUID.
5. Add Laravel idempotency protection.
6. Sync through Laravel transactions.
7. Test retries, browser restart, Cash, and GCash behavior.

## Phase 9: Final Cleanup and Deployment

1. Remove unused direct Supabase database access.
2. Refactor remaining large React pages.
3. Complete automated tests.
4. Run a security review.
5. Test Vercel, Render, HTTPS, CORS, backups, and recovery.

## Recommended Starting Point

Start with the current-work checkpoint, then fix the database status values and archive support before continuing Inventory.
