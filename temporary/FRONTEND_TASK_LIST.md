# Frontend Figma Migration Task List

Updated: September 16, 2026

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
- [x] Require visual approval before starting the next module.
- [x] Use simple English for all guidance and progress updates.
- [x] Default to guidance-only work with a maximum of three tasks per batch to reduce token usage.
- [x] Require complete production-quality guidance without omitting architecture, reuse, accessibility, responsive behavior, UI states, or testing when the user writes the code.
- [x] Let the user apply frontend code by default; the agent edits only when explicitly asked to edit, apply, or implement a named task.
- [x] Let the user run all dependency installation and package-scaffolding commands.
- [x] Tell the user which shadcn/ui components are needed before every new module and wait for the user to add the approved components.
- [x] Let the user write Laravel backend code.
- [x] Keep frontend service-layer files user-owned unless the user explicitly authorizes the agent to edit named service files for a specific task.
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
- [ ] Build the shared customized table foundation from shadcn Table primitives when the first table module begins.
- [ ] Keep column definitions inside their modules so the shared table does not become an oversized universal component.
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

- [ ] Keep the current Dashboard service response unchanged.
- [~] Migrate Dashboard sections component-by-component with Tailwind-first JSX styling. Do not adjust legacy `dashboard.css` values while a section still uses its selectors.
- [ ] Keep reusable colors, gradients, number colors, and shadows in `src/styles/theme.css`; keep only genuinely complex Dashboard behavior (for example, chart internals or custom scrolling) in local CSS if still needed after migration.
- [x] Establish shared tablet typography, 8pt spacing, radius, and touch-target tokens; apply and verify the standard in Expiry Alerts.
- [x] Apply the approved Expiry Alerts typography and spacing pattern to Low Stock Items.
- [x] Apply the same shared typography system to Summary Cards.
- [x] Apply the same shared typography system to Weekly Performance.
- [x] Apply the shared spacing system to the Dashboard overview layout, including full-width Top Selling and Recent Orders rows.
- [~] Restyle Top Selling Items as a horizontal five-item menu-card list using the existing Dashboard data and image fallback.
- [ ] Create the Dashboard page header and breadcrumbs.
- [ ] Extract summary metric cards.
- [ ] Extract Weekly Performance.
- [ ] Extract Expiry Alerts.
- [ ] Extract Low Stock Items.
- [ ] Extract Top Selling Items.
- [ ] Add loading, error, empty, and populated states.
- [ ] Match the supplied desktop layout.
- [ ] Create tablet and mobile behavior.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Dashboard before continuing.
- [ ] Final Dashboard cleanup: after visual approval and build verification, run a zero-reference check, remove obsolete `dashboard.css` selectors, and keep or remove the remaining file only according to the verified complex-style needs.

## Phase 5: Order History

- [ ] Preserve existing order data and details behavior.
- [ ] Separate page header, order-state tabs, shared toolbar, customized table, pagination, and details modal.
- [ ] Match the supplied main-page layout.
- [ ] Handle long tables on tablet and mobile.
- [ ] Preserve status, payment, cashier, and order-source labels.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Order History before continuing.

## Phase 6A: Inventory Stock Overview

- [ ] Preserve Inventory query, stock, batch, archive, and modal behavior.
- [ ] Build the Stock Overview tabs and page sections.
- [ ] Extract inventory summary cards.
- [ ] Extract Quick Actions.
- [ ] Build the Inventory Items view on the shared customized table foundation.
- [ ] Preserve expiry and stock-status indicators.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Stock Overview before continuing.

## Phase 6B: Inventory Valuation

- [ ] Preserve valuation formulas, export, and print behavior.
- [ ] Extract the valuation chart and summary.
- [ ] Extract Highest Value.
- [ ] Build the valuation view on the shared customized table foundation.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Inventory Valuation before continuing.

## Phase 6C: Inventory Audit Log

- [ ] Preserve audit query, formatting, export, and print behavior.
- [ ] Separate header, shared toolbar, customized table, badges, and pagination.
- [ ] Use the supplied audit layout as direction while applying the shared customized table system.
- [ ] Preserve action, source, stock-change, batch, reason, reference, and employee fields.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
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
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Sales before continuing.

## Phase 8: Expense Tracking

- [ ] Preserve expense, category, and inventory-purchase behavior.
- [ ] Extract summary metrics.
- [ ] Extract Quick Actions.
- [ ] Extract Expense Distribution.
- [ ] Build the expense records view on the shared customized table foundation.
- [ ] Apply the approved shared filter direction where needed; final button styling remains deferred.
- [ ] Run focused lint and production build.
- [ ] Visually review and approve Expense Tracking before continuing.

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

Visually approve Top Selling Items, then start Recent Orders with the shared customized data-table foundation.
