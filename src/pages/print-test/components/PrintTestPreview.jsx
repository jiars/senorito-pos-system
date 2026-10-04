import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReceiptDocument from "@/components/receipt/ReceiptDocument";
import ReceiptCommandTest from "./ReceiptCommandTest";
import QzReceiptTest from "./QzReceiptTest";

export default function PrintTestPreview({ receipt, strategyId, caseId, onOpenReceipt, onSendRawbt, rawbtRequested, rawbtFeedback, onPrepareRawbt }) {
  return (
    <Card className="min-w-0" aria-labelledby="print-preview-heading">
      <CardContent className="space-y-4">
        <h2 id="print-preview-heading" className="text-[length:var(--app-font-size-h2)] font-semibold">3. Preview and print</h2>
        {/* Keep the QZ connection and duplicate-send guard when switching method cards. */}
        <div hidden={strategyId !== "qz"}><QzReceiptTest receipt={receipt} caseId={caseId} /></div>
        {strategyId === "rawbt" && (
          <>
            {rawbtFeedback && <p role={rawbtFeedback.error ? "alert" : "status"} className="rounded-lg border border-[var(--app-color-border-subtle)] p-3 text-sm break-words">{rawbtFeedback.message}</p>}
            {rawbtRequested && (
              <div className="space-y-2 text-sm">
                <p>Check the printer and RawBT's queue before another attempt. Clear unwanted queued jobs first; do not send duplicates while waiting.</p>
                <Button variant="outline" className="min-h-11 w-full whitespace-normal" onClick={onPrepareRawbt}>I checked the output / queue — prepare another test</Button>
              </div>
            )}
            <ReceiptCommandTest key={caseId} receipt={receipt} caseId={caseId} transport="rawbt" onSend={onSendRawbt} sendDisabled={rawbtRequested} />
          </>
        )}
        {strategyId === "browser" && (
          <>
            <p className="text-sm text-[var(--app-color-text-muted)]">Review this sample, then open the receipt modal. Its Print Receipt button opens the browser's print window.</p>
            <div className="max-h-[36rem] overflow-auto rounded-lg border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] p-4">
              <div className="mx-auto max-w-sm bg-white p-4"><ReceiptDocument receipt={receipt} /></div>
            </div>
            <Button className="min-h-11 w-full whitespace-normal" onClick={onOpenReceipt}>Open test receipt</Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
