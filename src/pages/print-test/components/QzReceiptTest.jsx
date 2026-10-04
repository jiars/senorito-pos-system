import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReceiptCommandTest from "./ReceiptCommandTest";
import { createTextReceiptCommands } from "../utils/textReceiptCommands";
import { loadQzTray, sendQzCommands } from "../utils/qzPrinting";

export default function QzReceiptTest({ receipt, caseId }) {
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [targetId, setTargetId] = useState("emulator");
  const [printers, setPrinters] = useState([]);
  const [printerName, setPrinterName] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const qzRef = useRef(null);
  const activeRef = useRef(true);
  const busyRef = useRef(false);
  const attemptedRef = useRef(false);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      const qz = qzRef.current;
      if (qz) {
        qz.websocket.setClosedCallbacks([]);
        qz.websocket.setErrorCallbacks([]);
        if (qz.websocket.isActive()) {
          // Disconnecting never cancels an already submitted printer job.
          qz.websocket.disconnect().catch(() => {});
        }
      }
    };
  }, []);

  async function handleConnection(action) {
    if (busyRef.current) {
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      const qz = await loadQzTray();
      if (!activeRef.current) {
        return;
      }
      qzRef.current = qz;
      qz.websocket.setClosedCallbacks(() => {
        if (activeRef.current) {
          setConnected(false);
          setPrinters([]);
          setPrinterName("");
          setFeedback({ error: false, message: "QZ disconnected. No automatic retry was made. Check any submitted job before trying again." });
        }
      });
      qz.websocket.setErrorCallbacks(() => {
        if (activeRef.current) {
          setConnected(qz.websocket.isActive());
          setFeedback({ error: true, message: "QZ connection error. Check that the desktop app is running and review its permission prompt." });
        }
      });

      if (action === "connect") {
        if (!qz.websocket.isActive()) {
          await qz.websocket.connect();
        }
        if (!activeRef.current) {
          await qz.websocket.disconnect();
          return;
        }
        setConnected(true);
        setFeedback({ error: false, message: "Connected to QZ Tray. No receipt has been sent. Select a target and send one test." });
      } else if (action === "disconnect") {
        await qz.websocket.disconnect();
      } else if (action === "printers") {
        if (!qz.websocket.isActive()) {
          throw new Error("Connect QZ Tray first.");
        }
        const names = await qz.printers.find();
        if (activeRef.current) {
          setPrinters(names.sort());
          setPrinterName((current) => {
            if (names.includes(current)) {
              return current;
            }
            return "";
          });
          setFeedback({ error: false, message: names.length ? "Printer list loaded. Choose the exact printer; nothing was printed." : "No installed printers found. Install the correct driver, or use the PC emulator target." });
        }
      }
    } catch (error) {
      if (activeRef.current) {
        let isConnected = false;
        if (qzRef.current) {
          isConnected = qzRef.current.websocket.isActive();
        }
        setConnected(isConnected);
        setFeedback({ error: true, message: `${error.message || "QZ connection failed."} Ensure QZ Tray is installed and running. Review QZ/browser local-connection permissions; do not disable browser security.` });
      }
    } finally {
      busyRef.current = false;
      if (activeRef.current) {
        setBusy(false);
      }
    }
  }

  async function handleSend(imageBytes) {
    if (busyRef.current || attemptedRef.current) {
      return;
    }
    const qz = qzRef.current;
    if (!qz || !qz.websocket.isActive()) {
      setConnected(false);
      setFeedback({ error: true, message: "QZ Tray is disconnected. Connect first; no job was sent." });
      return;
    }
    if (targetId === "printer" && !printers.includes(printerName)) {
      setFeedback({ error: true, message: "Load the printer list and select an installed printer first; no job was sent." });
      return;
    }
    busyRef.current = true;
    attemptedRef.current = true;
    setBusy(true);
    setAttempted(true);
    setFeedback(null);
    try {
      const bytes = imageBytes || createTextReceiptCommands(receipt);
      await sendQzCommands(qz, bytes, targetId, printerName);
      if (activeRef.current) {
        setFeedback({ error: false, message: `QZ accepted the ${imageBytes ? "image" : "text"} job for ${targetId === "emulator" ? "127.0.0.1:9100" : printerName}. Check its actual output; this is not confirmed physical printing.` });
      }
    } catch (error) {
      if (activeRef.current) {
        setFeedback({ error: true, message: `${error.message || "QZ send failed or was denied."} Nothing was retried. Check the emulator/printer and its queue before preparing another attempt.` });
      }
    } finally {
      busyRef.current = false;
      if (activeRef.current) {
        setBusy(false);
        setConnected(qz.websocket.isActive());
      }
    }
  }

  const cannotSend = !connected || busy || attempted || (targetId === "printer" && !printerName);
  let connectionLabel = "Disconnected";
  if (busy) {
    connectionLabel = "Waiting for QZ…";
  } else if (connected) {
    connectionLabel = "Connected";
  }
  let targetLabel = "PC emulator — 127.0.0.1:9100";
  if (targetId === "printer") {
    targetLabel = "Installed printer — may print immediately";
  }

  return (
    <div className="space-y-4">
      <p role="status" className="text-sm font-semibold">QZ Tray: {connectionLabel}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant={connected ? "outline" : "default"} className="min-h-11" disabled={busy} onClick={() => { handleConnection(connected ? "disconnect" : "connect"); }}>{connected ? "Disconnect" : "Connect QZ Tray"}</Button>
      </div>
      <p className="text-sm text-[var(--app-color-text-muted)]">Unsigned testing keeps QZ permission prompts. Approve only this site's connection and the sample job you requested. No Render settings or API keys are needed.</p>
      <div className="space-y-2">
        <label htmlFor="qz-test-target" className="text-sm font-semibold">Where to send</label>
        <Select value={targetId} disabled={busy} onValueChange={setTargetId}>
          <SelectTrigger id="qz-test-target" className="min-h-11 w-full"><SelectValue>{targetLabel}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="emulator" className="min-h-11">PC emulator — 127.0.0.1:9100</SelectItem>
            <SelectItem value="printer" className="min-h-11">Installed printer — may print immediately</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {targetId === "emulator" ? (
        <p className="rounded-lg bg-[var(--app-color-canvas)] p-3 text-sm">Start the emulator's TCP listener on 127.0.0.1, port 9100, on this same PC. Clear its preview first. Text delivery skips the initialization command that previously blocked this emulator; real-printer commands are unchanged.</p>
      ) : (
        <div className="space-y-2">
          <Button variant="outline" className="min-h-11" disabled={!connected || busy} onClick={() => { handleConnection("printers"); }}>Load / refresh printers</Button>
          <label htmlFor="qz-test-printer" className="block text-sm font-semibold">Installed printer</label>
          <Select value={printerName} disabled={busy || !connected || !printers.length} onValueChange={setPrinterName}>
            <SelectTrigger id="qz-test-printer" className="min-h-11 w-full"><SelectValue placeholder="Choose the exact printer" /></SelectTrigger>
            <SelectContent>{printers.map((name) => <SelectItem key={name} value={name} className="min-h-11">{name}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-sm text-[var(--app-color-text-muted)]">Only use a compatible ESC/POS receipt printer and correct driver/raw queue. Do not choose a PDF printer or change the cafe's printer mode for this test.</p>
        </div>
      )}
      {feedback && <p role={feedback.error ? "alert" : "status"} className="rounded-lg border border-[var(--app-color-border-subtle)] p-3 text-sm break-words">{feedback.message}</p>}
      {attempted && (
        <div className="space-y-2 text-sm">
          <p>Send is locked after an attempt to avoid duplicates. Check the output and clear unwanted queued jobs before another attempt. Disconnecting does not cancel a submitted job.</p>
          <Button variant="outline" className="min-h-11 w-full whitespace-normal" disabled={busy} onClick={() => { attemptedRef.current = false; setAttempted(false); setFeedback(null); }}>I checked the output / queue — prepare another test</Button>
        </div>
      )}
      <ReceiptCommandTest key={caseId} receipt={receipt} caseId={caseId} transport="qz" onSend={handleSend} sendDisabled={cannotSend} isBusy={busy} />
    </div>
  );
}
