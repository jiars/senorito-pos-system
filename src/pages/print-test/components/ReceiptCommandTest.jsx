import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReceiptDocument from "@/components/receipt/ReceiptDocument";
import { imageTestModes, imageTestWidths, prepareImageReceipt } from "../utils/imageReceiptCommands";
import { rawbtTestByteLimit } from "../utils/rawbtPrinting";

// Shared receipt-format controls for RawBT and QZ; the parent owns delivery.
export default function ReceiptCommandTest({ receipt, caseId, onSend, transport, sendDisabled = false, isBusy = false }) {
  const [format, setFormat] = useState("image");
  const [widthId, setWidthId] = useState("384");
  const [mode, setMode] = useState("raster");
  const [prepared, setPrepared] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState("");
  const activeRef = useRef(true);
  const preparingRef = useRef(false);
  const fieldId = useId();

  useEffect(() => {
    activeRef.current = true;
    return () => { activeRef.current = false; };
  }, []);

  function clearPrepared() {
    setPrepared(null);
    setError("");
  }

  async function handlePrepare() {
    if (preparingRef.current || isBusy) {
      return;
    }
    preparingRef.current = true;
    setIsPreparing(true);
    clearPrepared();
    try {
      const result = await prepareImageReceipt(receipt, Number(widthId), mode);
      if (activeRef.current) {
        setPrepared(result);
      }
    } catch (prepareError) {
      if (activeRef.current) {
        setError(prepareError.message);
      }
    } finally {
      preparingRef.current = false;
      if (activeRef.current) {
        setIsPreparing(false);
      }
    }
  }

  let printLabel = "Print via RawBT";
  if (transport === "qz") {
    printLabel = "Send via QZ Tray";
  }
  let tooLarge = false;
  if (prepared && transport === "rawbt") {
    tooLarge = prepared.bytes.length > rawbtTestByteLimit;
  }
  const optionsDisabled = isPreparing || isBusy;
  const selectedMode = imageTestModes.find((option) => { return option.id === mode; });

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold">{format === "image" ? `Image receipt · ${widthId} dots · ${selectedMode.label}` : "Text receipt · 32 columns · PHP currency"}</p>
      <p className="text-sm text-[var(--app-color-text-muted)]">{format === "image" ? "Prepare the image preview, review it, then send once. Preparation never prints." : "Review the text content, then send once. This fallback does not include the logo."}</p>
      <details className="rounded-lg border border-[var(--app-color-border-subtle)] p-3">
        <summary className="min-h-11 cursor-pointer content-center rounded text-sm font-semibold focus-visible:outline-2">Advanced options — only if needed</summary>
        <div className="mt-3 space-y-4">
          <div className="space-y-2">
            <label htmlFor={`${fieldId}-format`} className="text-sm font-semibold">Receipt format</label>
            <Select value={format} disabled={optionsDisabled} onValueChange={(value) => { setFormat(value); clearPrepared(); }}>
              <SelectTrigger id={`${fieldId}-format`} className="min-h-11 w-full"><SelectValue>{format === "image" ? "Image with logo (default)" : "Text fallback"}</SelectValue></SelectTrigger>
              <SelectContent><SelectItem value="image" className="min-h-11">Image with logo (default)</SelectItem><SelectItem value="text" className="min-h-11">Text fallback</SelectItem></SelectContent>
            </Select>
            <p className="text-sm text-[var(--app-color-text-muted)]">Image preserves the logo and characters. Text sends printer text commands without the logo; accents become plain letters. Check the previous queue before trying a fallback.</p>
          </div>
          {format === "image" && (
            <>
              <div className="space-y-2">
                <label htmlFor={`${fieldId}-width`} className="text-sm font-semibold">Printable width in dots</label>
                <Select value={widthId} disabled={optionsDisabled} onValueChange={(value) => { setWidthId(value); clearPrepared(); }}>
                  <SelectTrigger id={`${fieldId}-width`} className="min-h-11 w-full"><SelectValue>{widthId} dots</SelectValue></SelectTrigger>
                  <SelectContent>{imageTestWidths.map((width) => <SelectItem key={width.id} value={width.id} className="min-h-11">{width.label}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-sm text-[var(--app-color-text-muted)]">Use the documented printable dots, not a guessed paper size. The default 384 dots is a test setting, not detected hardware.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor={`${fieldId}-mode`} className="text-sm font-semibold">Image command</label>
                <Select value={mode} disabled={optionsDisabled} onValueChange={(value) => { setMode(value); clearPrepared(); }}>
                  <SelectTrigger id={`${fieldId}-mode`} className="min-h-11 w-full"><SelectValue>{selectedMode.label}</SelectValue></SelectTrigger>
                  <SelectContent>{imageTestModes.map((option) => <SelectItem key={option.id} value={option.id} className="min-h-11">{option.label}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-sm text-[var(--app-color-text-muted)]">Start with Raster. Try Column only after checking the previous job and confirming your printer supports it. This does not change printer firmware or mode.</p>
              </div>
            </>
          )}
        </div>
      </details>
      {format === "image" ? (
        <>
          {!prepared && <Button className="min-h-11 w-full whitespace-normal" disabled={optionsDisabled} onClick={handlePrepare}>{isPreparing ? "Preparing preview…" : "Prepare receipt preview"}</Button>}
          {isPreparing && (
            <div className="space-y-3" role="status" aria-label="Preparing receipt image" aria-busy="true">
              <Skeleton className="mx-auto h-20 w-40" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-48 w-full" />
            </div>
          )}
          {error && <p role="alert" className="text-sm text-[var(--app-color-danger)]">{error}</p>}
          {prepared && (
            <>
              <p role="status" className="text-sm">Preview ready · {prepared.width} × {prepared.height} dots · {(prepared.bytes.length / 1024).toFixed(1)} KB. Check the total before sending.</p>
              <div className="max-h-[36rem] overflow-auto rounded-lg border border-[var(--app-color-border-subtle)] bg-[var(--app-color-canvas)] p-4">
                <img src={prepared.dataUrl} width={prepared.width} height={prepared.height} alt={`Sample ${caseId} receipt with cafe logo. Total PHP ${receipt.total.toFixed(2)}. Ends with END OF TEST RECEIPT.`} className="mx-auto block h-auto max-w-full" />
              </div>
              {tooLarge && <p role="alert" className="text-sm">This image exceeds the lab's 128 KB RawBT handoff limit. Choose a shorter sample, or use Text fallback after checking the queue.</p>}
              <Button className="min-h-11 w-full whitespace-normal" disabled={sendDisabled || isBusy || isPreparing || tooLarge} onClick={() => { onSend(prepared.bytes); }}>{printLabel}</Button>
            </>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-[var(--app-color-text-muted)]">Content preview only; the printer's text layout may differ. No image preparation is needed for this fallback.</p>
          <div className="max-h-[36rem] overflow-auto rounded-lg border border-[var(--app-color-border-subtle)] bg-white p-4 text-black"><ReceiptDocument receipt={receipt} /></div>
          <Button className="min-h-11 w-full whitespace-normal" disabled={sendDisabled || isBusy} onClick={() => { onSend(); }}>{printLabel}</Button>
        </>
      )}
      <p className="text-sm text-[var(--app-color-text-muted)]">{transport === "qz" ? "Uses the QZ target selected above. Approving the job prompt can send it immediately." : "Android may open RawBT and print immediately using the printer selected inside RawBT."} Always check the actual output; this page cannot confirm paper printing.</p>
    </div>
  );
}
