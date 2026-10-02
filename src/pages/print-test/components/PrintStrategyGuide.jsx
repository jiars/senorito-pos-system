import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { printingStrategies } from "../printingStrategies";

export default function PrintStrategyGuide({ selected, onSelect }) {
  return (
    <section aria-labelledby="print-methods-heading" className="space-y-4">
      <div>
        <h2 id="print-methods-heading" className="text-[length:var(--app-font-size-h2)] font-semibold">1. Choose an approach</h2>
        <p className="text-sm text-[var(--app-color-text-muted)]">Only “Ready to try” sends you to a working print action. The other cards explain upcoming tests.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {printingStrategies.map((strategy) => {
          const isSelected = selected.id === strategy.id;
          return (
            <Card key={strategy.id} className={isSelected ? "ring-2 ring-[var(--app-color-brand)]" : ""}>
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-center justify-between gap-2">
                  <i className={`bi ${strategy.icon} text-xl text-[var(--app-color-brand)]`} aria-hidden="true" />
                  <Badge variant="outline">{strategy.status}</Badge>
                </div>
                <h3 className="text-[length:var(--app-font-size-h3)] font-semibold">{strategy.title}</h3>
                <p className="flex-1 text-sm text-[var(--app-color-text-muted)]">{strategy.summary}</p>
                <Button variant="outline" className="min-h-11 w-full" aria-pressed={isSelected} onClick={() => onSelect(strategy.id)}>
                  View {strategy.title.toLowerCase()}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
