import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  Pill,
  Row,
  Stack,
  Table,
  Text,
  useHostTheme,
} from "cursor/canvas";

const migrationRows = [
  ["Authentication", "Laravel Sanctum", "Partial", "Login/logout/user are Laravel; password and activity still use Supabase"],
  ["Dashboard", "Laravel API", "Migrated", "One summary endpoint"],
  ["Menu and add-ons", "Laravel API", "Mostly migrated", "CRUD and nested recipes use orchestrators; images still use Supabase Storage"],
  ["Inventory", "Mixed", "In progress", "Init and categories use Laravel; item, stock, batch, archive and audit actions still use Supabase"],
  ["Employees", "Supabase", "Not migrated", "Uses a frontend service-role client"],
  ["Expenses", "Supabase", "Not migrated", "Includes purchases and wastage links"],
  ["Orders and POS", "Supabase + Dexie", "Not migrated", "Checkout and offline sync still write to Supabase"],
  ["Reports and profile", "Supabase", "Not migrated", "Dashboard is the exception"],
];

const risks = [
  ["Critical", "Supabase service-role key is used in frontend code", "Move every admin action to Laravel, then remove the frontend key"],
  ["Critical", "Laravel routes only check login, not employee role", "Add backend permission rules; frontend route guards are only UI"],
  ["High", "The /user response does not load its role and React defaults to Owner", "Return the real role and remove the Owner fallback"],
  ["High", "Online checkout fails instead of queuing when the API is asleep or unreachable", "Treat network/API failure as offline and queue safely"],
  ["High", "Offline reload still calls Laravel before restoring the user", "Design a safe local session for POS-only access"],
  ["High", "Offline stock deduction misses add-ons and unit conversion", "Use one shared deduction format and make sync idempotent"],
  ["Medium", "Schema documents are behind the code", "Regenerate the schema guide after each completed module"],
];

export default function SenoritoSystemOverview() {
  const theme = useHostTheme();

  return (
    <Stack gap={18} style={{ padding: 24, background: theme.bg.editor, color: theme.text.primary }}>
      <Stack gap={6}>
        <H1>Señorito POS — system understanding</H1>
        <Text tone="secondary">Current branch: migrate-laravel-phase2 · Review date: September 10, 2026</Text>
        <Row gap={8} wrap>
          <Pill active>React 19</Pill>
          <Pill>Laravel 13</Pill>
          <Pill>Supabase PostgreSQL</Pill>
          <Pill>Sanctum</Pill>
          <Pill>TanStack Query</Pill>
          <Pill>Axios</Pill>
          <Pill>Dexie PWA</Pill>
        </Row>
      </Stack>

      <Callout tone="success" title="Main direction is correct">
        Keep React focused on the interface. Put validation, permissions, stock changes, checkout, and multi-table transactions in Laravel. Keep Supabase as PostgreSQL and file storage infrastructure.
      </Callout>

      <Stack gap={10}>
        <H2>Actual migration state</H2>
        <Table
          headers={["Module", "Current data path", "State", "Important note"]}
          rows={migrationRows}
          rowTone={["warning", "success", "info", "warning", "danger", "danger", "danger", "danger"]}
          striped
        />
      </Stack>

      <Grid columns="1fr 1fr" gap={14}>
        <Card>
          <CardHeader>Business flow</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>Inventory items hold base units, conversion units, minimum stock, expiry settings, and separate purchase batches.</Text>
              <Divider />
              <Text>Menu prices can be fixed or variants. Each price is connected to inventory through recipes.</Text>
              <Divider />
              <Text>Add-ons apply only to selected menu categories and also have inventory recipes.</Text>
              <Divider />
              <Text>Checkout creates the receipt and item rows, then deducts ingredients and writes audit records.</Text>
            </Stack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Target backend pattern</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>React sends one complete payload through an Axios service.</Text>
              <Divider />
              <Text>Laravel validates the full payload and starts one database transaction.</Text>
              <Divider />
              <Text>An orchestrator compares existing and incoming child IDs, then inserts, updates, or removes only exact records.</Text>
              <Divider />
              <Text>TanStack Query owns server cache and refreshes the module after a mutation.</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Stack gap={10}>
        <H2>Important risks before the next modules</H2>
        <Table
          headers={["Level", "Finding", "Recommended direction"]}
          rows={risks}
          rowTone={["danger", "danger", "warning", "warning", "warning", "warning", "info"]}
          striped
        />
      </Stack>

      <Callout tone="warning" title="Current working tree">
        Inventory migration and UI refactoring files are already staged or modified. Preserve these changes and finish the current inventory phase before starting another large module.
      </Callout>

      <Stack gap={8}>
        <H2>Decisions still needed</H2>
        <Text>1. Is the highest role named Admin, Owner, or System Admin?</Text>
        <Text>2. Should offline mode allow cash only, or also GCash and external payments?</Text>
        <Text>3. What is the final rule when offline stock conflicts with newer cloud stock?</Text>
        <Text>4. Should menu and expense categories be archived, or can unused categories be permanently deleted?</Text>
        <Text>5. Will Laravel fully own employee accounts and password reset?</Text>
        <Text>6. Which database functions, triggers, RLS policies, and enum values exist in Supabase?</Text>
      </Stack>
    </Stack>
  );
}
