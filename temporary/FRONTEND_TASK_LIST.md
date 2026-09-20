# Frontend Figma Migration Task List

Updated: September 18, 2026

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
- [ ] Forgot Password
- [ ] Reset Password
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
- [ ] Record a later code-splitting task for the existing large production bundle.
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
- [~] Reconnect Receive Stock, Log Wastage, and Correction to the existing Stock Log flow after the modal phase adds the required item-selection step.
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

- [ ] Keep the current Menu CBA structure as the functional reference.
- [ ] Restyle the page header and Menu/Add-ons tabs.
- [ ] Create reusable menu product cards.
- [ ] Preserve variants, recipes, prices, add-ons, categories, and archive behavior.
- [ ] Preserve image fallbacks and loading states.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Menu Management before continuing.

## Phase 10: Employee Management

- [ ] Preserve current employee data and role behavior.
- [ ] Restyle the page header and content shell.
- [ ] Create reusable Employee cards.
- [ ] Preserve masked personal information and account-status display.
- [ ] Preserve existing Add and Edit modal behavior.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Employee Management before continuing.

## Waiting for References

- [ ] Migrate Point of Sale after its approved reference is supplied.
- [ ] Migrate Profile after its approved reference is supplied.
- [ ] Migrate Forgot Password after its approved reference is supplied.
- [ ] Migrate Reset Password after its approved reference is supplied.
- [ ] Decide whether Store Settings is a real module or visual placeholder.
- [ ] Implement final shared button variants after approval.
- [ ] Implement additional complex filter variants only after their references and interactions are approved.
- [ ] Redesign modals only after their references are supplied.

## Final Cleanup

- [ ] Remove legacy styles only after confirming they have no references.
- [x] Remove the obsolete `/preview` route, legacy PageHeader CSS, and zero-reference legacy UI primitives after confirming no remaining consumers.
- [ ] Re-check and ask before deleting the current zero-reference candidates: `src/App.css`, `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`, and unused alternate logo exports.
- [x] Move the reusable PageHeader into `src/components/layout/` and remove its obsolete UI-folder copy after updating consumers.
- [ ] Keep `auth.css` until Forgot Password and Reset Password no longer depend on it.
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

Start the Menu Management layout audit using the approved module-first layout workflow.
