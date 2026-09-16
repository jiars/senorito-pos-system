# Frontend Figma Migration Task List

Updated: September 14, 2026

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
- [x] Build and approve the tablet layout first, then adapt each module to desktop and mobile before completion.
- [x] Require visual approval before starting the next module.
- [x] Use simple English for all guidance and progress updates.
- [x] Let the user run all dependency installation and package-scaffolding commands.
- [x] Tell the user which shadcn/ui components are needed before every new module and wait for the user to add the approved components.
- [x] Let the user write Laravel backend and frontend service-layer code.
- [x] Let the agent create and refactor frontend layout, JSX, and styling files.
- [x] Keep the current sidebar background color.
- [x] Plan sidebar group labels without changing route paths.
- [-] Final shared button styling — waiting for its dedicated design.
- [-] Final shared filter styling — waiting for its dedicated design.
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
- [ ] Shared filter variants and states
- [ ] Modal designs and interaction states
- [ ] Desktop website references or approved responsive rules
- [ ] Mobile references or approved responsive rules

## Phase 1: UI Foundation

- [x] Run baseline frontend lint — completed with documented pre-existing failures.
- [x] Run baseline frontend production build — passed.
- [ ] Review the six dependency audit findings without applying automatic breaking upgrades.
- [ ] Record a later code-splitting task for the existing large production bundle.
- [x] Review current global styles and custom UI components for migration conflicts.
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
- [ ] Decide the final icon library and avoid mixing icon styles in new components.
- [ ] Update the existing component preview page into a basic UI catalog.
- [ ] Create shared Loading, Error, Empty, and Skeleton states.
- [ ] Review and approve the UI foundation.

## Phase 2: Authentication and Loading

- [x] Confirm shadcn/ui requirements for Login and Loading — no additional downloads are needed.
- [x] Use the installed shadcn/ui `Button` for the Login submit action.
- [x] Create the reusable Auth layout.
- [x] Split the Login screen into clear presentational sections.
- [~] Apply the approved tablet Login design — visual review is in progress.
- [ ] Adapt the approved tablet Login to the desktop website layout.
- [ ] Adapt the approved tablet Login to the mobile layout.
- [x] Implement the three-slide Login carousel with manual controls and an automatic five-second infinite loop.
- [x] Keep the current authentication service and payload unchanged.
- [x] Preserve the existing validation, loading, error, and forgot-password behavior.
- [x] Add the Remember Me checkbox and local UI state.
- [-] Connect Remember Me to token persistence — it requires a service-layer decision by the user.
- [ ] Implement and review the reusable full-screen loading design on its dedicated branch.
- [~] Verify image optimization and fallback behavior — the current repository image is only a temporary placeholder.
- [x] Run focused lint and production build.
- [ ] Visually review and approve Authentication before continuing.

## Phase 3: Shared App Shell and Sidebar

- [ ] Refactor protected routes to use one nested App shell and outlet.
- [ ] Keep Sidebar, Topbar, and routed content as separate responsibilities.
- [ ] Create reusable Breadcrumbs.
- [ ] Create reusable Page layout and Page header.
- [ ] Preserve the current sidebar brown color.
- [ ] Add the `Sales & Reports` group label.
- [ ] Add the `Inventory & Menu` group label.
- [ ] Add the `Administration` group label.
- [ ] Confirm the exact link assigned to every sidebar group.
- [ ] Do not add Store Settings as a working link without an approved route.
- [ ] Preserve role-based visibility.
- [ ] Preserve mobile sidebar open, close, overlay, and keyboard behavior.
- [ ] Preserve topbar sync and account indicators.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve the shared shell before continuing.

## Phase 4: Dashboard

- [ ] Keep the current Dashboard service response unchanged.
- [ ] Create the Dashboard page header and breadcrumbs.
- [ ] Extract summary metric cards.
- [ ] Extract Weekly Performance.
- [ ] Extract Expiry Alerts.
- [ ] Extract Low Stock Items.
- [ ] Extract Top Selling Items.
- [ ] Add loading, error, empty, and populated states.
- [ ] Match the supplied desktop layout.
- [ ] Create tablet and mobile behavior.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Dashboard before continuing.

## Phase 5: Order History

- [ ] Preserve existing order data and details behavior.
- [ ] Separate page header, order-state tabs, toolbar, table, pagination, and details modal.
- [ ] Match the supplied main-page layout.
- [ ] Handle long tables on tablet and mobile.
- [ ] Preserve status, payment, cashier, and order-source labels.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Order History before continuing.

## Phase 6A: Inventory Stock Overview

- [ ] Preserve Inventory query, stock, batch, archive, and modal behavior.
- [ ] Build the Stock Overview tabs and page sections.
- [ ] Extract inventory summary cards.
- [ ] Extract Quick Actions.
- [ ] Restyle the Inventory Items table shell.
- [ ] Preserve expiry and stock-status indicators.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Stock Overview before continuing.

## Phase 6B: Inventory Valuation

- [ ] Preserve valuation formulas, export, and print behavior.
- [ ] Extract the valuation chart and summary.
- [ ] Extract Highest Value.
- [ ] Restyle the valuation table shell.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Inventory Valuation before continuing.

## Phase 6C: Inventory Audit Log

- [ ] Preserve audit query, formatting, export, and print behavior.
- [ ] Separate header, toolbar, table, badges, and pagination.
- [ ] Match the supplied audit-table layout.
- [ ] Preserve action, source, stock-change, batch, reason, reference, and employee fields.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Inventory Audit Log before continuing.

## Phase 7: Sales

- [ ] Preserve report calculations and export behavior.
- [ ] Extract summary metrics.
- [ ] Extract Menu Profitability.
- [ ] Extract hourly sales chart.
- [ ] Extract Top Selling Items.
- [ ] Extract Sales by Order Source.
- [ ] Extract Sales by Menu Category.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Sales before continuing.

## Phase 8: Expense Tracking

- [ ] Preserve expense, category, and inventory-purchase behavior.
- [ ] Extract summary metrics.
- [ ] Extract Quick Actions.
- [ ] Extract Expense Distribution.
- [ ] Restyle the expense table shell.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Expense Tracking before continuing.

## Phase 9: Menu Management

- [ ] Keep the current Menu CBA structure as the functional reference.
- [ ] Restyle the page header and Menu/Add-ons tabs.
- [ ] Create reusable menu product cards.
- [ ] Preserve variants, recipes, prices, add-ons, categories, and archive behavior.
- [ ] Preserve image fallbacks and loading states.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Menu Management before continuing.

## Phase 10: Employee Management

- [ ] Preserve current employee data and role behavior.
- [ ] Restyle the page header and content shell.
- [ ] Create reusable Employee cards.
- [ ] Preserve masked personal information and account-status display.
- [ ] Preserve existing Add and Edit modal behavior.
- [-] Apply final filter/button styling — deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Employee Management before continuing.

## Waiting for References

- [ ] Migrate Point of Sale after its approved reference is supplied.
- [ ] Migrate Profile after its approved reference is supplied.
- [ ] Migrate Forgot Password after its approved reference is supplied.
- [ ] Migrate Reset Password after its approved reference is supplied.
- [ ] Decide whether Store Settings is a real module or visual placeholder.
- [ ] Implement final shared button variants after approval.
- [ ] Implement final shared filter variants after approval.
- [ ] Redesign modals only after their references are supplied.

## Final Cleanup

- [ ] Remove legacy styles only after confirming they have no references.
- [ ] Remove replaced custom components only after all consumers are migrated.
- [ ] Standardize folder names containing spaces during a dedicated low-risk cleanup.
- [ ] Verify desktop, tablet, mobile, keyboard, focus, and contrast behavior.
- [ ] Verify Login and role-protected routes.
- [ ] Verify exports, print layouts, and QR layouts.
- [ ] Verify POS and offline indicators after their visual migration.
- [ ] Run complete frontend lint.
- [ ] Run complete production build.
- [ ] Compare every completed screen against its approved Figma frame.

## Current Next Task

Complete the Login visual review. Then implement and review the Loading screen on `feat/frontend-loading-screen` before starting the shared app shell.
