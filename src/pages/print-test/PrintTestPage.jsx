import { useRef, useState } from "react";
import ReceiptModal from "@/components/receipt/ReceiptModal";
import { createPrintTestReceipt } from "./utils/printTestFixtures";
import { printTestViaRawbt, sendRawbtCommands } from "./utils/rawbtPrinting";
import PrintTestHeader from "./components/PrintTestHeader";
import PrintStrategyGuide from "./components/PrintStrategyGuide";
import PrintTestWorkbench from "./components/PrintTestWorkbench";
import PrintTestPreview from "./components/PrintTestPreview";
import { printingStrategies } from "./printingStrategies";

export default function PrintTestPage() {
  const [strategyId, setStrategyId] = useState("browser");
  const [caseId, setCaseId] = useState("simple");
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [rawbtFeedback, setRawbtFeedback] = useState(null);
  const [rawbtRequested, setRawbtRequested] = useState(false);
  const rawbtRequestRef = useRef(false);
  const workbenchRef = useRef(null);
  const strategy = printingStrategies.find((option) => option.id === strategyId);
  const receipt = createPrintTestReceipt(caseId);

  function handleStrategyChange(nextStrategy) {
    setStrategyId(nextStrategy);
    setRawbtFeedback(null);
    if (workbenchRef.current) {
      workbenchRef.current.focus();
    }
  }

  function handleCaseChange(nextCase) {
    setCaseId(nextCase);
    setRawbtFeedback(null);
  }

  function handlePrepareRawbt() {
    rawbtRequestRef.current = false;
    setRawbtRequested(false);
    setRawbtFeedback(null);
  }

  function handleRawbtSend(imageBytes) {
    // Do not send a second job until the user checks the first attempt.
    if (rawbtRequestRef.current) {
      return;
    }
    rawbtRequestRef.current = true;
    try {
      if (imageBytes) {
        sendRawbtCommands(imageBytes);
      } else {
        printTestViaRawbt(receipt);
      }
      setRawbtRequested(true);
      setRawbtFeedback({
        error: false,
        message: "RawBT handoff requested, not confirmed printed. If nothing opens, check RawBT is installed and try Android Chrome. Before another attempt, check RawBT's queue and the printer to avoid duplicates.",
      });
    } catch (error) {
      rawbtRequestRef.current = false;
      setRawbtFeedback({ error: true, message: error.message });
    }
  }

  return (
    <main className="min-h-svh bg-[var(--app-color-canvas)] px-4 py-6 font-[family-name:var(--app-font-family)] text-[var(--app-color-text)] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <PrintTestHeader />
        <PrintStrategyGuide selected={strategy} onSelect={handleStrategyChange} />
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <PrintTestWorkbench strategy={strategy} caseId={caseId} onCaseChange={handleCaseChange} workbenchRef={workbenchRef} />
          <PrintTestPreview receipt={receipt} strategyId={strategyId} caseId={caseId} onOpenReceipt={() => { setIsReceiptOpen(true); }} onSendRawbt={handleRawbtSend} rawbtRequested={rawbtRequested} rawbtFeedback={rawbtFeedback} onPrepareRawbt={handlePrepareRawbt} />
        </div>
        <footer className="space-y-2 border-t border-[var(--app-color-border-subtle)] py-4 text-sm text-[var(--app-color-text-muted)]">
          <p><strong>Emulator ≠ physical printer.</strong> The PC emulator checks supported receipt commands. It cannot prove Bluetooth delivery or physical paper output.</p>
          <p>Test one method at a time. Do not automatically retry with another method: the first job may already have printed.</p>
        </footer>
      </div>
      {isReceiptOpen && <ReceiptModal receipt={receipt} onClose={() => setIsReceiptOpen(false)} />}
    </main>
  );
}
