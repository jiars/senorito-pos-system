import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function PrintTestHeader() {
  return (
    <header className="space-y-[var(--app-space-4)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-semibold text-[var(--app-color-brand)]">Señorito Cafe · Testing tools</p>
        <Link to="/login" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm underline underline-offset-4 focus-visible:outline-2">Back to sign in</Link>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-[length:var(--app-font-size-h1)] font-bold leading-[var(--app-line-height-h1)] text-[var(--app-color-brand-header)]">Printing test lab</h1>
        <Badge variant="outline">Public · sample data only</Badge>
      </div>
      <p className="max-w-2xl text-[var(--app-color-text-muted)]">Try different ways to print, compare the results, then keep the method that works with your printer.</p>
      <p className="rounded-[var(--app-radius-nested)] border border-[var(--app-color-brand-border)] bg-[var(--app-color-surface-soft)] p-4 text-sm">
        No login needed. No real orders, customer details, or stock changes. Nothing prints automatically. Use a printer you have permission to test.
      </p>
    </header>
  );
}
