// Temporary, unsigned lab integration: permission prompts remain enabled.
// https://qz.io/docs/getting-started and https://qz.io/docs/raw
let qzPromise;

export function loadQzTray() {
  if (!qzPromise) {
    qzPromise = import("qz-tray").then((module) => {
      const qz = module.default;
      qz.security.setCertificatePromise((resolve) => { resolve(null); });
      return qz;
    }).catch((error) => {
      qzPromise = null;
      throw error;
    });
  }
  return qzPromise;
}

export function prepareQzCommandData(bytes, targetId) {
  if (!(bytes instanceof Uint8Array) || bytes.length === 0 || bytes.length > 2 * 1024 * 1024) {
    throw new Error("Choose a prepared sample command payload between 1 byte and the lab's 2 MB limit.");
  }

  let commands = bytes;
  // CrossEscPos rejects FS . in the encoder's initialization sequence.
  // Remove only that known prefix command for the emulator, never for hardware.
  if (targetId === "emulator" && bytes[0] === 0x1b && bytes[1] === 0x40 && bytes[2] === 0x1c && bytes[3] === 0x2e) {
    commands = new Uint8Array(bytes.length - 2);
    commands.set(bytes.subarray(0, 2));
    commands.set(bytes.subarray(4), 2);
  }

  let binary = "";
  for (const byte of commands) {
    binary += String.fromCharCode(byte);
  }
  return [{ type: "raw", format: "command", flavor: "base64", data: btoa(binary) }];
}

export async function sendQzCommands(qz, bytes, targetId, printerName) {
  if (!qz.websocket.isActive()) {
    throw new Error("QZ Tray is disconnected. Connect again before sending.");
  }
  let destination;
  if (targetId === "emulator") {
    // Fixed loopback target; this public lab does not accept arbitrary network hosts.
    destination = { host: "127.0.0.1", port: 9100 };
  } else if (targetId === "printer" && printerName) {
    destination = printerName;
  } else {
    throw new Error("Select the emulator or an installed printer first.");
  }
  const data = prepareQzCommandData(bytes, targetId);
  const config = qz.configs.create(destination, { copies: 1, jobName: "Senorito POS - TEST ONLY" });
  await qz.print(config, data);
}
