# Frontend Figma Migration Task List

Updated: September 29, 2026

Legend: `[ ]` pending, `[~]` active, `[x]` completed, `[-]` intentionally deferred

## Protection and Planning

- [x] Review the existing frontend documentation and architecture.
- [x] Confirm that the starting worktree is clean.
- [x] Create the `feat/frontend-figma-redesign` branch.
- [x] Record the supplied main-page references.
- [x] Create the frontend implementation plan.
- [x] Create this frontend task list.
- [x] Create the frontend design questionnaire.
- [x] Add focused frontend architecture, design-system, and Figma workflow rules.
- [x] Add an always-applied frontend session-continuity rule with resume checks and centralized-versus-local component guidance.
- [x] Record the approved frontend design decisions.
- [x] Create the concise frontend chat handoff prompt.
- [x] Run a baseline lint and production build before UI dependencies are changed.

### Baseline Result

- Production build passes with the current application.
- Global lint currently reports 189 pre-existing problems: 187 errors and 2 warnings.
- Most lint findings are unused React imports, newer React purity/effect rules, and caught-error handling rules.
- The production bundle reports a large JavaScript chunk warning at approximately 1.30 MB before gzip.
- Locked dependency installation reports 1 moderate and 5 high audit findings. Review them separately; do not run an automatic breaking upgrade during visual migration.
- New frontend work must not increase the baseline lint count. Each migrated module should pass focused lint before approval.

## Confirmed Scope

- [x] Preserve all backend behavior and API contracts.
- [x] Migrate one module at a time.
- [x] Treat currently supplied Figma screenshots as tablet references unless explicitly labeled otherwise.
- [x] Confirm all supplied tablet references use a fixed `1194px` width with variable page height for scrollable content.
- [x] Treat Figma as visual direction, not a literal component implementation; approved reusable shadcn/Base UI improvements may intentionally differ.
- [x] Build and approve the tablet layout first, then adapt each module to desktop and mobile before completion.
- [x] Apply the Dashboard responsive-layout approach to every module using `src/styles/responsive.css` as the canonical tablet-first breakpoint reference: complex module layout/height/scroll rules in module CSS, component-specific Tailwind changes locally, scoped mobile density adjustments, `svh` clamps for short viewports, and checks at tablet, desktop, phone, and short-phone viewport sizes.
- [x] Start every redesigned module by building and approving its complete page layout first, modeled on the Dashboard/Order History named-region approach. Define the page's content regions, columns, full-width rows, gaps, scroll containment, and responsive behavior before styling individual cards, charts, tables, or controls.
- [x] Keep each module's CSS file dedicated to that module's complex grid, height/clamp, scroll, print, and breakpoint relationships. Keep normal component presentation, spacing, typography, colors, and local responsive changes in Tailwind within the focused component.
- [x] Require visual approval before starting the next module.
- [x] Use simple English for all guidance and progress updates.
- [x] Default to guidance-only work with a maximum of three tasks per batch to reduce token usage.
- [x] Require complete production-quality guidance without omitting architecture, reuse, accessibility, responsive behavior, UI states, or testing when the user writes the code.
- [x] Let the user apply frontend code by default; the agent edits only when explicitly asked to edit, apply, or implement a named task.
- [x] Let the user run all dependency installation and package-scaffolding commands.
- [x] Tell the user which shadcn/ui components are needed before every new module and wait for the user to add the approved components.
- [x] Let the user write Laravel backend code.
- [x] Keep frontend service-layer files user-owned unless the user explicitly authorizes the agent to edit named service files for a specific task.
- [x] Require every fetched module to distinguish loading, error, empty, and populated states. Failed requests must not be converted into empty arrays, objects, or zero-data success states; test failure and retry behavior when a module fetch is migrated.
- [x] Require each fetched module's loading state to use structured shadcn Skeletons that mirror the final card, avatar, text, form, list, or table layout; keep loading presentation in the focused component and loading coordination in its page or hook.
- [x] Let the agent create and refactor frontend layout, JSX, and styling files.
- [x] Keep the current sidebar background color.
- [x] Plan sidebar group labels without changing route paths.

- [-] Final shared button styling — waiting for its dedicated design.

- [x] Receive the shared category, status, and sort filter visual reference.
- [ ] Define and test the shared filter interaction and responsive behavior from the approved reference.

- [-] Modal redesigns — waiting for dedicated references.

## Figma Reference Checklist

- [x] Login
- [x] Loading screen
- [x] Sidebar
- [x] Dashboard
- [x] Order History
- [x] Inventory Stock Overview
- [x] Inventory Valuation
- [x] Inventory Audit Log
- [x] Sales
- [x] Expense Tracking
- [x] Menu Management
- [x] Employee Management
- [ ] Point of Sale
- [ ] Profile
- [x] Forgot Password
- [x] Reset Password
- [ ] Store Settings, if included in the product scope
- [ ] Shared button variants and states
- [x] Shared filter visual direction for category, status, and sorting controls
- [ ] Additional complex filter variants and interaction states
- [ ] Modal designs and interaction states
- [ ] Desktop website references or approved responsive rules
- [ ] Mobile references or approved responsive rules

## Phase 1: UI Foundation

- [x] Run baseline frontend lint — completed with documented pre-existing failures.
- [x] Run baseline frontend production build — passed.
- [ ] Review the six dependency audit findings without applying automatic breaking upgrades.
- [x] Record a later code-splitting task for the large production bundle. The current 2.1 MB main chunk also exceeds Workbox's default 2 MB precache limit.
- [x] Review current global styles and custom UI components for migration conflicts.
- [ ] Create `temporary/figma-references/` with module folders and `REFERENCE_INDEX.md`.
- [ ] Save original screenshot exports using descriptive screen, device, width, and scroll-aware filenames.
- [ ] Record each export's dimensions and intentional implementation differences in the reference index.
- [x] User: Install Tailwind CSS using the Vite integration.
- [x] Agent: Connect the Tailwind Vite plugin.
- [x] Agent: Enable Tailwind utilities without applying Preflight to legacy pages.
- [x] Agent: Configure the `@/` import alias for Vite and the editor.
- [x] User: Initialize shadcn/ui using Base UI and the Nova preset.
- [x] Agent: Keep new shadcn components under the standard `src/components/ui` location.
- [ ] User: Add each approved shadcn/ui component through the terminal.
- [x] Agent: Configure the frontend files and shared class-name utility created by the setup.
- [x] Create `src/styles/theme.css` as the shared token source for redesigned modules.
- [x] Define initial semantic color, control-height, radius, shadow, and focus tokens.
- [ ] Define foreground colors that pass accessibility checks.
- [ ] Define typography, spacing, radius, border, shadow, and focus tokens.
- [x] Approve Bootstrap Icons as the application icon library for redesigned screens.
- [ ] Replace generated Lucide usage with Bootstrap Icons when adding or migrating components.
- [ ] Run a final zero-reference check before proposing removal of the Lucide dependency.
- [x] User: Install the local Inter font package after receiving the exact approved command and purpose.
- [x] Agent: Switch redesigned screens to locally bundled Inter and remove Google Fonts and temporary Geist usage — focused lint and production build passed.
- [ ] Consolidate redesigned semantic tokens in `src/styles/theme.css` without breaking legacy consumers in `variables.css`, `index.css`, or `layout.css`.
- [ ] Remove Vite starter/demo global styles only after proving they have no required consumers.
- [ ] Update the existing component preview page into a basic UI catalog.
- [ ] Create shared Loading, Error, Empty, and Skeleton states.

- [-] Final shared EmptyState visual design — the current reusable EmptyState is functional placeholder copy/styles until its approved design is ready; then update it centrally and review every consumer.

- [ ] Build the shared customized table foundation from shadcn Table primitives when the first table module begins.
- [ ] Keep column definitions inside their modules so the shared table does not become an oversized universal component.
- [x] Make shared DataTable cells wrap long content, preserve automatic row growth, and provide reliable native two-axis scrolling with temporary auto-hiding scrollbars.
- [ ] Build shared simple filter popover and sort-menu patterns from the supplied reference.
- [ ] Preserve current sorting, filtering, pagination, export, print, payload, and API behavior while replacing table presentation.
- [ ] Do not add TanStack Table unless a later module proves it is needed and the user approves it.
- [ ] Review and approve the UI foundation.

## Phase 2: Authentication and Loading

- [x] Confirm shadcn/ui requirements for Login and Loading — no additional downloads are needed.
- [x] Use the installed shadcn/ui `Button` for the Login submit action.
- [x] Create the reusable Auth layout.
- [x] Split the Login screen into clear presentational sections.
- [x] Apply and approve the tablet Login design.

- [-] Defer desktop Login screenshot review to final responsive QA.
- [-] Defer mobile Login screenshot review to final responsive QA.

- [x] Implement the three-slide Login carousel with manual controls and an automatic five-second infinite loop.
- [x] Keep the current authentication service and payload unchanged.
- [x] Preserve the existing validation, loading, error, and forgot-password behavior.
- [x] Add the Remember Me checkbox and local UI state.

- [-] Connect Remember Me to token persistence — it requires a service-layer decision by the user.

- [x] Implement and review the reusable full-screen loading design.
- [x] Verify optimized transparent bean assets and graceful text-only fallback behavior.
- [x] Run focused lint and production build.
- [x] Visually review and approve Authentication at the tablet reference size.
- [x] Migrate Forgot Password into the shared animated Auth flow while preserving its dedicated form state and visual-only resend behavior pending backend integration.
- [x] Keep Reset Password as a standalone focused form route with no visible navigation link; preserve client validation and defer email-token validation/submission to the backend contract.
- [x] Remove the zero-reference legacy `auth.css` after Forgot Password and Reset Password stopped depending on it.
- [~] Connect Forgot Password and Reset Password to the Laravel recovery API.
  - [x] Add a dedicated Axios password-recovery service and TanStack mutation hook.
  - [x] Replace the Forgot Password placeholder with real submission, generic feedback, loading, and a 60-second resend cooldown.
  - [x] Read the reset token and email from the URL and submit them to Laravel.
  - [x] Match Laravel password rules: 8+ characters, uppercase, lowercase, number, and symbol.
  - [x] Reuse the Add Employee password-rule visual behavior through a Tailwind-based shared component without copying its legacy CSS.
  - [x] Keep Reset Password restricted to logged-out Users through `PublicOnlyRoute`; signed-in Users must log out first.
  - [x] Redirect successful resets to Login and show a safe success message.
  - [~] Run focused Auth lint/build and test Owner plus approved-employee recovery. Focused lint and approved Cashier recovery pass; the PWA build is blocked by the existing 2.1 MB main-bundle precache limit.

- [-] Add Owner approval and resend controls to Employee Management — deferred until its Laravel Employee Management integration.

- [x] Show the Pending Setup employee-card state and setup-link resend cooldown.

## Phase 3: Shared App Shell and Sidebar

- [x] Refactor protected routes to use one nested App shell and outlet.
- [x] Keep Sidebar, Topbar, and routed content as separate responsibilities.
- [x] Create reusable Breadcrumbs.
- [x] Create reusable Page layout and Page header.
- [x] Create shared frontend route metadata for labels, breadcrumb labels, sidebar groups, and icons.
- [x] Keep the existing `ROLE_ROUTES` logic as the permission source during the shell migration.
- [x] Preserve the current sidebar brown color.
- [x] Add the `Sales & Reports` group label.
- [x] Add the `Inventory & Menu` group label.
- [x] Add the `Administration` group label.
- [x] Confirm the exact link assigned to every sidebar group.
- [ ] Do not add Store Settings as a working link without an approved route.
- [x] Preserve role-based visibility.
- [ ] Preserve mobile sidebar open, close, overlay, and keyboard behavior.
- [x] Preserve topbar sync and account indicators.
- [x] Add a visual-only `Synced` Topbar placeholder for the UI migration; it must not claim real connection or offline-queue state.
- [x] Keep all current protected routes inside the shared shell; allow POS only a specialized inner layout if its approved design needs one.
- [x] Run focused lint and production build.
- [x] Visually review and approve the shared shell before continuing.

## Phase 3A: Tailwind-First Shared Shell Styling (Deferred)

- [-] Defer Tailwind-first App Shell styling until after page UI work; retain the approved CSS-based MainLayout, Sidebar, and Topbar behavior.

## Phase 4: Dashboard

- [x] Keep the current Dashboard service response unchanged during the current UI migration.

- [-] Defer the Dashboard API Error state and Retry action to final Dashboard checks. With explicit service authorization, make request failures reject with a meaningful error instead of returning an empty array, without changing the successful response shape.

- [x] Migrate Dashboard sections component-by-component with Tailwind-first JSX styling. Do not adjust legacy `dashboard.css` values while a section still uses its selectors.
- [x] Keep reusable colors, gradients, number colors, and shadows in `src/styles/theme.css`; keep only genuinely complex Dashboard behavior (for example, chart internals or custom scrolling) in local CSS if still needed after migration.
- [x] Establish shared tablet typography, 8pt spacing, radius, and touch-target tokens; apply and verify the standard in Expiry Alerts.
- [x] Apply the approved Expiry Alerts typography and spacing pattern to Low Stock Items.
- [x] Apply the same shared typography system to Summary Cards.
- [x] Apply the same shared typography system to Weekly Performance.
- [x] Apply the shared spacing system to the Dashboard overview layout, including full-width Top Selling and Recent Orders rows.
- [x] Restyle and visually approve Top Selling Items as a horizontal five-item menu-card list using the existing Dashboard data and image fallback.
- [x] Migrate and visually approve Dashboard Recent Orders with the reusable customized DataTable. The existing latest-six-order data behavior remains unchanged; selection, toolbar, search, filters, sorting, and pagination remain deferred.
- [x] Create the Dashboard page header and breadcrumbs.
- [x] Extract summary metric cards.
- [x] Extract Weekly Performance.
- [x] Extract Expiry Alerts.
- [x] Extract Low Stock Items.
- [x] Extract Top Selling Items.
- [x] Replace Dashboard loading text with reusable skeleton states and add successful-response placeholder empty states — visual QA and build passed; final EmptyState visual design remains deferred.
- [ ] Match the supplied desktop layout.
- [ ] Create tablet and mobile behavior.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [x] Run focused lint and production build.
- [ ] Visually review and approve Dashboard before continuing.
- [x] Final Dashboard cleanup: after visual approval and build verification, run a zero-reference check, remove obsolete `dashboard.css` selectors, and keep or remove the remaining file only according to the verified complex-style needs.

## Phase 5: Order History

- [x] Preserve the existing order data, client-side search/date/payment/source filters, pagination, and Order Details modal behavior while migrating the visible UI.
- [x] Create the Order History structural foundation: shared `PageLayout`, named `orders-page-layout` children for toolbar/table/pagination, and layout-only `ordersPage.css` modeled after the Dashboard layout pattern.
- [x] Integrate the shared filter foundation: bounded search bar, `FilterPopover`, Report Period, calendar date fields, collapsible multi-select groups, Clear all, and Apply.
- [x] Migrate the visible order table to the reusable `DataTable` with the Dashboard Recent Orders column direction and a final Bootstrap eye View action that preserves the existing details modal.
- [x] Create reusable `DataTablePagination` from the approved shadcn block pagination pattern. It provides rows-per-page selection, page summary, first/previous/next/last actions, and no selection/drag-drop behavior. Replace and remove the Order History-only pagination component.
- [x] Match the supplied main-page layout.
- [x] Handle long tables on tablet portrait, phone, and short-height layouts with horizontal and internal vertical scrolling.
- [x] Preserve status, payment, cashier, and order-source labels.
- [x] Visually verify the shared filter direction, button states, report-period presets, manual-date Custom state, skeletons, and narrow viewport behavior.
- [x] Run focused lint and production build for Order History.
- [x] Visually review and approve Order History before continuing.

## Phase 6A: Inventory Stock Overview

- [x] Preserve Inventory query, stock, batch, archive, and modal behavior during the approved Stock Overview migration.
- [x] Build and approve the responsive-first Inventory page layout: `PageLayout`, page-header actions, line-variant four-tab workspace, tab caption, named regions, tablet columns, full-width table row, responsive stacking, and dense-panel scroll containment. Keep `inventory.css` layout-only before styling individual sections.
- [x] Build the line-variant shadcn Tabs workspace: Stock Overview (default), Batches, Wastage, and Purchase History. Keep focused tab content components rather than nesting a complete page layout inside every tab.
- [x] Extract Inventory Stock Insights with reusable summary cards and approved Quick Action visuals.
- [x] Make Stock Overview summary cards interactive: selecting a metric applies the matching existing stock filter without changing Inventory data behavior.

- [x] Reconnect Receive Stock, Log Wastage, and Correction through dedicated item-aware modal flows from Inventory Quick Actions and the table Stock Log submenu.

- [x] Build the Inventory Items view on the shared customized table foundation with stable Inventory-only column widths, badges, row-action menu, and pagination.
- [x] Consolidate Stock Overview to the same focused composition as Batches and Wastage: one Insights component plus one self-contained table component that owns its toolbar, columns, and pagination.
- [x] Build Batches with one-row clickable Overall Batches, Expiring in 7 Days, Expired, and placeholder Value at Risk summary cards, followed by the Item Batches shared table section.
- [x] Keep the Batches table focused on Batch #, Quantity, Unit Cost, Expiration, Status, Source, and Added, plus row selection for Print QR.
- [x] Add Batches search, sidebar-section filters, Latest Added / Oldest Added sorting, Print QR selection, and shared pagination.
- [x] Reuse the shared `FilterDateRange` inside the Batches and Wastage Timeframe sidebar section for independent Received Date and Expiration Date ranges; do not maintain an Inventory-only date-range wrapper.
- [x] Add Latest Added and Oldest Added sorting to Stock Overview without changing its stable Inventory-only columns.
- [x] Build Wastage with one-row clickable Total Wastage Cost, Total Wastage Logs, Most Wasted Item, and Most Common Reason summary cards.
- [x] Build the Wastage Logs shared table with search, Timeframe/Category/Reason/Source sidebar filters, Latest/Oldest sorting, badges, and pagination, without row selection or Print QR.
- [x] Consume the permanent top-level `purchaseHistory` init payload with its item, batch, and creator relationships; do not reconstruct purchase history from mutable batch quantities.
- [x] Build Purchase History as a table-only tab with search, shared date/supplier filters, Latest/Oldest sorting, the shared DataTable, and shared pagination without Print.
- [x] Run focused Inventory lint and production/PWA build after Stock consolidation and Purchase History integration.
- [x] Visually review and approve the Purchase History tab at tablet, desktop, portrait, and phone widths.
- [x] Migrate Inventory Archive to the shared `PageLayout` with a Back to Inventory header action and one self-contained Archive table component owning its search, Categories/Status sidebar filters, shared DataTable, skeleton, restore action, and pagination.
- [x] Remove the proven-unused legacy Archive header/filter components, keep `inventoryArchive.css` layout-only, and apply the shared responsive height limits for phone and tablet portrait.
- [x] Run focused Archive lint and the production/PWA build after migration and cleanup.
- [x] Visually review and approve Inventory Archive at tablet, desktop, portrait, phone, and short-height viewports.
- [x] Preserve expiry and stock-status indicators with shadcn badges.
- [x] Apply the approved shared sidebar-filter direction to Stock Overview.

- [-] Defer visual modal redesigns and page-level Quick Action item selection until the full Inventory tab layout is approved; preserve current modal behavior meanwhile.

- [x] Run focused lint and production build for Stock Overview.
- [x] Visually review and approve Stock Overview before continuing.
- [x] Run focused lint and production build for the Batches tab.
- [x] Visually review and approve the Batches tab.
- [x] Run focused lint and production build for the Wastage tab.
- [x] Visually review and approve the Wastage tab.
- [x] Add and visually approve the Inventory Quick Actions structured loading skeleton.
- [x] Clean the Inventory module after Batches/Wastage: consolidate page modal state and ID selection handlers, remove unreferenced legacy `InventoryTable` and summary CSS, keep `inventory.css` layout-only, and localize Archive legacy styles to `inventoryArchive.css`.
- [x] Run focused Inventory lint and production/PWA build after cleanup.

## Phase 6B: Inventory Valuation

- [x] Preserve valuation formulas, export, and print behavior.
- [x] Extract the Value per Inventory panel: chart, category legend, metric summary, and Highest Value view.
- [x] Build the valuation view on the shared customized table foundation with reusable pagination.
- [x] Apply shared category filtering, numeric-aware `0 - Z` / `Z - 0` sorting, and shared toolbar controls.
- [x] Add structured Value per Inventory skeleton, loading, empty, and populated states.
- [x] Add tablet, desktop, phone, and short-height responsive layout/scroll containment.
- [x] Remove zero-reference legacy valuation components and CSS; colocate print-only CSS with its PrintLayout component.
- [x] Run production build.
- [x] Visually review and approve Inventory Valuation before continuing.

## Phase 6C: Inventory Audit Log

- [x] Preserve audit query, formatting, export, and existing behavior. The page has Export only; no Print behavior exists or was added.
- [x] Build and approve the Audit Log page layout: PageLayout, named toolbar/table/pagination regions, contained tablet table width, responsive stacking, and dense-table scroll containment. Keep `inventoryAuditLog.css` layout-only.
- [x] Separate shared toolbar, customized table, Audit-specific badges, and pagination.
- [x] Use the supplied audit layout as direction while applying the shared customized table system.
- [x] Preserve action, source, stock-change, batch, reason, reference, and employee fields.
- [x] Apply the approved simple and sidebar-section filter directions without changing the audit API service.
- [x] Verify loading skeleton, empty state, error fallback, populated state, desktop, tablet, phone, and short-height table containment.
- [x] Run focused lint and production build.
- [x] Visually review and approve Inventory Audit Log before continuing.

## Phase 7: Sales

- [x] Preserve report calculations and export behavior, including XLSX export and print layout.
- [x] Extract reusable summary metrics.
- [x] Extract Menu Profitability: responsive heatmap, metric matrix, and a 60vw detail Sheet using the shared DataTable and local profitability sorting control.
- [x] Extract hourly sales chart.
- [x] Extract Top Selling Items.
- [x] Extract Sales by Order Source.
- [x] Extract Sales by Menu Category.
- [x] Apply the approved shared filter direction where needed.
- [x] Apply responsive desktop, tablet, phone, and short-height behavior.
- [x] Run focused lint and production build.
- [x] Visually review and approve Sales before continuing.

## Phase 8: Expense Tracking

- [x] Preserve the `/expenses` route, Expense/Sales hooks, Expense init payload, calculations, Excel export, category and inventory-purchase behavior, add/edit/archive restrictions, modal flows, permissions, and offline behavior.
- [x] Build and approve the responsive-first Expense page layout: shared PageLayout, four-card summary region, 55/45 Distribution/Quick Actions row, and full-width records region containing toolbar/table/pagination.
- [x] Add the PageHeader actions: three-dot overflow menu containing Export, View Archive, and Manage Categories, followed by the primary Add Expense button. View Archive now routes to `/expenses/archive`.
- [x] Rebuild the four display-only summary cards with shared `SummaryCards`: Total Expenses, Salary, Inventory Purchases, and Top Operating Expense.
- [x] Create one focused `ExpenseOverview.jsx` component owning the 55/45 Expense Distribution and Quick Actions child panels.
- [x] Rebuild Expense Distribution inside `ExpenseOverview` as a header/caption child panel with a responsive bar chart and structured skeleton.
- [x] Align Expense Distribution with Dashboard Weekly Sales: fixed Sunday-to-Saturday buckets with zero totals for calendar days without recorded expenses.
- [x] Build four Quick Actions inside `ExpenseOverview` using the approved Inventory action-card layout. Manage Categories and View Archive are connected; Pay Employee and Purchase Inventory remain intentionally disabled until their modal workflows are approved.
- [x] Build the records toolbar with shared search and a simple, non-sidebar FilterPopover containing Expense Period (`All Time`, `This Day`, `This Week`, `This Month`), shared From/To date range, and collapsible multi-select Categories.
- [x] Migrate Expense Records to the shared DataTable with module-owned columns, light-surface category badges, overflow row actions, loading/error/empty/populated states, and preserved Inventory Purchase restrictions.
- [x] Add shared DataTablePagination and reset to page 1 when search or applied filters change.
- [x] Keep `expenseTracking.css` layout-only and implement desktop, tablet landscape, tablet portrait, phone, and short-height behavior.
- [x] Verify disabled actions, loading, empty, populated, responsive, export, archive/restore, and Add/Edit/Manage Categories open-close-reopen modal behavior. Final cross-module keyboard/contrast and approved ErrorState/Retry checks remain in Final Cleanup.
- [x] Remove the replaced Expense Filter Bar, Distribution Panel, and Category Breakdown components after confirming zero remaining references.
- [x] Build the responsive Expense Archive frontend at `/expenses/archive` using `PageLayout`, Back to Expense Tracking action, category-only filter, search, shared DataTable, shared pagination, category badges, and Restore action.
- [x] Add metadata-driven parent breadcrumbs for Expense Archive and Inventory Archive.
- [x] Return `archivedExpenses` from the Expense init response with category, recorder, and archived-by relationships, and consume it through the existing Expense hook.
- [x] Run focused lint and production/PWA build.
- [x] Expense Tracking and Expense Archive are visually approved, including the three post-cleanup modal smoke checks.
- [x] Restore the shared Base UI ScrollArea to its pre-Content-wrapper structure after that wrapper regressed Recharts rendering; verify Dashboard Weekly Sales and Expense Distribution builds.

## Phase 9: Menu Management

- [x] Keep the current Menu CBA structure as the functional reference.
- [x] Restyle the page header and Menu/Add-ons tabs.
- [x] Create reusable menu product cards.
- [x] Preserve variants, recipes, prices, add-ons, categories, and archive behavior.
- [x] Preserve image fallbacks and loading states.
- [x] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [x] Run focused lint and production build.
- [x] Visually review and approve Menu Management before continuing.

## Phase 10: Employee Management

- [x] Preserve current employee data and role behavior.
- [x] Restyle the page header and content shell with the shared `PageLayout` and a layout-only Employee module stylesheet.
- [x] Split the visible module into `EmployeeDirectory`, `EmployeeToolbar`, and reusable table/action-cell responsibilities.
- [x] Create the responsive Employee shared table with shared typography/tokens, shadcn role/status badges, masked personal information, accessible row actions, skeletons, and an empty state.
- [x] Preserve existing Add and Edit modal behavior and employee-service response handling.
- [x] Apply the approved shared search and multi-select Role/Status filter direction; final shared button styling remains deferred.
- [x] Implement the approved responsive Employee table layout with short-height density adjustments.
- [x] Remove the zero-reference legacy Employee card stylesheet after visual approval.
- [x] Run focused Employee lint and the production/PWA build.
- [x] Visually review and approve Employee Management before continuing.

## Phase 11: Shared Modal System

### Shared Foundation

- [x] Create composable shared modal primitives: `Modal`, `ModalHeader`, `ModalBody`, and `ModalContent`.
- [x] Add reusable `ModalFooter` for Variant 2; module modals import only the pieces they need.
- [x] Add reusable `ModalStepper` for Variant 1 flows with a configurable number of steps.
- [x] Keep fields, state, validation, service calls, payloads, permissions, and refetch behavior inside their current module modal containers.
- [ ] Standardize modal layering above Sidebar/Topbar, internal scrolling, responsive width and height, accessible title/close behavior, keyboard focus, reduced motion, and tablet touch targets.

### Variant 3 — Category Management

- [x] Migrate Inventory Manage Categories and approve it as the Variant 3 reference.
- [x] Migrate Menu Manage Categories using the approved Variant 3 structure.
- [x] Migrate Expense Manage Categories using the approved Variant 3 structure.
- [x] Keep each Variant 3 category workflow inside its module modal file; remove redundant one-use category Add/List component files after their markup is consolidated and references are cleared.
- [ ] Preserve duplicate-name validation, inline editing, usage counts, delete restrictions, submitting states, and empty states in all three category modals.

### Variant 2 — Standard and Conditional Forms

- [x] Migrate Restock into its dedicated searchable/prefilled Variant 2 modal while preserving its service payload and refresh behavior.
- [x] Migrate Log Wastage into its dedicated searchable/prefilled Variant 2 modal while preserving batch selection, service payload, and refresh behavior.
- [x] Migrate Item Correction into its dedicated searchable/prefilled Variant 2 modal while preserving batch correction, service payload, and refresh behavior.
- [x] Migrate Edit Inventory Item into one Variant 2 modal file with searchable category selection, preserved immutable item/base-unit behavior, cost and supplier fields, editable recipe conversions, existing payload/refetch behavior, and zero-reference legacy component/CSS cleanup.
- [x] Migrate Add Expense, including its conditional/custom additional input fields and Inventory Purchase flow.
- [x] Migrate Edit Expense with predefined values while preserving its service payload and refresh behavior.
- [x] Migrate Edit Add-on into the shared Variant 2 modal structure and remove its zero-reference legacy components/CSS.
- [x] Migrate Edit Menu Item.
- [x] Migrate Add Employee.
- [x] Migrate Edit Employee.

### Variant 1 — Multi-step Forms

- [x] Migrate Add Inventory Item with General, Initial Purchase, and optional Recipe Conversion steps; add compatible-unit automatic conversion with manual packaging fallback.
- [x] Add Menu Item implemented with General and Recipe & Pricing steps, required image selection, a responsive square preview (original upload unchanged), customizable modal dimensions, and field-only validation. Legacy Add Menu components/CSS removed after reference checks. Focused lint, build, and mocked UI checks pass; user visual/save approval completed.
- [x] Add Add-on implemented with General and Recipe & Pricing steps, multi-category selection/search, availability, and shared pricing/ingredient fields. Existing service/payload preserved; legacy Add Add-on components/CSS removed after reference checks. Focused lint, build, and mocked save checks pass; user visual/live-save approval completed.

### Modal Migration Verification

- [ ] Test every migrated modal at `1194x834`, `1440x900`, `390x844`, and `390x600`, including short-height internal scrolling.
- [ ] Verify open, close, outside-click, Escape, reopen/reset, validation, duplicate, disabled, submitting, success, failure, keyboard, and focus behavior where applicable.
- [ ] Remove each legacy modal stylesheet or component only after confirming zero remaining references and receiving visual approval.
- [ ] Run focused modal lint and the production/PWA build after every approved variant batch.

### Shared Receipt Modal — POS and Order History (October 2, 2026)

- [x] Replace duplicated receipt markup with one shared receipt document and modal, using the existing Modal/Header/Body/Content/Footer and Button primitives plus theme/typography tokens.
- [x] Match Add Inventory Item's modal shell: 42rem width, 48rem/90svh height cap, canvas body, default ModalContent padding, white bordered inner panel, and matching secondary/primary footer buttons (Close/Print Receipt). Keep receipt content and thermal printing separate; no form stepper. Re-ran focused lint, production/PWA build, and mocked responsive/keyboard/print checks; user visual approval remains pending.
- [x] Keep existing POS props and Order History query/service contracts; use display-only item adapters without changing checkout, saved order totals, stock, or offline sync.
- [x] Render an isolated body-level print copy outside modal scroll constraints, with 58mm content width, monochrome thermal styling, and printer-selected paper length. Scope print isolation to an open, ready receipt.
- [x] Stop importing both legacy receipt stylesheets; retain the files until visual approval and a final reference check.
- [x] Pass focused receipt lint and production/PWA build (existing large-bundle advisory remains).
- [x] User approved the shared modal design. Preserve the subsequently adjusted 30rem width and relocated POS receipt wrapper.
- [x] Replace the receipt loading spinner with the existing shared Skeleton primitive in a receipt-shaped placeholder; retain accessible loading status, reduced-motion support, disabled Print, and no printable skeleton.
- [x] Remove the named receipt-page transition, mount zero-margin/default-paper page settings only with the printable receipt, reset print-time dialog scroll positioning, and keep the payment/footer block together across page breaks.
- [x] Verify paginated local Chrome PDFs: short receipts use one page at 58x210mm and 58x297mm; a 40-item/40-add-on stress receipt contains all items and the closing payment/footer, with no blank pages. The original blank-first-sheet problem did not reproduce in the automated baseline, so the Windows POS-58 preview still requires user confirmation; do not mark the reported issue conclusively resolved yet.
- [x] Pass mocked local Chrome checks: POS/history display parity; 1194x834, 1440x900, 390x844, and 390x600; Escape/close/outside-click/reopen; keyboard focus containment; disabled print on loading/error/empty; print action; isolated print media with other modules' print CSS loaded; 40 items plus 40 add-ons without scroll clipping. No live orders created.
- [ ] User visually approves both receipt entry points and verifies real order values, add-ons, discounts, and online/offline receipts.
- [x] User confirmed the Windows POS-58 preview now shows one sheet at 58x210mm with no leading blank sheet, no margins, and 100% scale. This supersedes the earlier pending preview confirmation; physical output remains unverified.
- [x] Keep monetary receipt-row values on one line and allow long labels to wrap. Verified a long Senior/PWD discount label at 58mm, all five monetary rows, the existing mocked responsive/modal/print checks, focused lint, and production/PWA build. No checkout or stored totals changed.
- [ ] Verify physical Xprinter output. Browser print-media checks do not prove driver/protocol compatibility.
- [ ] After approval, remove the two zero-reference legacy receipt stylesheets. ESC/POS/TSPL transport and sticker printing remain a separate batch.

## Public Printing Test Lab — October 2, 2026

User-approved direction: public `/print-test` on the existing site, with brief beginner-friendly explanations, settings, and separate strategies. Work in reviewable batches. No new native mobile app, no live order data, and no checkout or stock writes. User runs dependency installation commands. Public availability after the user's normal deployment; do not push automatically.

October 2 consolidation: all lab-only source and fixture tests now live inside `src/pages/print-test/`, including its `components/` and `utils/` subfolders. Imports updated; user runs tests/build. Keep future experimental encoders and delivery adapters here until a winning method is approved for production. Do not delete a selected production implementation with the lab: move that reusable implementation into its permanent location first. Cleanup then removes this folder and its import/route/fallback in `src/App.jsx`; shared `src/components/receipt/` remains because POS and Order History use it. Updated fixture test command: `node --test src/pages/print-test/utils/printTestFixtures.test.js`.

- [x] Batch 1 — implemented public `/print-test` outside session loading, with sample-only data, six method guides, readiness labels, working browser receipt test, four receipt fixtures, and three example sticker-preview sizes. Reused existing Card/Button/Badge/Select/Receipt components; no new dependencies or API/checkout/stock changes.
- [x] Batch 1 local verification — five fixture tests, focused lint, production/PWA build, and production-preview browser checks passed. Verified logged-out access, saved-token isolation (no session/API requests), 1194x834/1440x900/390x844/390x600 layouts, sample selection, label/receipt switching, keyboard focus, disabled unimplemented actions, receipt print isolation/Escape, and protected POS redirect to Login. Browser print was stubbed: no real print job or order was sent. Screenshots are in `temporary/ui-reviews/printing-test/`. Existing bundle-size advisory remains.
- [ ] Batch 2 — install ReceiptPrinterEncoder with the user's command; generate text commands from the same fixtures; download commands and send them to the existing PC emulator. Start with ASCII/PHP currency, bounded lengths, no cutter/drawer commands.
- [ ] Batch 3 — render the fixture receipt as a monochrome image; encode supported receipt image commands; compare emulator output and printable dot widths. This is separate from browser PDF printing.
- [ ] Batch 4 — Android RawBT handoff for prepared receipt jobs; explicit user action, compatible profile/settings, unavailable-helper guidance, payload limits, and no false physical-success claim. Verify installed-version licensing and actual Android behavior.
- [ ] Batch 5 — measured sticker dimensions and gap; label-command generation and compatible delivery. The initial sample label is preview-only. Confirm TSPL support/mode separately; the existing receipt emulator does not validate it.
- [ ] Batch 6 — PC QZ Tray integration, explicit connection permission, selected printer, and emulator delivery; handle disconnects, cancellation, and uncertain results without automatic retries. No silent-printing promise without certificate setup.
- [ ] Batch 7 — test prepared strategies on the real printer, record method/settings/output, choose the reliable default and one fallback, then integrate the approved method into POS/Order History. Keep printing separate from checkout and offline order synchronization.
- [ ] Optional later investigation — direct browser USB/Serial/BLE only after confirming browser and device compatibility; not a promised universal Android/iPhone route.
- [ ] User visual approval and deployed `/print-test` smoke test. Physical receipt and label output remain unverified until hardware tests pass.

## Waiting for References

- [ ] Migrate Point of Sale after its approved reference is supplied.
- [ ] Migrate Profile after its approved reference is supplied.
- [x] Migrate Forgot Password from its approved reference.
- [x] Migrate Reset Password as an approved standalone token-reset form.
- [ ] Decide whether Store Settings is a real module or visual placeholder.
- [ ] Implement final shared button variants after approval.
- [ ] Implement additional complex filter variants only after their references and interactions are approved.
- [x] Modal Variant 1, Variant 2, and Variant 3 references are supplied; migration is tracked in Phase 11.

## Toast Feedback Review — POS First

Feedback placement and examples: [Frontend UX Feedback Plan](FRONTEND_UX_FEEDBACK_PLAN.md). Use it to choose inline errors, hints, disabled controls, tooltips, toasts, banners, in-content states, or confirmation modals before each approved batch.

- [ ] POS Add to order prerequisite UX: disable until an available variant is selected and show "Select a size first." near the selector. See the feedback plan; implementation and user verification remain pending.
- [~] Review and approve the shared Base UI toast in POS: accepted add-to-order success, stock rejection warning, duplicate updates, dismissal, mobile placement, and keyboard/accessibility behavior. Use `toast.add`, `toast.update`, and `toast.close` directly; keep styling and default timeout in the shared toast/Toaster. User runs testing and build checks.
- [ ] Review other POS outcomes before adding more toasts: checkout failure, offline order queued, cart removal/clear, and add-on confirmation. Keep important checkout failures visible in the existing banner, avoid duplicate messages, and do not announce routine quantity/filter changes.
- [ ] Review Inventory pages and modals for confirmed save, restock, wastage, correction, archive, restore, category, and export outcomes.
- [ ] Review Menu/Add-ons pages and modals for confirmed save, archive, restore, variant, category, and export outcomes.
- [ ] Review Expense pages and modals for confirmed save, archive, restore, category, and export outcomes.
- [ ] Review Employee Management for confirmed save, activation/deactivation, setup-link, and password-request outcomes.
- [ ] Review Dashboard, Order History, Sales, Inventory Valuation, and Inventory Audit pages for actionable feedback such as export failures. Keep fetch errors with retry in the page content.
- [ ] Review Authentication, Profile, and any Store Settings pages for suitable transient feedback; keep password/setup instructions and field errors visible in their forms.
- [ ] Review every remaining route and archive page for needed feedback, keyboard announcements, responsive placement, duplicate messages, and print exclusion. Add toasts one approved module batch at a time.
- [ ] Use inline messages for field validation; use persistent page/banner feedback for loading failures or critical failures needing recovery. Toasts supplement brief action feedback and must follow a confirmed result. Normal modal cancellation does not need a toast.

## Final Cleanup

- [ ] Remove legacy styles only after confirming they have no references.
- [x] Remove the obsolete `/preview` route, legacy PageHeader CSS, and zero-reference legacy UI primitives after confirming no remaining consumers.
- [ ] Re-check and ask before deleting the current zero-reference candidates: `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`, and unused alternate logo exports.
- [x] Move the reusable PageHeader into `src/components/layout/` and remove its obsolete UI-folder copy after updating consumers.
- [x] Remove `auth.css` after confirming Forgot Password and Reset Password no longer depend on it.
- [ ] Resolve unused imports separately without touching user-owned service behavior.
- [ ] Replace the visual-only Topbar sync placeholder with a real shared connection and pending-offline-order indicator after all page UI work is approved.
- [ ] Standardize folder names containing spaces during a dedicated low-risk cleanup.
- [ ] Verify desktop, tablet, mobile, keyboard, focus, and contrast behavior.
- [ ] Capture and review phone and desktop screenshots for each tablet-approved module, beginning with Login.
- [ ] Verify Login and role-protected routes.
- [ ] Verify exports, print layouts, and QR layouts.
- [ ] Verify POS and offline indicators after their visual migration.
- [ ] Run complete frontend lint.
- [ ] Run complete production build.
- [ ] Compare every completed screen against its approved Figma frame.

## Current Next Task

Review the public Printing Test Lab Batch 1 at `/print-test`; user visual approval and deployment smoke test remain pending. Then proceed to Batch 2: user installs the approved receipt encoder, followed by app-generated text commands and PC emulator testing. Do not enable unfinished transports or claim physical printing success. Resume the Phase 11 modal verification and final cross-module cleanup afterward.
