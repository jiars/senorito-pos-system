/**
 * Web Bluetooth ESC/POS Printer Service
 * This bypasses the OS and talks directly to a 58mm Thermal Printer via Bluetooth.
 * Requires Google Chrome or Edge.
 */

// Store the active connection in memory
let printCharacteristic = null;

export const connectBluetoothPrinter = async () => {
  try {
    // 1. Request the Bluetooth device from Chrome
    // The standard service UUID for generic Bluetooth thermal printers is usually 000018f0...
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, 
      ],
      optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
    });

    console.log('Connecting to GATT Server...');
    const server = await device.gatt.connect();

    console.log('Getting Printer Service...');
    const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');

    console.log('Getting Print Characteristic...');
    // The standard characteristic used to write bytes to generic thermal printers
    printCharacteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

    console.log('Bluetooth Printer Connected Successfully!');
    return device.name || 'Unknown Printer';
  } catch (error) {
    console.error('Bluetooth Connection Error:', error);
    throw error;
  }
};

export const printReceiptBluetooth = async (orderDetails) => {
  if (!printCharacteristic) {
    throw new Error('No printer connected. Please connect the printer first.');
  }

  // --- ESC/POS HEX COMMANDS ---
  const CMD_INIT = new Uint8Array([0x1b, 0x40]);            // Initialize Printer
  const CMD_ALIGN_CENTER = new Uint8Array([0x1b, 0x61, 1]); // Center Align
  const CMD_ALIGN_LEFT = new Uint8Array([0x1b, 0x61, 0]);   // Left Align
  const CMD_BOLD_ON = new Uint8Array([0x1b, 0x45, 1]);      // Bold Text On
  const CMD_BOLD_OFF = new Uint8Array([0x1b, 0x45, 0]);     // Bold Text Off
  const CMD_NEWLINE = new Uint8Array([0x0a]);               // Feed Line (Enter)
  
  // Encode text to raw bytes
  const encoder = new TextEncoder();
  const encode = (text) => encoder.encode(text);

  // We will store all bytes here and send them to the printer at once
  let printData = new Uint8Array();

  // We will also build a plain-text string so you can preview it in the console!
  let consolePreview = "";

  const appendData = (newData, textPreview = "") => {
    const merged = new Uint8Array(printData.length + newData.length);
    merged.set(printData);
    merged.set(newData, printData.length);
    printData = merged;
    if (textPreview) consolePreview += textPreview;
  };

  try {
    // 1. Initialize & Header
    appendData(CMD_INIT);
    appendData(CMD_ALIGN_CENTER);
    appendData(CMD_BOLD_ON);
    appendData(encode("Senorito Cafe\n"), "Senorito Cafe\n");
    appendData(CMD_BOLD_OFF);
    appendData(encode("284 FR. CORDERO ST., LAMBAKIN,\nMARILAO, BULACAN, 3019\n\n"), "284 FR. CORDERO ST., LAMBAKIN,\nMARILAO, BULACAN, 3019\n\n");
    
    // 2. Transaction Info
    appendData(encode(`Order: ${orderDetails.order_number || orderDetails.id}\n`), `Order: ${orderDetails.order_number || orderDetails.id}\n`);
    appendData(encode(`Cashier: ${orderDetails.cashier || 'System'}\n`), `Cashier: ${orderDetails.cashier || 'System'}\n`);
    appendData(encode("--------------------------------\n"), "--------------------------------\n");

    // 3. Items (We'll expand this later, keeping it simple for now)
    appendData(CMD_ALIGN_LEFT);
    appendData(encode("Total: P" + orderDetails.total.toFixed(2) + "\n"), "Total: P" + orderDetails.total.toFixed(2) + "\n");
    appendData(encode("Amount Paid: P" + orderDetails.amountPaid.toFixed(2) + "\n"), "Amount Paid: P" + orderDetails.amountPaid.toFixed(2) + "\n");
    appendData(encode("Change: P" + orderDetails.change.toFixed(2) + "\n"), "Change: P" + orderDetails.change.toFixed(2) + "\n");
    
    // 4. Footer
    appendData(CMD_ALIGN_CENTER);
    appendData(encode("\n--------------------------------\n"), "\n--------------------------------\n");
    appendData(encode("Thank you for your purchase!\n"), "Thank you for your purchase!\n");
    
    // Feed paper so it clears the cutter
    appendData(CMD_NEWLINE, "\n");
    appendData(CMD_NEWLINE, "\n");
    appendData(CMD_NEWLINE, "\n"); 

    console.log("=== VIRTUAL PRINTER PREVIEW ===");
    console.log(consolePreview);
    console.log("===============================");

    // Send the massive array of bytes directly to the hardware!
    await printCharacteristic.writeValue(printData);
    
    console.log("Printed successfully via Bluetooth!");
    return { success: true };
  } catch (error) {
    console.error("Failed to print via Bluetooth:", error);
    throw error;
  }
};
