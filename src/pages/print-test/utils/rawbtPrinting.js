import { createTextReceiptCommands } from "./textReceiptCommands";

// RawBT's documented binary handoff: rawbt:base64,<encoded printer bytes>.
// https://github.com/402d/DemoRawBtPrinter
export function printTestViaRawbt(receipt) {
  if (!/Android/i.test(navigator.userAgent)) {
    throw new Error("Open this page in Chrome on Android with RawBT installed. This method is not available on PC or iPhone.");
  }

  const bytes = createTextReceiptCommands(receipt);

  // Conservative lab limit for URL handoff, not a claimed RawBT device limit.
  if (bytes.length > 16384) {
    throw new Error("This sample is too large for this test's URL handoff. Choose a smaller receipt.");
  }

  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  // Keep this synchronous with the button click so Android can open the app.
  // Returning from navigation does not confirm RawBT is installed or has printed.
  window.location.assign(`rawbt:base64,${window.btoa(binary)}`);
}
