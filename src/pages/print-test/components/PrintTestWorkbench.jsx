import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { printTestCases } from "../utils/printTestFixtures";

export default function PrintTestWorkbench({ strategy, caseId, onCaseChange, workbenchRef }) {
  const selectedChoice = printTestCases.find((choice) => choice.id === caseId);

  return (
    <Card className="min-w-0" ref={workbenchRef} tabIndex={-1} aria-labelledby="print-workbench-heading">
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="print-workbench-heading" className="text-[length:var(--app-font-size-h2)] font-semibold">2. Setup guide</h2>
          <Badge variant="outline">{strategy.status}</Badge>
        </div>
        <div className="space-y-2 text-sm">
          <h3 className="font-semibold">{strategy.title}</h3>
          <p className="text-[var(--app-color-text-muted)]">{strategy.how}</p>
          <p><strong>You need:</strong> {strategy.needs}</p>
        </div>
        <ol className="list-decimal space-y-4 pl-5 text-sm marker:font-semibold marker:text-[var(--app-color-brand)]">
          {strategy.tutorial.map((step) => (
            <li key={step.title} className="pl-1">
              <p className="font-semibold">{step.title}</p>
              <p className="mt-1 text-[var(--app-color-text-muted)]">{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="space-y-2">
          <label id="print-sample-label" htmlFor="print-sample" className="text-sm font-semibold">Sample receipt</label>
          <Select value={caseId} onValueChange={onCaseChange}>
            <SelectTrigger id="print-sample" aria-labelledby="print-sample-label" className="min-h-11 w-full">
              <SelectValue>{selectedChoice.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {printTestCases.map((choice) => <SelectItem key={choice.id} value={choice.id} className="min-h-11">{choice.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {selectedChoice.description && <p className="text-sm text-[var(--app-color-text-muted)]">{selectedChoice.description}</p>}
        </div>
        <p className="rounded-lg bg-[var(--app-color-canvas)] p-4 text-sm">{strategy.check}</p>
        {strategy.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="flex min-h-11 items-center rounded-lg text-sm underline underline-offset-4 focus-visible:outline-2">{link.label} <span className="sr-only">(opens a new tab)</span></a>)}
      </CardContent>
    </Card>
  );
}
