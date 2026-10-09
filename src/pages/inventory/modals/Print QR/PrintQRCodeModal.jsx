import { useState } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import Modal from "@/components/modals/Modal";
import ModalHeader from "@/components/modals/ModalHeader";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  getInventoryItemQrUrl,
  getInventoryQrLogoSettings,
  getInventoryQrPrintSheets,
} from "@/utils/inventory/inventoryQr";
import "./printQRCodeModal.css";

const PrintQRCodeModalContent = ({ onClose, selectedItems = [] }) => {
  const [selectedQRIds, setSelectedQRIds] = useState(() => {
    return selectedItems.map((item) => item.id);
  });

  const toggleSelect = (id) => {
    setSelectedQRIds((currentIds) => {
      if (currentIds.includes(id)) return currentIds.filter((itemId) => itemId !== id);
      return [...currentIds, id];
    });
  };
  const toggleSelectAllItems = () => {
    if (selectedItems.every((item) => selectedQRIds.includes(item.id))) {
      setSelectedQRIds([]);
    } else {
      setSelectedQRIds(selectedItems.map((item) => item.id));
    }
  };
  const qrItems = selectedItems.map((item) => {
    return { ...item, qrUrl: getInventoryItemQrUrl(item.id, window.location.origin) };
  });
  const printItems = qrItems.filter((item) => selectedQRIds.includes(item.id));
  const printSheets = getInventoryQrPrintSheets(printItems);

  return (
    <>
      <Modal isOpen onClose={onClose} maxWidth="40rem" maxHeight="min(90svh, 46rem)">
        <ModalHeader title="Print Item QR" description="Scan a label to open its Restock form." iconClassName="bi bi-qr-code" />
        <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
          <ModalContent>
            <div className="flex flex-wrap items-center justify-between gap-[var(--app-space-2)]">
              <span className="text-[length:var(--app-font-size-body-secondary)] font-semibold">{printItems.length} selected</span>
              <label className="flex min-h-[var(--app-touch-target-min)] cursor-pointer items-center gap-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)]">
                <Checkbox checked={selectedItems.length > 0 && selectedItems.every((item) => selectedQRIds.includes(item.id))} onCheckedChange={toggleSelectAllItems} disabled={selectedItems.length === 0} />
                Select all
              </label>
            </div>
            <section aria-label="Inventory item labels" className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-3">
              {qrItems.map((item) => {
                const isSelected = selectedQRIds.includes(item.id);
                return (
                  <label key={item.id} className={`flex min-w-0 cursor-pointer flex-col gap-[var(--app-gap-related)] rounded-[var(--app-radius-nested)] border p-[var(--app-space-4)] ${isSelected ? "border-[var(--app-color-brand)] bg-[var(--app-color-surface-soft)]" : "border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)]"}`}>
                    <div className="flex min-h-[var(--app-touch-target-min)] items-center justify-between gap-[var(--app-space-2)]">
                      <span className="min-w-0 break-words text-[length:var(--app-font-size-body-secondary)] font-semibold leading-[var(--app-line-height-body-secondary)]">{item.item_name}</span>
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(item.id)} aria-label={`Print label for ${item.item_name}`} />
                    </div>
                    <div className="flex flex-col items-center gap-[var(--app-space-2)]">
                      <div className="rounded-[var(--app-radius-nested)] bg-white p-[var(--app-space-2)]">
                        <QRCodeSVG
                          className="[&_image]:[clip-path:circle(50%)_fill-box]"
                          value={item.qrUrl}
                          size={96}
                          marginSize={4}
                          level="H"
                          imageSettings={getInventoryQrLogoSettings(96)}
                        />
                      </div>
                      <span className="text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">{item.item_code}</span>
                    </div>
                  </label>
                );
              })}
            </section>
            {qrItems.length === 0 && <p className="text-[length:var(--app-font-size-body-secondary)] text-[var(--app-color-text-muted)]">No inventory items selected.</p>}
          </ModalContent>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} className="min-h-[var(--app-touch-target-min)] text-[length:var(--app-font-size-body-secondary)]">Cancel</Button>
          <Button type="button" disabled={printItems.length === 0} onClick={() => window.print()} className="min-h-[var(--app-touch-target-min)] bg-[var(--app-color-brand)] text-[length:var(--app-font-size-body-secondary)] text-white hover:bg-[var(--app-color-brand-hover)]">
            <i className="bi bi-printer" aria-hidden="true" /> Print Selected
          </Button>
        </ModalFooter>
      </Modal>
      {printItems.length > 0 && createPortal(
        <div className="inventory-qr-print-root" aria-hidden="true">
          {/* Scope page settings to the mounted print copy, not other reports. */}
          <style media="print">{"@page { size: letter portrait; margin: 0; }"}</style>
          {printSheets.map((sheet, pageIndex) => (
            <section key={pageIndex} className="inventory-qr-print-sheet">
              <header className="inventory-qr-print-header">
                <h1>Inventory QR Labels</h1>
                <p>Señorito Café · {printItems.length} labels · Page {pageIndex + 1} of {printSheets.length}</p>
              </header>
              <div className="inventory-qr-print-grid">
                {sheet.map((item) => (
                  <article key={item.id} className="inventory-qr-print-label">
                    <QRCodeSVG
                      className="[&_image]:[clip-path:circle(50%)_fill-box]"
                      value={item.qrUrl}
                      size={128}
                      marginSize={4}
                      level="H"
                      imageSettings={getInventoryQrLogoSettings(128)}
                    />
                    <h2>{item.item_name}</h2>
                    <p>{item.item_code}</p>
                    <p>Scan to restock</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>, document.body,
      )}
    </>
  );
};

const PrintQRCodeModal = (props) => {
  if (!props.isOpen) return null;
  return <PrintQRCodeModalContent {...props} />;
};

export default PrintQRCodeModal;
