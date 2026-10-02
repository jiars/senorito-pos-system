import { Card, CardContent } from "@/components/ui/card";
import ReceiptDocument from "@/components/receipt/ReceiptDocument";

export default function PrintTestPreview({ receipt, isLabel, labelSize, previewRef }) {
  return (
    <Card className="min-w-0" ref={previewRef} tabIndex={-1} aria-labelledby="print-preview-heading">
      <CardContent className="space-y-4">
        <h2 id="print-preview-heading" className="text-[length:var(--app-font-size-h2)] font-semibold">3. Sample preview</h2>
        <p className="text-sm text-[var(--app-color-text-muted)]">{isLabel ? "Example cup sticker. Screen size is approximate; label printing is not connected yet." : "Sample content only. Use the browser receipt test to see the actual 58 mm print layout. Command methods will have their own output."}</p>
        <div className="max-h-[36rem] overflow-auto rounded-lg border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] p-4">
          {isLabel ? (
            <div data-testid="sample-label" className="mx-auto flex flex-col justify-between border border-dashed border-black bg-white p-2 text-black" style={{ width: `${labelSize.width}mm`, minHeight: `${labelSize.height}mm`, aspectRatio: `${labelSize.width} / ${labelSize.height}` }}>
              <p className="text-xs font-bold">TEST ONLY · SAMPLE-001</p>
              <div><p className="text-sm font-bold">Iced Latte · Large</p><p className="text-xs">Extra espresso shot</p></div>
              <p className="text-xs">Drink 1 of 2 · Not a sale</p>
            </div>
          ) : (
            <div className="mx-auto max-w-sm bg-white p-4"><ReceiptDocument receipt={receipt} /></div>
          )}
        </div>
        {isLabel && <p className="text-sm font-medium">Example dimensions: {labelSize.label}. Measure your sticker before choosing settings.</p>}
      </CardContent>
    </Card>
  );
}
