import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { labelTestSizes, printTestCases } from "../utils/printTestFixtures";

export default function PrintTestWorkbench({ strategy, caseId, onCaseChange, labelSize, onLabelSizeChange, onAction, workbenchRef, feedback, rawbtRequested, onPrepareRawbt }) {
  const isRawbtLocked = strategy.id === "rawbt" && rawbtRequested;
  let choices = printTestCases;
  let value = caseId;
  let onChange = onCaseChange;
  let fieldLabel = "Sample receipt";
  if (strategy.id === "label") {
    choices = labelTestSizes;
    value = labelSize;
    onChange = onLabelSizeChange;
    fieldLabel = "Example sticker size";
  }
  const selectedChoice = choices.find((choice) => choice.id === value);

  return (
    <Card className="min-w-0" ref={workbenchRef} tabIndex={-1} aria-labelledby="print-workbench-heading">
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="print-workbench-heading" className="text-[length:var(--app-font-size-h2)] font-semibold">2. {strategy.title}</h2>
          <Badge variant="outline">{strategy.status}</Badge>
        </div>
        <dl className="space-y-4 text-sm">
          <div><dt className="font-semibold">How it works</dt><dd className="mt-1 text-[var(--app-color-text-muted)]">{strategy.how}</dd></div>
          <div><dt className="font-semibold">What you need</dt><dd className="mt-1 text-[var(--app-color-text-muted)]">{strategy.needs}</dd></div>
          <div><dt className="font-semibold">Settings to check</dt><dd className="mt-1 text-[var(--app-color-text-muted)]">{strategy.settings}</dd></div>
        </dl>
        <div className="space-y-2">
          <label id="print-sample-label" htmlFor="print-sample" className="text-sm font-semibold">{fieldLabel}</label>
          <Select key={fieldLabel} value={value} onValueChange={onChange}>
            <SelectTrigger id="print-sample" aria-labelledby="print-sample-label" className="min-h-11 w-full">
              <SelectValue>{selectedChoice.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {choices.map((choice) => <SelectItem key={choice.id} value={choice.id} className="min-h-11">{choice.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {selectedChoice.description && <p className="text-sm text-[var(--app-color-text-muted)]">{selectedChoice.description}</p>}
        </div>
        <p className="rounded-lg bg-[var(--app-color-canvas)] p-4 text-sm">{strategy.check}</p>
        {feedback && (
          <p
            role={feedback.error ? "alert" : "status"}
            className="rounded-lg border border-[var(--app-color-border-subtle)] p-4 text-sm"
          >
            {feedback.message}
          </p>
        )}
        <Button className="min-h-11 w-full whitespace-normal px-4 py-3" disabled={!strategy.ready || isRawbtLocked} onClick={onAction}>{strategy.button}</Button>
        {isRawbtLocked && (
          <div className="space-y-2 text-sm">
            <p>Check the printer and clear any unwanted queued job in RawBT before preparing another test. Preparing does not send anything.</p>
            <Button variant="outline" className="min-h-11 w-full whitespace-normal" onClick={onPrepareRawbt}>I checked the queue — prepare another test</Button>
          </div>
        )}
        {strategy.id === "rawbt" && (
          <a href="https://play.google.com/store/apps/details?id=ru.a402d.rawbtprinter" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg text-sm underline underline-offset-4 focus-visible:outline-2">Get RawBT on Google Play <span className="sr-only">(opens a new tab)</span></a>
        )}
        {strategy.link && <a href={strategy.link} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg text-sm underline underline-offset-4 focus-visible:outline-2">{strategy.linkLabel} <span className="sr-only">(opens a new tab)</span></a>}
      </CardContent>
    </Card>
  );
}
