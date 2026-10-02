# Frontend Figma Migration Implementation Plan

Updated: September 18, 2026

## Goal

Migrate the approved Figma designs into the existing React frontend while keeping the working Laravel and Supabase integrations unchanged.

The migration will be completed one module at a time. Every module must be reviewed visually and functionally before the next module starts.

## Confirmed Frontend Direction

- Continue using React and Vite.
- Add Tailwind CSS and shadcn/ui gradually.
- Follow Component-Based Architecture and Separation of Concerns.
- Preserve the current module hooks, services, routes, API payloads, and backend behavior.
- Default collaboration mode is guidance-only to reduce token usage: provide no more than three tasks at a time with exact locations, focused snippets or diffs, purpose, and verification commands.
- Guidance must remain complete and production-quality. Do not skip architecture, separation of concerns, reusable design, validation, accessibility, responsive behavior, loading/error/empty/disabled states, or verification because the user is applying the code.
- The user applies frontend code changes by default. The agent edits files only when the user explicitly asks it to edit, apply, or implement the named task.
- The agent may edit frontend service files only when the user gives explicit permission for that specific task. Without that permission, service files remain user-owned.
- Every fetched module must preserve distinct loading, error, empty, and populated outcomes. A failed request must reject or throw a meaningful error instead of being converted into an empty success value such as `[]` or `{}`; only an explicitly authorized service task may change this behavior.
- For every fetched module, verify loading uses a structured shadcn Skeleton that matches the final layout and reserves its space (for example: card, avatar, text, form, list, or table). Keep this skeleton inside the focused visual component; the page or hook only coordinates `isLoading`.
- The current shared `EmptyState` is a functional placeholder. Replace its visual design centrally after the approved empty-state reference is ready, then recheck every module that consumes it.
- Keep the current sidebar background color.
- Add sidebar group labels such as `Sales & Reports`, `Inventory & Menu`, and `Administration` without changing route paths.
- Use the supplied shared filter reference as the visual direction for simple category, status, and sort controls. Final button variants and modal designs still require their own references.
- Do not perform a big-bang rewrite or move every existing file at once.
- Treat the currently supplied Figma screenshots as tablet references unless the user explicitly labels one as desktop or mobile.
- All supplied tablet frames use a fixed `1194px` width. Their heights may vary because long pages are vertically scrollable; do not force every page to an `834px` document height.
- Treat Figma as the approved visual hierarchy and direction, not as a literal component implementation. Improve details with reusable shadcn/Base UI primitives, accessibility, and responsive behavior.
- Implement the approved tablet layout first, then adapt that same module to desktop and mobile before the module is considered complete.
- Apply the Dashboard responsive strategy to every module using `src/styles/responsive.css` as the canonical reference: begin from the `1194px` tablet layout, then adapt to desktop (`1440px+`), tablet landscape (`1024px–1439px`), tablet portrait (`640px–1023px`), and phone (below `640px`). Module CSS owns complex grid, height/clamp, scrolling, and breakpoint relationships; focused components own element-specific Tailwind changes. Preserve readable text, use scoped overrides instead of global typography changes, use `svh` clamps for short viewports, and test `1194x834`, `1440x900`, `390x844`, and `390x600`.
- Before styling or extracting individual module components, establish and approve the module's complete page-level layout. Follow the Dashboard/Order History pattern: named regions for header/toolbar/content columns/full-width sections, then define column sizing, gaps, scroll containment, and responsive stacking. This gives every module a stable visual overview before component-level work begins.
- Keep each module CSS file layout-only: complex grids, section relationships, height/clamp constraints, scrolling, print selectors, and breakpoint rules. Use Tailwind in the focused JSX component for normal presentation, typography, tokens, local spacing, colors, and local responsive density.
- Before starting each module, list the exact shadcn/ui components needed. The user decides whether to use them and runs every add/install command.
- Pause for visual approval after each module.

## Supplied Figma References

References received for:

- Login
- Loading screen
- Sidebar
- Dashboard
- Order History
- Inventory Stock Overview
- Inventory Valuation
- Inventory Audit Log
- Sales
- Expense Tracking
- Menu Management
- Employee Management
- Shared filter patterns for category, status, and sorting controls

Still required before redesigning their main pages:

- Point of Sale
- Profile
- Forgot Password
- Reset Password
- Store Settings, if this will become a real module
- Dedicated button component designs
- Additional filter variants or complex filter interactions not covered by the supplied reference
- Modal designs and interaction states
- Desktop website variants, if available
- Mobile variants, if available

## Migration Safety Rules

1. Frontend visual work stays on `feat/frontend-figma-redesign`.
2. Always explain work using simple English. Short Taglish is allowed when helpful.
3. The user runs all package installation, removal, upgrade, and scaffolding commands in the terminal.
4. The user writes Laravel backend code. Frontend service-layer code remains user-owned unless the user explicitly authorizes the agent to edit it for a named task.
5. The user normally applies frontend JSX, layout, component, Tailwind, and styling changes from focused guidance. The agent may edit those files, or specifically approved frontend service files, only after an explicit request to edit or implement the named task.
6. Do not modify Laravel controllers, models, migrations, routes, or database structure for this redesign.
7. Do not rename API fields or change request and response shapes.
8. Do not remove working CSS or legacy UI components until their replacement is tested.
9. Preserve role-based navigation behavior.
10. Preserve loading, error, empty, modal, print, export, offline, archive, and form behavior.
11. Treat a successful zero-record response as an empty state and a failed request as an error state with retry. Never mask an API, authentication, permission, offline, or server failure as empty data.
12. Run lint and the production build after every module.
13. Keep each implementation batch to no more than three tasks and make it small enough to review and reverse safely.
14. Do not add a shadcn/ui component silently. Complete a component-requirement check with the user before every new module.
15. Existing uncommitted work belongs to the user. Re-read every target file before editing and do not overwrite unrelated backend, service, or module changes.
16. Screenshot files should live outside the production bundle under `temporary/figma-references/` with an index that records screen name, frame width, exported height, device type, approval status, and intentional deviations.

## Architecture Decision

Use a hybrid feature-based, component-driven structure that fits the current repository instead of reorganizing the entire application immediately.

```text
src/
  components/
    layout/
      AppShell.jsx
      Sidebar.jsx
      Topbar.jsx
      Breadcrumbs.jsx
      PageLayout.jsx
      PageHeader.jsx
    ui/
      # New shadcn files gradually replace the legacy custom controls
    feedback/
      LoadingState.jsx
      ErrorState.jsx
      EmptyState.jsx
  pages/
    auth/
    dashboard/
      components/
        DashboardSummary.jsx
        WeeklyPerformance.jsx
        ExpiryAlerts.jsx
        LowStockItems.jsx
        TopSellingItems.jsx
    orders/
      components/
    inventory/
      components/
      audit/
      valuation/
    reports/
      sales/
    expenses/
      components/
    menu/
      components/
      addons/
    employees/
      components/
    pos/
      components/
    profile/
      components/
  hooks/
    # Existing server-state and module hooks remain here for now
  services/
    # Existing API services remain unchanged unless the user explicitly authorizes a named service edit
  utils/
    # Validation, calculations, and formatting
  styles/
    global.css
    theme.css
```

Folder moves are optional during the first pass. A working module should be split in place before any broader cleanup is considered.

Use a small shared route metadata configuration for frontend presentation details such as route label, breadcrumb label, sidebar group, and icon. Keep the existing `ROLE_ROUTES` behavior as the permission source during the shell refactor so route access does not change accidentally.

## Component Separation Rules

Create a separate component when it has at least one of these qualities:

- It is reused in more than one place.
- It has its own state, event handling, or display logic.
- It represents a clear page section from the Figma design.
- It is large enough that extracting it makes the parent page easier to understand.

Do not create a React component for every `div`. Use semantic HTML where appropriate:

- `aside` and `nav` for the sidebar
- `header` for topbars and page headings
- `main` for routed page content
- `section` for dashboard panels and module sections
- `article` only for independently meaningful content

## Shared Layout Standard

### Auth Layout

Used by Login, Forgot Password, and Reset Password.

```text
AuthLayout
  AuthPanel
  BrandHeader
  AuthContent
  PromotionalImagePanel
  CarouselIndicators
```

The image panel may be hidden or moved below the form on smaller screens.

### Application Shell

Used by all current protected routes. A page such as POS may use a specialized inner layout inside the shared routed content when its high-density design requires it.

```text
AppShell
  Sidebar
  ContentColumn
    Topbar
    MainContent / React Router Outlet
```

`AppShell` should remain stable. The routed page content is the part that changes.

Protected routes should be nested so `ProtectedRoute` performs the existing authentication and role checks, `AppShell` renders the shared chrome once, and child routes render through React Router `<Outlet />`.

### Page Layout

Used inside each back-office page.

```text
PageLayout
  Breadcrumbs
  PageHeader
    Title
    Description
    PageActions
  PageToolbar
  PageContent
```

Simple category, status, and sorting filters should follow the supplied filter reference. Use reusable filter popovers instead of page-specific copies. Complex filters may use a Sheet after its requirements are known. Final shared action-button styling remains deferred until its dedicated design is supplied.

### Specialized Layouts

- `POSLayout` for the high-density checkout workflow.
- `PrintLayout` for receipts, QR sheets, and printable reports.

## Design System Foundation

Convert the supplied palette into semantic theme tokens rather than placing raw hex values throughout JSX.

`src/styles/theme.css` is the shared source of truth for the redesigned modules. It contains global colors, typography decisions, control heights, spacing, radii, shadows, and focus styles. Module CSS should only contain layouts or states unique to that module. Existing legacy variables remain untouched until their pages are migrated.

The current audit found competing values in `theme.css`, `variables.css`, `index.css`, and `layout.css`. Migrate redesigned screens toward `theme.css` gradually and do not remove legacy values until every consumer has moved and passed testing.

Use Inter as the final application font and bundle it locally so the PWA does not depend on Google Fonts while offline. The user will run the approved package command when this task starts. Remove the Google Fonts import and the temporary Geist usage only after the local Inter source is installed and verified.

Bootstrap Icons remain the approved application icon library. shadcn/Base UI may provide accessible behavior, but generated Lucide icons should be replaced with the approved Bootstrap icon style on redesigned screens. Do not remove the Lucide dependency until a final zero-reference check is completed and the user approves removal.

Initial mapping:

- Primary brand and CTA: `#7B4030`
- Destructive/error: `#9A3F3F`
- Accent: `#D37A63`
- Secondary muted accent: `#C4A799`
- Success: `#46B549`
- Information/selected state: `#0D6EFD`
- Soft highlights: `#CCD67F` and `#E4D6A9`
- Application background: `#F4F4F4`
- Muted text candidate: `#898282`

Before implementation, define accessible foreground colors for every background. `#898282` should not be used as normal-size text on white or `#F4F4F4` without adjustment because its contrast is too low.

### Shared Table and Filter Standard

Figma tables are layout references only. Build a customized Senorito table system from shadcn Table primitives and shared theme tokens rather than copying the screenshot table markup or keeping page-specific table clones.

Do not copy a complete shadcn dashboard-block data table into the application. Those examples can include block-specific drag-and-drop, pagination, and sample-data behavior. Instead, create one small reusable `DataTable` foundation on top of the installed shadcn Table primitives. Each module owns its data, column definitions, cell renderers, and actions; the shared table owns only the semantic wrapper, optional selection checkbox column, loading/error/empty states, controlled horizontal scrolling, and consistent tablet styling. Selection and row actions must be opt-in so read-only tables do not render unused controls.

The shared table foundation should support:

- semantic table markup and accessible labels
- controlled horizontal scrolling with important columns kept visible
- reusable loading, skeleton, empty, error, and populated states
- optional row selection checkboxes
- shared status badges
- row actions inside an overflow menu
- responsive column priorities without changing existing data behavior
- page-owned column definitions so the base component does not become one oversized universal table

Keep existing sorting, filtering, pagination, export, print, and API logic. Do not add TanStack Table unless a later module proves it is necessary and the user approves the dependency.

Create shared simple-filter patterns from the supplied reference using shadcn/Base UI behavior primitives such as Popover, Checkbox, Button, and Separator. Use one shared filter popover and sort menu with variants instead of duplicating them per page.

### Figma Reference Storage

Store original reference exports under `temporary/figma-references/` so they are not bundled with the production application.

```text
temporary/figma-references/
  REFERENCE_INDEX.md
  auth/
  shared/
  dashboard/
  orders/
  inventory/
  sales/
  expenses/
  menu/
  employees/
```

Use descriptive filenames such as `inventory/stock-overview-tablet-1194x-scroll.png`. The index should record the original export dimensions and note that all current tablet references use a fixed `1194px` width with variable scroll height.

## Per-Module UI Workflow

1. Review the supplied tablet reference and the existing working page.
2. List shared components, module-specific components, and required shadcn/ui components.
3. Ask the user to add any approved missing shadcn/ui components through the terminal.
4. Implement and visually approve the tablet layout.
5. Adapt the approved module to desktop and mobile.
6. Verify behavior, focused lint, and production build before moving to the next module.
7. Record intentional differences from Figma, such as customized tables or improved accessible controls, in the reference index or task notes.

Login and Loading currently require no additional shadcn/ui downloads. Login uses a custom floating input because its Google-style label behavior is design-specific.

## Sidebar Scope

Keep:

- Existing brown background color
- Existing role-based visibility
- Existing routes and navigation behavior
- Mobile open/close behavior

Change only during the shared-layout phase:

- Match the spacing and hierarchy of the Figma reference.
- Add visible group labels.
- Organize existing links under the approved groups.
- Keep the current route paths even if a visible label changes.

Do not add a clickable `Store Settings` item until its route and requirements exist.

## Module Migration Phases

### Phase 0: Documentation and Protection

1. Create the dedicated frontend branch.
2. Record supplied references and deferred designs.
3. Create the frontend implementation plan and task list.
4. Verify the working frontend before installing or changing UI tooling.
5. Create the non-production Figma reference folder and reference index.
6. Record the fixed `1194px` tablet width and each image's variable exported height.

### Phase 1: UI Foundation

1. Install and configure Tailwind CSS for the existing Vite application.
2. Configure shadcn/ui under `src/components/ui` and replace legacy controls gradually.
3. Create semantic theme tokens for color, typography, spacing, radius, border, shadow, and focus states.
4. Use the existing component preview route as the initial UI catalog.
5. Create shared loading, error, empty, and skeleton patterns.
6. Standardize on locally bundled Inter and remove network-only font loading after verification.
7. Keep Bootstrap Icons as the approved icon style and resolve the current Lucide configuration mismatch without breaking generated components.
8. Remove Vite starter/demo global styles only after confirming they are not required.
9. Build shared customized table and simple-filter foundations as their first consuming modules are migrated.

Dashboard Recent Orders is the first consumer of the reusable table foundation. Keep it limited to the latest six orders and migrate only its table presentation during the Dashboard visual pass. Its search, filters, sorting controls, pagination, and header toolbar remain deferred because a six-row dashboard preview does not need them; those controls will be completed during Dashboard final checks or when a full table module requires them.

### Phase 2: Authentication and Loading

1. Create `AuthLayout` from the approved tablet Login reference.
2. Restyle the tablet Login without changing its authentication service.
3. Implement the loading screen reference as a reusable full-screen state.
4. After tablet approval, adapt and verify desktop and mobile layouts.
5. Verify keyboard, validation, loading, and login-error states.
6. Pause for approval.

### Phase 3: Shared Application Shell

1. Refactor the repeated route wrappers into a reusable nested `AppShell` using an outlet.
2. Separate Sidebar, Topbar, Breadcrumbs, PageHeader, and routed content responsibilities.
3. Add shared frontend route metadata for labels, breadcrumbs, sidebar groups, and icons while keeping `ROLE_ROUTES` as the permission source.
4. Add the approved sidebar group labels while keeping its color and route behavior.
5. Preserve role filtering and responsive sidebar behavior.
6. Use a visual-only Topbar `Synced` placeholder during the UI migration. Do not connect it to browser connectivity, offline orders, or automatic synchronization until Final Verification. October 2: shared sync state, status popover, and shadcn-compatible toast feedback are approved for later work; follow `BACKEND_IMPLEMENTATION_PLAN.md` under `Deferred: Shared Sync Indicator and Toast Feedback`. Receipt-printing investigation takes priority; no sync UI implementation is authorized by this planning update.
7. Keep POS inside the shared shell initially and allow only a specialized inner POS layout when its approved design requires it.
8. Defer the Tailwind-first shared App Shell migration until after page UI work. Keep the approved plain-CSS App Shell intact for now; future migration must preserve legacy `.layout-page-heading` and print selectors.
9. Pause for approval.

### Phase 4: Dashboard

1. Preserve the current Dashboard API response and data loading behavior.
2. Split the page into summary, weekly performance, expiry, low-stock, and top-selling sections.
3. Match the supplied layout using real data, reusable skeleton loading states, and successful-response empty states. Defer the Dashboard API-error fallback and retry behavior to final Dashboard checks because it requires an explicitly authorized service-contract decision.
4. Use the shared tablet typography, 8pt spacing, radius, touch-target, and canvas tokens. Apply them progressively in this order: Expiry Alerts, Low Stock Items, Summary Cards, Weekly Performance, then the Dashboard overview layout.
5. Keep dashboard component styling Tailwind-first. Retain `dashboard.css` only for complex layout relationships, scrolling, or chart internals after the component migration is complete.
6. Apply the approved shared filter direction where needed; leave final shared button styling deferred.
7. Pause for approval.

### Phase 5: Order History

1. Preserve order queries, receipt details, payment labels, and status rules.
2. Separate page header, status tabs, shared search/filter area, customized table, pagination, and details modal.
3. Match the supplied layout and shared filter direction while deferring final button styling.
4. Pause for approval.

Completed implementation:

- Use the shared `PageLayout` and a Dashboard-style `orders-page-layout` with explicit toolbar, table, and pagination children.
- Keep `ordersPage.css` limited to responsive table scroll containment: portrait, phone, and short-height `svh` caps. Local controls and pagination use component Tailwind classes.
- Use the shared `FilterPopover`, `FilterOptionGroup`, and `FilterDatePicker`; Order History owns only values, options, preset logic, Apply, and Clear callbacks.
- Use the shared `DataTable` for the Order History table. The page owns its columns and preserves the existing order-details action through a final Bootstrap eye column.
- Use shared `DataTablePagination` for client-side table pagination. It is derived only from the shadcn block's Rows per page, page summary, and first/previous/next/last controls; exclude row selection, drag/drop, Tabs, and block-only dependencies. Its loading state is one compact long skeleton.
- Use the bounded toolbar search at tablet/desktop and full width below the `sm` breakpoint, following the supplied toolbar reference.
- Shared table scrolling supports horizontal-only by default and both directions when a dense module explicitly needs contained vertical scrolling.
- Order History tablet, desktop, portrait, phone, short-height, skeleton, empty, filter, pagination, and populated-table behavior are approved. Focused lint and production build pass.

### Phase 6: Inventory Modules

Migrate and approve these separately:

1. Stock Overview
2. Inventory Valuation
3. Inventory Audit Log

Preserve stock, batch, expiry, valuation, audit, export, print, archive, and modal behavior. Use the shared customized table and filter foundations rather than copying the Figma table implementation.

For each inventory module, first build and approve its named page-level layout and its module layout CSS before styling section components. Inventory Audit Log and Inventory Valuation are complete. The next active module is Stock Overview.

### Phase 6A: Inventory Stock Overview

1. Preserve the existing `/inventory` route, init query, stock calculations, archive, QR, stock-log, history, add/edit, category, and modal behavior.
2. Build responsive page-level layout first: `PageLayout`, header actions, a line-variant four-tab workspace, tab caption, named regions, tablet-first columns, controlled table containment, then desktop/portrait/phone/short-height adjustments using `responsive.css`.
3. Use one `InventoryWorkspace` with focused tab content components: Stock Overview, Batches, Wastage, and Purchase History. Do not nest complete page layouts inside every tab.
4. Stock Overview contains interactive summary cards and Quick Actions above its shared toolbar/table. A clicked metric applies the matching existing stock filter and sort state.
5. Stock Overview, Batches, and Wastage use search, sidebar-section filters, `0 - Z` / `Z - 0` sorting, Print QR, and the shared DataTable. Purchase History remains table-only with its approved collapsible filters.
6. Defer modal redesigns until the page/tab layout receives visual approval; current functional modals remain connected and unchanged.

### Phase 6B: Inventory Valuation

Completed September 19, 2026:

1. Preserved the valuation calculation, export, print, search, category filter, pagination, and data contracts.
2. Replaced the legacy summary/chart views with one Tailwind-first `Value per Inventory` panel: accessible donut chart, responsive category legend, metric placeholders, Highest Value summary, and a reusable metric-value display.
3. Reused shared DataTable, toolbar search, FilterPopover, FilterOptionGroup, and pagination; numeric-aware `0 - Z` and `Z - 0` sorting now includes item names beginning with numbers.
4. Added a complete panel skeleton and responsive behavior for desktop, tablet, phone, and short-height table regions.
5. Removed zero-reference legacy valuation components and presentation CSS. Print-only styles are colocated beside `InventoryValuationPrintLayout` and hide only print-irrelevant shell content.
6. Production build and visual QA passed.

### Phase 6C: Inventory Audit Log

Completed September 18, 2026:

1. Preserved the existing audit query, client-side filtering, formatting, and export behavior. The page has Export only; Print was not added because no working Print contract exists.
2. Approved the `PageLayout` with explicit toolbar/table/pagination regions, full-width table containment, and responsive `svh` rules in `inventoryAuditLog.css`.
3. Reused the approved shared search, filter popover, DataTable, pagination, skeleton, empty-state, and responsive patterns. Audit-specific columns and badges remain local to the module.
4. Added the opt-in sidebar filter-popover mode for complex filter categories. Audit Log uses Date & Staff, Reason, and Sources sections; existing simple filter popovers remain unchanged.
5. Focused lint and production build pass. Desktop, tablet, phone, short-height behavior, loading, error, empty, and populated states are approved.

### Phase 7: Sales

Completed September 19, 2026:

1. Preserved report calculations and filters while adding the approved XLSX export and corrected print layout.
2. Built reusable summary metrics, profitability, hourly-sales, top-selling, order-source, and category regions using the established page-layout pattern.
3. Menu Profitability uses a responsive 60vw detail Sheet, shared DataTable, and local four-option sorting popover; the Sheet overlays app chrome.
4. Applied desktop, tablet, phone, short-height, loading, and empty-state behavior, then passed focused lint and production build.
5. Sales is visually approved.

### Phase 8: Expense Tracking

Planned September 20, 2026:

1. Preserve the `/expenses` route, Expense and Sales hooks, unified Expense init payload, category and inventory-purchase behavior, date filtering, Excel export, add/edit/archive restrictions, modal flows, permissions, and offline behavior. Do not edit Expense services or Laravel during this visual migration.
2. Establish and approve the responsive page-level layout before styling individual sections:

   ```text
   PageLayout
     PageHeader
       Expense Tracking title and subtitle
       overflow three-dot action menu: Export, View Archive, Manage Categories
       Add Expense primary action
     expense-page-layout
       expense-page-summary
         four non-interactive summary cards
       expense-page-overview (`ExpenseOverview`)
         Expense Distribution child panel (55%)
         Quick Actions child panel (45%)
       expense-page-records
         toolbar: search + simple filter popover
         shared DataTable
         shared pagination
   ```

3. Build responsiveness with the layout: tablet-first at `1194x834`; four horizontal summary cards and a 55/45 overview row on tablet landscape/desktop; 2x2 summary cards and stacked overview panels on tablet portrait; single-column readable cards/panels on phone; `svh` containment for the chart, quick actions, and table on short screens. Keep typography changes module-scoped and above the approved readable minimums.
4. Reuse shared `SummaryCards` for Total Expenses, Salary, Inventory Purchases, and Top Operating Expense. Cards are display-only and must preserve the existing expense calculations; add only derived presentation calculations backed by the current records.
5. Create one focused `ExpenseOverview` component that owns the 55/45 Expense Distribution and Quick Actions child panels, matching the successful Inventory Insights composition while keeping both responsibilities readable inside the component.
6. Replace the legacy donut/category-breakdown layout inside `ExpenseOverview` with an Expense Distribution child panel containing a standard header, caption, tooltip, and bar chart. Use the existing chart foundation/theme tokens and provide a structured panel skeleton.
7. Add the Quick Actions child panel inside `ExpenseOverview` using the approved Inventory Quick Actions card layout with four rows: Pay Employee, Purchase Inventory, Manage Expense Categories, and View Archive. Reuse proven existing modal/actions only. Manage Categories and View Archive are connected; Pay Employee and Purchase Inventory stay disabled until their modal workflows are approved.
8. Build the records toolbar with shared `ToolbarSearchInput` and a simple `FilterPopover` without sidebar sections. Its content contains Expense Period (`All Time`, `This Day`, `This Week`, `This Month`), shared From/To date-range picker, and a collapsible multi-select Category group. Preserve the existing date-filter meaning and reset pagination on applied changes.
9. Migrate Expense Records to the shared `DataTable` and `DataTablePagination`; keep date, category, description, vendor/supplier, amount, recorded-by, edit, and archive behavior. Put row actions in the approved overflow menu and retain the Inventory Purchase edit/archive restrictions.
10. Keep `expenseTracking.css` layout-only: named regions, four-card grid, `ExpenseOverview` 55/45 child columns, height clamps, scroll containment, responsive stacking, and print selectors if required. Use Tailwind and semantic tokens for component presentation.
11. Preserve distinct loading, error, empty, populated, and disabled states. Verify `1194x834`, `1440x900`, `390x844`, and `390x600`, then run focused lint and the production/PWA build before visual approval and cleanup.

Completed September 20, 2026:

12. Added the responsive `/expenses/archive` page with parent breadcrumbs, Back to Expense Tracking action, category search/filtering, shared DataTable/pagination, category badges, and restore behavior backed by the Expense init payload.
13. Completed the Expense zero-reference audit, removed obsolete React imports, replaced modal reset effects with mount-scoped modal content, kept services unchanged, and passed focused frontend lint plus the production/PWA build.
14. Completed the post-cleanup Expense modal smoke checks and restored the shared Base UI ScrollArea to its pre-Content-wrapper structure after the added wrapper regressed percentage-width Recharts rendering.
15. Aligned Expense Distribution with Dashboard Weekly Sales by using a fixed current Sunday-to-Saturday range and retaining zero-value days in the chart.

### Phase 9: Menu Management

1. Keep the current componentized Menu structure as the functional reference.
2. Restyle the page header, tabs, product grid/cards, menu imagery, and feedback states.
3. Preserve item, variant, recipe, add-on, archive, and category behavior.
4. Pause for approval.

### Phase 10: Employee Management

1. Preserve existing employee and role behavior while backend auth decisions remain paused.
2. Split search/filter controls, employee grid, employee card, and modals clearly.
3. Match the supplied card-based layout.
4. Pause for approval.

Completed September 25, 2026:

5. Migrated Employee Management to the shared `PageLayout` with `EmployeeDirectory`, `EmployeeToolbar`, and reusable `EmployeeCard` boundaries while preserving the existing employee service and Add/Edit modal flows.
6. Added shared search plus multi-select Role/Status filters, structured card skeletons, the reusable placeholder empty state, shadcn role/status badges, masked personal details, and an accessible compact edit control.
7. Kept `employeeManagement.css` layout-only and implemented the approved three/two/one-column responsive grid with module-scoped phone and short-height density adjustments.
8. Completed the Employee zero-reference cleanup, removed the obsolete card stylesheet, passed focused Employee lint and the production/PWA build, and received visual approval.

### Phase 11: Remaining Screens

Wait for approved Figma references before migrating:

- POS
- Profile
- Forgot Password
- Reset Password
- Store Settings
- Shared button variants and any filter variants not covered by the supplied reference
- Module modals

### Phase 12: Cleanup and Verification

1. Remove unused legacy CSS and components only after confirming zero references.
2. Standardize folder and file naming gradually.
3. Replace the visual-only Topbar sync placeholder with a real indicator for browser connectivity and pending offline orders. Verify role routes, responsive layouts, offline indicators, print views, exports, and modals.
4. Run lint and production build.
5. Perform final visual comparison against approved Figma frames.

Current zero-reference cleanup candidates include `src/App.css`, the Vite starter assets (`src/assets/hero.png`, `react.svg`, and `vite.svg`), and the unused alternate logo exports. These are candidates only: run a fresh reference check and ask the user before deletion. The legacy Button and PageHeader systems must remain until the preview and all consumers are migrated. `auth.css` must remain while Forgot Password and Reset Password still use it.

## Definition of Done Per Module

A module is complete only when:

- Its approved Figma structure is implemented.
- Its tablet reference is approved first, followed by its desktop and mobile responsive adaptations.
- Existing data and actions still work.
- No backend or API contract was changed.
- Loading, error, empty, and populated states are handled; loading uses a structured skeleton matching the final card, avatar, text, form, list, or table layout.
- Keyboard focus and text contrast are acceptable.
- Desktop, tablet, and mobile layouts are checked.
- Lint and production build pass.
- The owner approves the visual result before work moves to the next module.

## Recommended Starting Point

Start with Phase 1, the UI foundation. After that, implement Login and the loading screen as the first visual pilot. Do not start the Dashboard or other modules until the shared foundation is approved.
