import ReceiptPrinterEncoder from "@point-of-sale/receipt-printer-encoder";

export const imageTestWidths = [
  { id: "384", label: "384 dots", width: 384 },
  { id: "576", label: "576 dots", width: 576 },
];

export const imageTestModes = [
  { id: "raster", label: "Raster (GS v 0)" },
  { id: "column", label: "Column (ESC * 33)" },
];

function loadLogo() {
  return new Promise((resolve, reject) => {
    const logo = new Image();
    const timeout = window.setTimeout(() => {
      logo.src = "";
      reject(new Error("Logo loading timed out. Open the updated site online once, then prepare again."));
    }, 8000);

    logo.onload = () => {
      window.clearTimeout(timeout);
      resolve(logo);
    };
    logo.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Could not load the receipt logo. Open the updated site online once, then prepare again."));
    };
    logo.src = `${import.meta.env.BASE_URL}senorito-cafe-pfp.png`;
  });
}

function money(value) {
  return `₱${Number(value).toFixed(2)}`;
}

// Wrap by actual rendered width, including words longer than the available space.
function wrapText(context, value, width) {
  const lines = [];
  let line = "";
  for (const word of String(value).split(/\s+/)) {
    let candidate = word;
    if (line) {
      candidate = `${line} ${word}`;
    }
    if (context.measureText(candidate).width <= width) {
      line = candidate;
      continue;
    }
    if (line) {
      lines.push(line);
    }
    line = "";
    for (const character of word) {
      if (line && context.measureText(line + character).width > width) {
        lines.push(line);
        line = "";
      }
      line += character;
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

export async function prepareImageReceipt(receipt, width, mode) {
  if (![384, 576].includes(width) || !["raster", "column"].includes(mode)) {
    throw new Error("Choose one of the listed image settings.");
  }
  const logo = await loadLogo();
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("This browser could not create the receipt image.");
  }

  const scale = width / 384;
  const padding = Math.round(16 * scale);
  const contentWidth = width - padding * 2;
  const lineHeight = Math.round(26 * scale);
  const bodyFont = `${Math.round(20 * scale)}px monospace`;
  const boldFont = `bold ${Math.round(20 * scale)}px monospace`;
  const titleFont = `bold ${Math.round(25 * scale)}px monospace`;
  const logoWidth = Math.round(width * 0.55);
  const logoHeight = Math.round(logoWidth * logo.naturalHeight / logo.naturalWidth);
  const rows = [];

  function addText(text, bold = false, centered = false) {
    let font = bodyFont;
    if (bold) {
      font = boldFont;
    }
    context.font = font;
    for (const line of wrapText(context, text, contentWidth)) {
      rows.push({ text: line, font, centered });
    }
  }

  function addAmount(label, amount, bold = false) {
    let font = bodyFont;
    if (bold) {
      font = boldFont;
    }
    context.font = font;
    const value = money(amount);
    const labelWidth = contentWidth - context.measureText(value).width - 12 * scale;
    const lines = wrapText(context, label, labelWidth);
    for (let index = 0; index < lines.length; index++) {
      let right = "";
      if (index === lines.length - 1) {
        right = value;
      }
      rows.push({ text: lines[index], right, font });
    }
  }

  function addDivider() {
    rows.push({ divider: true });
  }

  rows.push({ text: "Señorito Cafe", font: titleFont, centered: true });
  addText("TEST ONLY — NOT A SALE", true, true);
  addText(receipt.transactionId);
  addDivider();
  addText(`Cashier: ${receipt.cashier}`);
  addText(`Payment: ${receipt.paymentMethod}`);
  addDivider();

  for (const item of receipt.items) {
    let name = item.name;
    if (item.variant) {
      name += ` (${item.variant})`;
    }
    addText(name, true);
    addAmount(`${item.qty} × ${money(item.basePrice)}`, item.qty * item.basePrice);
    for (const addon of item.addOns) {
      const quantity = addon.qty * item.qty;
      addText(`+ ${addon.name}`);
      addAmount(`${quantity} × ${money(addon.price)}`, quantity * addon.price);
    }
    rows.push({ blank: true });
  }

  addDivider();
  addAmount("Subtotal", receipt.subtotal);
  addText(`Discount: ${receipt.discountType}`);
  addAmount("Discount amount", receipt.discountAmount);
  addAmount("TOTAL", receipt.total, true);
  addAmount("Paid", receipt.amountPaid);
  addAmount("Change", receipt.change);
  addDivider();
  addText("END OF TEST RECEIPT", true, true);

  const textStart = padding + logoHeight + padding;
  const height = Math.ceil((textStart + rows.length * lineHeight + padding * 2) / 8) * 8;
  if (height > 8192) {
    throw new Error("This sample exceeds the image test's height limit. Choose a shorter receipt.");
  }
  canvas.width = width;
  canvas.height = height;
  context.fillStyle = "white";
  context.fillRect(0, 0, width, height);
  context.drawImage(logo, (width - logoWidth) / 2, padding, logoWidth, logoHeight);
  context.fillStyle = "black";
  context.strokeStyle = "black";
  context.textBaseline = "top";

  let y = textStart;
  for (const row of rows) {
    if (row.divider) {
      context.beginPath();
      context.moveTo(padding, y + lineHeight / 2);
      context.lineTo(width - padding, y + lineHeight / 2);
      context.stroke();
    } else if (!row.blank) {
      context.font = row.font;
      context.textAlign = "left";
      let x = padding;
      if (row.centered) {
        context.textAlign = "center";
        x = width / 2;
      }
      context.fillText(row.text, x, y);
      if (row.right) {
        context.textAlign = "right";
        context.fillText(row.right, width - padding, y);
      }
    }
    y += lineHeight;
  }

  // Preview and print the same black/white pixels, including the logo and accents.
  const pixels = context.getImageData(0, 0, width, height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const shade = (pixels.data[index] + pixels.data[index + 1] + pixels.data[index + 2]) / 3;
    let color = 255;
    if (shade < 128) {
      color = 0;
    }
    pixels.data[index] = color;
    pixels.data[index + 1] = color;
    pixels.data[index + 2] = color;
    pixels.data[index + 3] = 255;
  }
  context.putImageData(pixels, 0, 0);

  const encoder = new ReceiptPrinterEncoder({ language: "esc-pos", imageMode: mode, newline: "\n" });
  // Image-only initialization needs ESC @; omit the text-mode FS . command
  // which the PC emulator does not support. No text code page is needed here.
  encoder.raw([0x1b, 0x40]);
  encoder.image(canvas, { width, height, mode, algorithm: "threshold", threshold: 128 });
  encoder.newline(3);

  return { bytes: encoder.encode(), dataUrl: canvas.toDataURL("image/png"), width, height, mode };
}
