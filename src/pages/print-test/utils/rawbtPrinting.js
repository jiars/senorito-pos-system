import { createTextReceiptCommands } from "./textReceiptCommands";

// RawBT's documented binary handoff: rawbt:base64,<encoded printer bytes>.
// https://github.com/402d/DemoRawBtPrinter
export function printTestViaRawbt(receipt) {
  sendRawbtCommands(createTextReceiptCommands(receipt));
}

export const rawbtTestByteLimit = 128 * 1024;

export function sendRawbtCommands(bytes) {
  if (!/Android/i.test(navigator.userAgent)) {
    throw new Error("Open this page in Chrome on Android with RawBT installed. This method is not available on PC or iPhone.");
  }

  // Conservative lab limit for URL handoff, not a claimed RawBT device limit.
  if (bytes.length > rawbtTestByteLimit) {
    throw new Error("This receipt exceeds the lab's 128 KB handoff limit. Choose a shorter sample or use Text fallback in Advanced options after checking the queue.");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  // Keep this synchronous with the button click so Android can open the app.
  // Returning from navigation does not confirm RawBT is installed or has printed.
  window.location.assign(`rawbt:base64,${window.btoa(binary)}`);
}
