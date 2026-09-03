import React, { useState, useEffect } from 'react';

import { QRCodeSVG } from 'qrcode.react';
import { Checkbox } from '../../../../components/ui/Checkbox/Checkbox';
import { supabase } from '../../../../services/supabaseClient';

import './printQRCodeModal.css';

const PrintQRCodeModal = ({ isOpen, onClose, selectedItems = [] }) => {
  const [selectedQRIds, setSelectedQRIds] = useState([]);

  // For batches
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  // Sync internal checkbox state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Auto-select items by default
      const itemIds = selectedItems.map(item => item.id);
      setSelectedQRIds(itemIds);
    }
  }, [isOpen, selectedItems]);

  // Fetch batches when modal opens
  useEffect(() => {
    if (isOpen && selectedItems.length > 0) {
      const fetchBatches = async () => {
        setIsLoadingBatches(true);
        try {
          const itemIds = selectedItems.map(item => item.id);
          const { data, error } = await supabase
            .from('inventory_batches')
            .select(`
              *,
              inventory_items (
                item_code,
                item_name,
                base_unit
              )
            `)
            .in('inventory_item_id', itemIds)
            .gt('quantity', 0)
            .order('expiration_date', { ascending: true });

          if (error) throw error;
          setBatches(data || []);
        } catch (err) {
          console.error("Error fetching batches for QR:", err);
        } finally {
          setIsLoadingBatches(false);
        }
      };
      fetchBatches();
    }
  }, [isOpen, selectedItems]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    setSelectedQRIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAllItems = () => {
    const itemIds = selectedItems.map(i => i.id);
    const allSelected = itemIds.every(id => selectedQRIds.includes(id));
    if (allSelected) {
      setSelectedQRIds(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      setSelectedQRIds(prev => [...new Set([...prev, ...itemIds])]);
    }
  };

  const toggleSelectAllBatches = () => {
    const batchIds = batches.map(b => b.id);
    const allSelected = batchIds.every(id => selectedQRIds.includes(id));
    if (allSelected) {
      setSelectedQRIds(prev => prev.filter(id => !batchIds.includes(id)));
    } else {
      setSelectedQRIds(prev => [...new Set([...prev, ...batchIds])]);
    }
  };

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'No Expiry';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="qr-modal-overlay">
      <div className="qr-modal-content">
        <div className="qr-modal-header hide-on-print">
          <h3>Print QR Codes</h3>
          <button className="qr-modal-close" onClick={onClose} title="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="qr-modal-body">
          {/* Shelf Tags Section */}
          <div className="qr-section-header hide-on-print">
            <h4 style={{ margin: 0, color: '#2C1810', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-box-seam"></i> Shelf Tags
            </h4>
            <div className="qr-select-all">
              <Checkbox
                checked={selectedItems.length > 0 && selectedItems.every(i => selectedQRIds.includes(i.id))}
                onChange={toggleSelectAllItems}
              />
              <span style={{ marginLeft: '6px', fontSize: '0.85rem', color: '#6c757d' }}>Select All</span>
            </div>
          </div>

          <div className="qr-card-grid hide-on-print">
            {selectedItems.map((item) => {
              const qrPayload = `${window.location.origin}/inventory?action=view_item&id=${item.id}`;
              const isSelected = selectedQRIds.includes(item.id);

              return (
                <div key={item.id} className={`qr-card ${isSelected ? 'qr-card--selected' : ''}`}>
                  <div className="qr-card-checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </div>

                  <div className="qr-code-wrapper">
                    <QRCodeSVG value={qrPayload} size={80} level="M" />
                  </div>

                  <div className="qr-card-details">
                    <h4 className="qr-card-title">{item.item_name}</h4>
                    <p className="qr-card-primary">{item.item_code}</p>
                    <p className="qr-card-secondary">Shelf Tag</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div className="qr-divider hide-on-print"></div>

          {/* Batches Section */}
          <div className="qr-section-header hide-on-print">
            <h4 style={{ margin: 0, color: '#2C1810', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="bi bi-boxes"></i> Box Stickers (Batches)
            </h4>
            {batches.length > 0 && (
              <div className="qr-select-all">
                <Checkbox
                  checked={batches.length > 0 && batches.every(b => selectedQRIds.includes(b.id))}
                  onChange={toggleSelectAllBatches}
                />
                <span style={{ marginLeft: '6px', fontSize: '0.85rem', color: '#6c757d' }}>Select All</span>
              </div>
            )}
          </div>

          <div className="qr-card-grid hide-on-print">
            {isLoadingBatches && (
              <div className="qr-loading">Loading batches...</div>
            )}

            {!isLoadingBatches && batches.length === 0 && (
              <div className="qr-loading">No active batches found for the selected items.</div>
            )}

            {!isLoadingBatches && batches.map((batch) => {
              const qrPayload = `${window.location.origin}/inventory?action=view_batch&id=${batch.id}&item_id=${batch.inventory_item_id}`;
              const isSelected = selectedQRIds.includes(batch.id);

              return (
                <div key={batch.id} className={`qr-card ${isSelected ? 'qr-card--selected' : ''}`}>
                  <div className="qr-card-checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(batch.id)}
                    />
                  </div>

                  <div className="qr-code-wrapper">
                    <QRCodeSVG value={qrPayload} size={80} level="M" />
                  </div>

                  <div className="qr-card-details">
                    <h4 className="qr-card-title">{batch.inventory_items?.item_name}</h4>
                    <p className="qr-card-primary">#{batch.batch_number || '-'}</p>
                    <p className="qr-card-secondary">EXP: {formatDate(batch.expiration_date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="qr-modal-footer hide-on-print">
          <button className="qr-modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="qr-modal-btn-print"
            disabled={selectedQRIds.length === 0}
            onClick={() => window.print()}
          >
            <i className="bi bi-printer"></i> Print Selected
          </button>
        </div>

        {/* =========================================
            HIDDEN PRINT-ONLY LAYOUT (Rule #8)
            ========================================= */}
        <div className="print-only-layout">
          <div className="print-qr-header-container">
            <div className="print-qr-title-row">
              <h2>Inventory QR Labels</h2>
              <div className="print-qr-meta">
                <span className="print-brand">SEÑORITO CAFÉ</span>
                <span className="print-date">Generated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="print-period">Total Labels: {selectedQRIds.length}</span>
              </div>
            </div>
          </div>

          <div className="print-qr-grid-container">
            {selectedItems.filter(i => selectedQRIds.includes(i.id)).map((item) => (
              <div key={item.id} className="print-qr-card">
                <QRCodeSVG value={`${window.location.origin}/inventory?action=view_item&id=${item.id}`} size={110} level="M" />
                <div className="print-qr-details">
                  <h4>{item.item_name}</h4>
                  <p className="qr-print-primary">{item.item_code}</p>
                  <p className="qr-print-secondary">Shelf Tag</p>
                </div>
              </div>
            ))}

            {batches.filter(b => selectedQRIds.includes(b.id)).map((batch) => (
              <div key={batch.id} className="print-qr-card">
                <QRCodeSVG value={`${window.location.origin}/inventory?action=view_batch&id=${batch.id}&item_id=${batch.inventory_item_id}`} size={110} level="M" />
                <div className="print-qr-details">
                  <h4>{batch.inventory_items?.item_name}</h4>
                  <p className="qr-print-primary">#{batch.batch_number || '-'}</p>
                  <p className="qr-print-secondary">EXP: {formatDate(batch.expiration_date)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="print-footer">
             Señorito Café — Point of Sale & Inventory Management System | QR Labels | Generated {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrintQRCodeModal;
