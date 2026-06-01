import React, { useState, useEffect } from 'react';
import { Checkbox } from '../../../../components/ui/Checkbox/Checkbox';
import './printQRCodeModal.css';

const PrintQRCodeModal = ({ isOpen, onClose, selectedItems = [] }) => {
  const [selectedQRItems, setSelectedQRItems] = useState([]);

  // Sync internal checkbox state with the passed items when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedQRItems(selectedItems.map(item => item.id));
    }
  }, [isOpen, selectedItems]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    setSelectedQRItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal-content">
        <div className="qr-modal-header">
          <h3>Print QR Codes</h3>
          <button className="qr-modal-close" onClick={onClose} title="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="qr-modal-body">
          <div className="qr-card-grid">
            {selectedItems.map((item) => {
              // Creating a safe QR data string using item properties
              const qrData = encodeURIComponent(`${item.name}-${item.id}`);
              const isSelected = selectedQRItems.includes(item.id);

              return (
                <div key={item.id} className={`qr-card ${isSelected ? 'qr-card--selected' : ''}`}>
                  <div className="qr-card-checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </div>
                  
                  {/* Using a placeholder QR code generator API for realistic visual representation */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`}
                    alt={`QR Code for ${item.name}`}
                    className="qr-card-image"
                  />
                  
                  <div className="qr-card-details">
                    <h4 className="qr-card-title">{item.name}</h4>
                    <p className="qr-card-unit">{item.qty} {item.unit}</p>
                    <p className="qr-card-batch">Batch # {item.id}</p>
                    {item.expiryDate && (
                      <p className="qr-card-expiry">
                        Expiration date: {item.expiryDate}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="qr-modal-footer">
          <button className="qr-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="qr-modal-btn-print"
            disabled={selectedQRItems.length === 0}
            onClick={() => {
              window.print();
              onClose();
            }}
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrintQRCodeModal;
