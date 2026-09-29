# Senorito Cafe POS — Codex Project Handoff

Last updated: September 29, 2026 (Asia/Manila)

This file is the concise operational handoff for another Codex account. It does not replace the project rules, implementation plans, or task lists. Always re-read the live files before changing code because they are the source of truth.

## 1. Resume Here First

Before planning, reviewing, or editing:

1. Read every `.cursor/rules/*.mdc` file completely.
2. Read `temporary/FRONTEND_IMPLEMENTATION_PLAN.md`.
3. Read `temporary/FRONTEND_TASK_LIST.md`, especially `Current Next Task`.
4. For backend work, also read `temporary/BACKEND_IMPLEMENTATION_PLAN.md`, `temporary/BACKEND_TASK_LIST.md`, and the task-specific backend list it references.
5. Run `git status --short --branch` and preserve all existing work.
6. Inspect the current page, components, styles, hook, services, routes, and consumers before proposing or applying changes.
7. Search references with `rg` before moving or deleting anything.

Current verified repository state:

- Branch: `main`
- Remote tracking: `origin/main`
- Verified commit: `f501a82` (`rename workers pages`)
- Worktree was clean when this handoff was created.
- Frontend focused Employee lint passes.
- Production/PWA build passes.
- Build still reports a large main JavaScript chunk warning: approximately `2,261 kB` before gzip / `645 kB` gzip. This is a deferred code-splitting concern, not a build failure.

## 2. User Collaboration Preferences

The user is learning and normally writes the frontend code with complete guidance.

- Use simple, concise English or Taglish.
- Work in batches of at most three related tasks.
- Before giving code, inspect the exact target files and affected consumers.
- For snippets, include the file path, stable line number when possible, and at least two nearby lines as placement anchors.
- Explain the purpose of each change without sacrificing production quality.
- Do not dump complete files into chat unless the user explicitly requests a complete file.
- Default to guidance only. Edit files only when the user explicitly says to implement, apply, fix, refactor, clean up, or otherwise authorizes the named change.
- The agent may perform frontend JSX/component/layout/style refactors when explicitly authorized.
- Laravel and frontend service files are user-owned unless the user explicitly authorizes the named service/backend task.
- Never install packages or shadcn components. Give the exact command and purpose, then wait for the user to run it.
- Never delete files only because they look unused. Prove zero references, explain the result, and ask first unless explicit cleanup permission already covers those exact files.
- Update `temporary/FRONTEND_TASK_LIST.md` only after the user has tested and approved the completed task.
- Preserve existing routes, service contracts, request/response fields, permissions, calculations, archive behavior, print/export flows, and POS offline behavior during frontend work.

## 3. Product and Technical Overview

Senorito Cafe POS is a tablet-first React/Laravel point-of-sale and back-office application.

### Frontend

- React `19`
- Vite `8`
- React Router `7`
- Tailwind CSS `4`
- shadcn/ui using Base UI primitives
- TanStack React Query `5`
- TanStack React Table `9`
- Axios shared instance
- Recharts
- Dexie/IndexedDB for POS offline behavior
- Bootstrap Icons are the approved application icon family
- Local Inter variable font
- PWA through `vite-plugin-pwa`

### Backend and data

- Laravel API under `backend/`
- Laravel Sanctum authentication
- Supabase-hosted PostgreSQL and Storage
- Most active modules now use Laravel controllers/services through Axios and React Query.
- Legacy direct Supabase paths remain in some areas and must not be removed without a verified migration.

### Standard frontend data flow

```text
Page/component
  -> TanStack Query hook
  -> module service
  -> shared Axios instance
  -> Laravel API
```

Do not call Axios, raw `fetch`, or Supabase directly from redesigned components unless the existing approved module contract specifically requires it.

## 4. Frontend Architecture and Styling Standards

### Shared application layout

```text
MainLayout / App shell
  Sidebar
  Topbar
  Outlet
    PageLayout
      Breadcrumbs
      PageHeader
      Module content
```

Important layout files live under `src/components/layout/`.

### Component-based architecture

- Main pages should act as traffic controllers: fetched data, modal state, callbacks, and prop mapping.
- Meaningful page sections belong in focused module components.
- Do not create a component for every `div`.
- Reusable global UI belongs under `src/components/`.
- Module-specific content stays under the module's `components/` or `modals/` folder.
- Reusable formatters/calculations belong under `src/utils/`.

### Styling

- Tablet-first reference: `1194x834` landscape.
- Verify desktop `1440x900`, phone `390x844`, and short phone `390x600`.
- Canonical responsive guidance: `src/styles/responsive.css` and `.cursor/rules/frontend-responsive-layout.mdc`.
- Semantic tokens: `src/styles/theme.css`.
- Typography/spacing/touch targets: `src/styles/typography.css`.
- Use Tailwind in focused components for typography, colors, local spacing, states, and component presentation.
- Keep each module CSS file layout-only: grids, panel relationships, height clamps, scrolling, print rules, and breakpoints.
- Use theme variables rather than repeated hex values.
- Main panel padding is generally `var(--app-padding-panel)`.
- Use the approved spacing tokens: `--app-space-*`, `--app-gap-related`, `--app-gap-section`, and `--app-gap-columns`.
- Important tablet actions need at least a `44px` touch target.
- Use subtle borders and `--app-shadow-card` where approved.

### Shared UI systems already available

- Layout: `src/components/layout/`
- Data table and pagination: `src/components/data-table/`
- Filters, search, date range, sidebar filter sections: `src/components/filters/`
- Feedback/loading/empty/error primitives: `src/components/feedback/`
- Shared summary cards: `src/components/summary-cards/`
- Shared form modal pieces: `src/components/modals/Modal*.jsx`
- Shared confirmation modal: `src/components/modals/ConfirmationModal.jsx`
- shadcn/Base UI primitives: `src/components/ui/`

## 5. Completed or Visually Approved Frontend Areas

The frontend task list contains the authoritative per-item checkboxes. At a high level, the following areas have substantial completed work:

- Authentication layout, Login, Forgot Password, Reset Password, and Setup Password flows
- Shared app shell, Sidebar, Topbar, Breadcrumbs, and PageLayout
- Dashboard
- Order History
- Inventory Stock Overview tabs, Inventory Archive, Valuation, and Audit Log
- Sales Report
- Expense Tracking and Expense Archive
- Menu Management and Menu Archive
- Employee Management table layout
- Shared DataTable, pagination, filtering, responsive table behavior, and skeleton patterns
- Shared modal foundation and several Inventory/Expense modal migrations

Do not assume every checkbox in those phases is complete. Read the live task list before continuing.

## 6. Shared Modal Strategy

Three approved form-modal variants are being migrated:

1. **Variant 1 — Multi-step:** configurable `ModalStepper`; currently used by Add Inventory Item. Add Menu Item and Add Add-on are pending.
2. **Variant 2 — Standard/conditional form:** used by stock actions, Edit Inventory, Expense, and Employee forms.
3. **Variant 3 — Category management:** used by Inventory/Menu/Expense category workflows.

Shared form-modal structure:

```text
Modal
  ModalHeader
  ModalBody
    ModalContent
      Module fields/components
  ModalFooter
```

The reusable confirmation structure is intentionally separate and uses shadcn/Base UI AlertDialog:

```text
ConfirmationModal
  Row 1: centered icon
  Row 2: title
  Row 3: caption/description
  Row 4: optional additional-information cards
  Row 5: primary action
  Row 6: secondary/cancel action
```

The confirmation modal is configured through props. The caller owns service calls, payloads, refetching, and open state.

## 7. Exact Active Frontend Work: Employee Confirmation UI

This is the latest active UI task and has not yet received final visual approval.

### Files involved

- `src/components/modals/ConfirmationModal.jsx`
- `src/components/ui/alert-dialog.jsx`
- `src/styles/theme.css`
- `src/pages/employees/EmployeeManagementPage.jsx`
- `src/pages/employees/components/EmployeeTable.jsx`
- `src/pages/employees/components/EmployeeActionsMenu.jsx`
- `src/pages/employees/modals/Edit Employee/EditEmployeeModal.jsx`
- `src/pages/employees/modals/Password Reset Request/PasswordResetRequestModal.jsx`
- `src/services/employees/employeeAccountsService.js`
- `src/hooks/useEmployeeManagement.js`

### Current implemented behavior

- Edit Employee no longer offers `Owner` in its role combobox.
- Add/Edit Employee use the shared Variant 2 modal direction.
- Employee Management uses a shared DataTable with search, role/status filtering, pagination, badges, and row actions.
- Employee status display priority is intended to be:
  1. Deactivated
  2. Pending Setup
  3. Reset Requested
  4. Reset Link Sent
  5. Active
- Deactivate and Reactivate use the reusable ConfirmationModal and real Laravel service actions.
- Password-reset review uses one modal and real Laravel actions for approve, cancel, and resend.
- Setup-link resend cooldown is owned by `EmployeeTable` using per-employee expiry timestamps. `EmployeeActionsMenu` receives `cooldown` and `onCooldownStart`. This prevents the countdown from resetting when another modal causes table cells to render again.
- Password Request additional information currently shows Employee and Email only.
- Confirmation negative/secondary buttons use gray styling.
- Confirmation buttons use approved theme tokens:

```css
--app-color-confirm-danger: rgb(230 57 70 / 75%);
--app-color-confirm-success: rgb(83 142 85 / 75%);
```

- `ConfirmationModal` now forces its header into `flex flex-col`, overriding shadcn's default desktop grid that previously placed the icon beside the title.
- Optional detail cards use a compact two-column layout, gray surfaces, compact padding, and gray circular icons.

### Required visual result

The confirmation modal must render vertically:

1. Centered circular icon alone
2. Centered title
3. Centered caption
4. Optional detail cards
5. Full-width primary button
6. Full-width gray cancel/secondary button

Do not put the icon beside the title. The user was explicit about this.

### Pending visual verification

Test all of these before marking Employee modal work complete:

1. Open Review Password Request and confirm the icon is centered above the title.
2. Confirm Employee and Email detail cards are compact and do not dominate the modal.
3. Confirm long email addresses wrap without horizontal overflow.
4. Confirm Pending request actions display Approve and Send Link plus gray Cancel Request.
5. Confirm Approved request actions match the backend-approved requirements.
6. Send a setup link, open Deactivate/Edit/another modal, return to the row actions, and confirm the countdown continued instead of resetting.
7. Confirm Owner is absent from Edit Employee role options.
8. Verify Deactivate/Reactivate success, failure, loading lock, Escape/outside click, and reopen behavior.
9. Verify at `1194x834`, `1440x900`, `390x844`, and `390x600`.

### Important discrepancy to resolve

The approved backend requirement previously stated that an **Approved** password-reset request should show:

- Resend Link
- Cancel Request
- Close

The current `PasswordResetRequestModal.jsx` approved branch currently renders only **Resend Link** and **Close**. Confirm with the user/backend partner whether gray **Cancel Request** must be restored before marking the flow complete.

### Verification status at handoff creation

Focused ESLint passed for:

- `ConfirmationModal.jsx`
- `EmployeeManagementPage.jsx`
- `EmployeeTable.jsx`
- `EmployeeActionsMenu.jsx`
- `EditEmployeeModal.jsx`
- `PasswordResetRequestModal.jsx`

`npm run build` also passed, including PWA generation. Only the large-chunk warning remains.

Do not update the Employee/Modal task checkboxes until the user visually approves this latest confirmation layout.

## 8. Frontend Next Work After Employee Approval

The current official frontend next task is:

> Migrate Add Menu Item as the next Variant 1 modal while preserving variants, prices, recipes, image handling, services, validation, and payloads.

Before starting it:

1. Re-read the current Add Menu Item modal, local components, validation utilities, Menu hook/services, and all consumers.
2. Review the supplied modal/Figma reference.
3. Confirm whether every required shadcn primitive is already installed. The user must run any install command.
4. Propose the exact multi-step structure and data ownership before editing.
5. Preserve image upload, price/variant IDs, recipe IDs, payload shapes, and refetch behavior.

Other incomplete modal work includes:

- Expense Manage Categories
- Edit Add-on
- Edit Menu Item
- Add Add-on Variant 1
- Full cross-viewport modal verification
- Keyboard/focus/reduced-motion verification
- Proven zero-reference cleanup of remaining legacy modal files

## 9. Active POS Frontend Handoff

The user has started the Point of Sale visual migration. This is frontend UI work only for now.

### User-approved POS direction

- Use the shared application shell supplied by `MainLayout`:

```text
.layout-content-wrapper
  .layout-topbar
  .layout-main
    .pos-page-shell.pos-page-layout
```

- POS is allowed to have a specialized inner workspace, but it must still follow the same global theme, typography, spacing, responsive, and component conventions used by Inventory and Menu.
- Do not redesign the Customize Order modal yet. The user has a separate UI reference for it and explicitly deferred that work.
- The Customize Order modal should eventually open from the add-on indicator/action, but its final interaction should be handled in a later batch.
- Do not change POS API services, hooks, checkout calculations, offline Dexie behavior, or payloads during the visual migration.
- Work in small batches, normally no more than five concrete steps, and pause for the user to test before continuing.
- The user will run the build and tests. Do not claim verification unless the user reports it or explicitly asks the agent to run it.

### POS reference layout

```text
POSPage
  POS page shell
    Catalog area
      Shared search input
      Horizontal category filter chips
      Semantic category sections
        Product grid
          Product cards
      Not Available category
    Order panel
      Current Order header + Clear action
      Order source buttons
      Cart items
      Subtotal
      Discount dropdown (not collapsible)
      Total
      Payment method buttons
      Process Order action
```

Desktop should show three product cards per row, tablet two, and mobile one. The order panel remains visible on desktop/tablet and becomes the existing mobile drawer/FAB flow on phones. Catalog and order lists should scroll internally on short screens.

### POS files and current state

- `src/pages/pos/POSPage.jsx`
  - Still owns the existing POS state, data loading, cart behavior, checkout flow, receipt flow, and offline sync.
  - Now has the page shell classes `pos-container pos-page-shell pos-page-layout`.
  - Uses the shared `ToolbarSearchInput` for catalog search.
  - Uses semantic catalog sections and category filtering logic.
  - Keeps `CartSidebar` and `CustomizeOrderModal` behavior intact.
- `src/pages/pos/components/CategoryScroller.jsx`
  - Now uses Tailwind classes and global `--app-*` tokens.
  - Acts as the horizontal category filter navigation.
- `src/pages/pos/components/ProductCard.jsx`
  - Card redesign is intentionally deferred after the user rejected the previous POS-specific CSS approach.
  - Do not add new card styling to `pos.css`; follow the Tailwind structure used by `src/pages/menu/components/MenuItemCard.jsx`.
- `src/pages/pos/components/CartSidebar.jsx`
  - Clear action is always rendered, disabled/grey when the cart is empty, and active when the cart has items.
  - Current discount control is the native select/dropdown. Replace it with the existing shadcn `DropdownMenu` only if the user requests the exact shadcn visual treatment; do not install a new component without approval.
- `src/pages/pos/pos.css`
  - May contain POS page-level layout behavior: workspace grid, panel relationship, height clamps, internal scrolling, mobile drawer, and breakpoints.
  - Do not use it for component presentation, typography, product-card visuals, or toolbar styling.
  - The old search/category CSS was removed after migrating those components to Tailwind.

### Required styling pattern for all future POS work

Use the same pattern as Inventory and Menu:

- Page layout CSS only for grids, relationships, scroll regions, height constraints, and responsive breakpoints.
- Tailwind classes inside components for typography, colors, borders, spacing, states, badges, buttons, and local layout.
- Use tokens from `src/styles/theme.css` and `src/styles/typography.css`, for example:
  - `text-[length:var(--app-font-size-body-secondary)]`
  - `leading-[var(--app-line-height-body-secondary)]`
  - `gap-[var(--app-gap-related)]`
  - `p-[var(--app-space-4)]`
  - `rounded-[var(--app-radius-panel-standard)]`
  - `shadow-[var(--app-shadow-card)]`
- Reuse existing components before creating new ones:
  - `ToolbarSearchInput`
  - `FilterPopover`
  - `FilterOptionGroup`
  - `Badge`
  - `Button`
  - `Skeleton`
  - `ScrollArea`
  - shared modal primitives
- Do not use raw `h2`/`p` CSS in module styles to define typography; apply the typography tokens inline in JSX.

### POS work completed in the current session

- Added semantic POS page/workspace wrappers.
- Added available/unavailable catalog grouping logic.
- Added the `Not Available` category.
- Kept `All` and regular categories limited to available products.
- Migrated POS search to `ToolbarSearchInput`.
- Migrated category chips to Tailwind/token classes.
- Converted catalog section and product-grid layout classes to Tailwind/token classes.
- Fixed a JSX closing-tag mismatch in `POSPage.jsx` after the semantic migration.
- Reverted the earlier experimental product-card redesign so the next card implementation can follow the Menu `MenuItemCard` pattern.

### Next POS batch

Before coding the next batch, read and compare:

1. `src/pages/menu/components/MenuItemCard.jsx`
2. `src/pages/menu/components/MenuItemsSection.jsx`
3. `src/pages/menu/menuManagement.css`
4. `src/pages/inventory/components/InventoryStockTable.jsx`
5. `src/pages/inventory/inventory.css`
6. `src/components/filters/ToolbarSearchInput.jsx`
7. `src/components/filters/FilterOptionGroup.jsx`
8. `src/styles/theme.css`
9. `src/styles/typography.css`

Then implement only the product-card presentation with Tailwind classes, including unavailable card states and add-on indicator styling. Do not put component styles into `pos.css`. Pause for user visual review after that batch.

### POS verification still pending

The user has not yet run or approved this POS batch. Verify visually at `1194x834`, `1440x900`, `1024x768`, `390x844`, and `390x600`. Also verify loading, empty, unavailable, and offline/online states without changing their underlying data behavior.

## 10. Backend/Deployment Direction

If the new Codex account is asked to work on backend or deployment instead of frontend, do not follow the frontend next task blindly.

The official backend next task is to follow:

- `temporary/DEPLOYMENT_TASK_LIST.md`

Current deployment direction recorded by the project:

- Cloudflare Pages for React/Vite PWA
- Render Free Singapore for Laravel pilot
- Supabase for PostgreSQL, Storage, and scheduled maintenance
- Keep the current Vercel deployment unchanged until Cloudflare is verified

Significant backend work already includes Laravel module APIs, authentication/password recovery, POS checkout, offline queue/sync, idempotency, and inventory deductions. Read the backend task list and current code before assuming a migration is incomplete.

## 11. Known Deferred or High-Risk Areas

- Point of Sale visual redesign still needs its approved Figma reference.
- Profile redesign still needs its approved reference.
- Final shared button design is deferred.
- Final EmptyState design is deferred; current shared EmptyState is functional placeholder UI.
- Full app responsive, keyboard, focus, and contrast QA remains.
- Real Topbar sync/offline status remains deferred; do not treat a visual placeholder as a real system indicator.
- Several legacy styles/assets require a fresh zero-reference check before deletion.
- Large frontend bundle/code splitting remains a production optimization task.
- Do not disturb Dexie/offline POS behavior during visual refactors.
- Do not expose or copy `.env` secrets into documentation or chat.

## 12. Useful Commands

PowerShell may block `npx.ps1`; use the `.cmd` executable when needed.

```powershell
# Current state
git status --short --branch

# Fast file/reference search
rg --files src
rg -n "SearchTerm" src

# Focused lint example
npx.cmd eslint "src/components/modals/ConfirmationModal.jsx" "src/pages/employees/**/*.jsx"

# Production/PWA build
npm.cmd run build

# Start Vite locally
npm.cmd run dev
```

Never run destructive Git commands such as `git reset --hard` or discard user changes. Do not run automatic dependency upgrades or package installs without user approval.

## 13. Source-of-Truth Priority

When information conflicts, use this order:

1. Current working code and explicit latest user instruction
2. `temporary/FRONTEND_TASK_LIST.md` or the task-specific backend list
3. Current implementation plans
4. `.cursor/rules/*.mdc`
5. This `HANDOFF.md`
6. Older reports, screenshots, backups, and chat memory

The next Codex account should continue naturally from the active task, not restart or redesign already approved modules.
