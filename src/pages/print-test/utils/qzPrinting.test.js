import test from "node:test";
import assert from "node:assert/strict";
import { prepareQzCommandData, sendQzCommands } from "./qzPrinting.js";

function decodeCommands(data) {
  return Uint8Array.from(atob(data[0].data), (character) => { return character.charCodeAt(0); });
}

test("only emulator text initialization skips FS . without mutating the original", () => {
  const bytes = new Uint8Array([0x1b, 0x40, 0x1c, 0x2e, 0x1b, 0x4d, 0x00, 0x41, 0x0a]);
  assert.deepEqual(decodeCommands(prepareQzCommandData(bytes, "emulator")), new Uint8Array([0x1b, 0x40, 0x1b, 0x4d, 0x00, 0x41, 0x0a]));
  assert.deepEqual(decodeCommands(prepareQzCommandData(bytes, "printer")), bytes);
  assert.equal(bytes.length, 9);
});

test("image bytes and embedded control bytes are preserved", () => {
  const bytes = new Uint8Array([0x1b, 0x40, 0x1d, 0x76, 0x30, 0x00, 0xff, 0x1c, 0x2e]);
  const data = prepareQzCommandData(bytes, "emulator");
  assert.equal(data[0].flavor, "base64");
  assert.deepEqual(decodeCommands(data), bytes);
});

test("empty, invalid, and oversized command payloads are rejected", () => {
  assert.throws(() => { prepareQzCommandData(new Uint8Array(), "emulator"); });
  assert.throws(() => { prepareQzCommandData("not printer bytes", "emulator"); });
  assert.throws(() => { prepareQzCommandData(new Uint8Array(2 * 1024 * 1024 + 1), "emulator"); });
});

test("QZ submits one job to the fixed emulator target", async () => {
  let calls = 0;
  const qz = {
    websocket: { isActive: () => { return true; } },
    configs: {
      create: (destination, options) => {
        assert.deepEqual(destination, { host: "127.0.0.1", port: 9100 });
        assert.equal(options.copies, 1);
        return { destination, options };
      },
    },
    print: async (config, data) => {
      calls += 1;
      assert.equal(config.destination.port, 9100);
      assert.deepEqual(decodeCommands(data), new Uint8Array([0x41, 0x0a]));
    },
  };
  await sendQzCommands(qz, new Uint8Array([0x41, 0x0a]), "emulator", "");
  assert.equal(calls, 1);
});

test("disconnected or missing printer targets do not submit a job", async () => {
  const qz = {
    websocket: { isActive: () => { return false; } },
    print: () => { assert.fail("No print call expected"); },
  };
  await assert.rejects(sendQzCommands(qz, new Uint8Array([0x41]), "emulator", ""));
  qz.websocket.isActive = () => { return true; };
  await assert.rejects(sendQzCommands(qz, new Uint8Array([0x41]), "printer", ""));
});
