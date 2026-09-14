# Resume Here

Last updated: September 14, 2026

## Current Direction

- Continue migrating working modules from direct Supabase calls to Laravel.
- Employee Management and authentication ownership are paused for team discussion.
- No Employee/Auth database migration from the recent discussion has been created or run.
- Keep the `profiles` table name for now.

## Employee/Auth Decisions Still Pending

- Final choice between Laravel-owned authentication and Supabase Auth.
- Recommended flow: Owner creates the profile and role; employee receives a one-time invitation and creates their own password.
- Possible statuses: `Pending`, `Active`, and `Deactivated`.
- Permanent QR-only login is not recommended. QR + PIN may be considered later only on trusted POS devices.
- Do not remove `profiles_id_fkey`, Supabase Auth records, or the frontend service-role setup until the team approves the final approach.

## Next Module: Expense Categories

Backend work already completed:

- Separate Expense Category controller exists.
- Expense and Expense Category model relationships exist.
- Index, store, update, and unused-only destroy operations exist.
- Protected Expense Category routes are registered.

Next work:

1. Review the current Expense Category React and Supabase service flow.
2. Move the frontend service to the shared Axios instance.
3. Connect refresh behavior through TanStack Query.
4. Test add, edit, and unused-only delete behavior.

## Important Working Rules

- Work in batches of two or three related tasks.
- The user manually writes Laravel backend and service `.js` code.
- Codex may directly refactor JSX, CSS, hooks, utilities, and tracking files.
- Use Menu Management as the architecture reference.
- Keep explanations simple and concise, but explain the purpose of every code change.
