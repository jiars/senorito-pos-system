# Frontend Figma Migration Implementation Plan

Updated: September 14, 2026

## Goal

Migrate the approved Figma designs into the existing React frontend while keeping the working Laravel and Supabase integrations unchanged.

The migration will be completed one module at a time. Every module must be reviewed visually and functionally before the next module starts.

## Confirmed Frontend Direction

- Continue using React and Vite.
- Add Tailwind CSS and shadcn/ui gradually.
- Follow Component-Based Architecture and Separation of Concerns.
- Preserve the current module hooks, services, routes, API payloads, and backend behavior.
- Keep the current sidebar background color.
- Add sidebar group labels such as `Sales & Reports`, `Inventory & Menu`, and `Administration` without changing route paths.
- Do not redesign detailed filters and action buttons yet. Dedicated Figma references will be provided later.
- Do not perform a big-bang rewrite or move every existing file at once.
- Treat the currently supplied Figma screenshots as tablet references unless the user explicitly labels one as desktop or mobile.
- Implement the approved tablet layout first, then adapt that same module to desktop and mobile before the module is considered complete.
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

Still required before redesigning their main pages:

- Point of Sale
- Profile
- Forgot Password
- Reset Password
- Store Settings, if this will become a real module
- Dedicated filter and button component designs
- Modal designs and interaction states
- Desktop website variants, if available
- Mobile variants, if available

## Migration Safety Rules

1. Frontend visual work stays on `feat/frontend-figma-redesign`.
2. Always explain work using simple English. Short Taglish is allowed when helpful.
3. The user runs all package installation, removal, upgrade, and scaffolding commands in the terminal.
4. The user writes Laravel backend code and frontend service-layer code.
5. The agent creates and refactors frontend layouts, JSX pages, presentational components, and styling.
6. Do not modify Laravel controllers, models, migrations, routes, or database structure for this redesign.
7. Do not rename API fields or change request and response shapes.
8. Do not remove working CSS or legacy UI components until their replacement is tested.
9. Preserve role-based navigation behavior.
10. Preserve loading, error, empty, modal, print, export, offline, archive, and form behavior.
11. Run lint and the production build after every module.
12. Keep each implementation batch small enough to review and reverse safely.
13. Do not add a shadcn/ui component silently. Complete a component-requirement check with the user before every new module.

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
    # Existing API services remain unchanged during visual migration
  utils/
    # Validation, calculations, and formatting
  styles/
    global.css
    theme.css
```

Folder moves are optional during the first pass. A working module should be split in place before any broader cleanup is considered.

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

Used by Dashboard and back-office modules.

```text
AppShell
  Sidebar
  ContentColumn
    Topbar
    MainContent / React Router Outlet
```

`AppShell` should remain stable. The routed page content is the part that changes.

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

Filters and detailed action-button styling remain deferred until their dedicated designs are supplied.

### Specialized Layouts

- `POSLayout` for the high-density checkout workflow.
- `PrintLayout` for receipts, QR sheets, and printable reports.

## Design System Foundation

Convert the supplied palette into semantic theme tokens rather than placing raw hex values throughout JSX.

`src/styles/theme.css` is the shared source of truth for the redesigned modules. It contains global colors, typography decisions, control heights, spacing, radii, shadows, and focus styles. Module CSS should only contain layouts or states unique to that module. Existing legacy variables remain untouched until their pages are migrated.

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

## Per-Module UI Workflow

1. Review the supplied tablet reference and the existing working page.
2. List shared components, module-specific components, and required shadcn/ui components.
3. Ask the user to add any approved missing shadcn/ui components through the terminal.
4. Implement and visually approve the tablet layout.
5. Adapt the approved module to desktop and mobile.
6. Verify behavior, focused lint, and production build before moving to the next module.

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

### Phase 1: UI Foundation

1. Install and configure Tailwind CSS for the existing Vite application.
2. Configure shadcn/ui under `src/components/ui` and replace legacy controls gradually.
3. Create semantic theme tokens for color, typography, spacing, radius, border, shadow, and focus states.
4. Use the existing component preview route as the initial UI catalog.
5. Create shared loading, error, empty, and skeleton patterns.

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
3. Add the approved sidebar group labels while keeping its color and route behavior.
4. Preserve role filtering and responsive sidebar behavior.
5. Pause for approval.

### Phase 4: Dashboard

1. Preserve the current Dashboard API response and data loading behavior.
2. Split the page into summary, weekly performance, expiry, low-stock, and top-selling sections.
3. Match the supplied layout using real data and shared feedback states.
4. Leave shared filter and button redesign work deferred.
5. Pause for approval.

### Phase 5: Order History

1. Preserve order queries, receipt details, payment labels, and status rules.
2. Separate page header, status tabs, search/filter area, table, pagination, and details modal.
3. Match the supplied layout while deferring final filter/button styling.
4. Pause for approval.

### Phase 6: Inventory Modules

Migrate and approve these separately:

1. Stock Overview
2. Inventory Valuation
3. Inventory Audit Log

Preserve stock, batch, expiry, valuation, audit, export, print, archive, and modal behavior.

### Phase 7: Sales

1. Preserve report calculations and export behavior.
2. Split summary metrics, profitability matrix, top-selling charts, order-source chart, and category chart.
3. Match the supplied main-page layout.
4. Pause for approval.

### Phase 8: Expense Tracking

1. Preserve expense, category, inventory-purchase, and reporting behavior.
2. Split summary cards, quick actions, distribution report, filters, and expense table.
3. Match the supplied main-page layout while deferring final filter/button styling.
4. Pause for approval.

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

### Phase 11: Remaining Screens

Wait for approved Figma references before migrating:

- POS
- Profile
- Forgot Password
- Reset Password
- Store Settings
- Shared buttons and filters
- Module modals

### Phase 12: Cleanup and Verification

1. Remove unused legacy CSS and components only after confirming zero references.
2. Standardize folder and file naming gradually.
3. Verify role routes, responsive layouts, offline indicators, print views, exports, and modals.
4. Run lint and production build.
5. Perform final visual comparison against approved Figma frames.

## Definition of Done Per Module

A module is complete only when:

- Its approved Figma structure is implemented.
- Its tablet reference is approved first, followed by its desktop and mobile responsive adaptations.
- Existing data and actions still work.
- No backend or API contract was changed.
- Loading, error, empty, and populated states are handled.
- Keyboard focus and text contrast are acceptable.
- Desktop, tablet, and mobile layouts are checked.
- Lint and production build pass.
- The owner approves the visual result before work moves to the next module.

## Recommended Starting Point

Start with Phase 1, the UI foundation. After that, implement Login and the loading screen as the first visual pilot. Do not start the Dashboard or other modules until the shared foundation is approved.
