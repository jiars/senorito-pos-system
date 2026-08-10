import React, { useState, useEffect } from 'react';

import { QRCodeSVG } from 'qrcode.react';
import { Checkbox } from '../../../../components/ui/Checkbox/Checkbox';
import { supabase } from '../../../../services/supabaseClient';

import './printQRCodeModal.css';

const PrintQRCodeModal = ({ isOpen, onClose, selectedItems = [] }) => {
  const [mode, setMode] = useState('item'); // 'item' or 'batch'
  const [selectedQRIds, setSelectedQRIds] = useState([]);

  // For batch mode
  const [batches, setBatches] = useState([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);

  // Sync internal checkbox state when modal opens or mode changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'item') {
        setSelectedQRIds(selectedItems.map(item => item.id));
      } else {
        // We will select all batches by default once they load
        setSelectedQRIds(batches.map(b => b.id));
      }
    }
  }, [isOpen, selectedItems, mode, batches]);

  // Fetch batches when switching to batch mode
  useEffect(() => {
    if (isOpen && mode === 'batch' && selectedItems.length > 0) {
      const fetchBatches = async () => {
        setIsLoadingBatches(true);
        try {
          const itemIds = selectedItems.map(item => item.id);
          const { data, error } = await supabase
            .from('inventory_batches')
            .select(`
              *,
              inventory_items (
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
  }, [isOpen, mode, selectedItems]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    setSelectedQRIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const targetList = mode === 'item' ? selectedItems : batches;
    if (selectedQRIds.length === targetList.length && targetList.length > 0) {
      setSelectedQRIds([]);
    } else {
      setSelectedQRIds(targetList.map(t => t.id));
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
          <div>
            <h3>Print QR Codes</h3>
            <div className="qr-mode-toggle">
              <button
                className={`qr-mode-btn ${mode === 'item' ? 'active' : ''}`}
                onClick={() => setMode('item')}
              >
                <i className="bi bi-box-seam"></i> Shelf Tags (Items)
              </button>
              <button
                className={`qr-mode-btn ${mode === 'batch' ? 'active' : ''}`}
                onClick={() => setMode('batch')}
              >
                <i className="bi bi-boxes"></i> Box Stickers (Batches)
              </button>
            </div>
          </div>
          <button className="qr-modal-close" onClick={onClose} title="Close">
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="qr-modal-body">
          {/* Select All Checkbox - Hide on Print */}
          <div className="qr-select-all hide-on-print">
            <Checkbox
              checked={
                mode === 'item'
                  ? (selectedQRIds.length === selectedItems.length && selectedItems.length > 0)
                  : (selectedQRIds.length === batches.length && batches.length > 0)
              }
              onChange={toggleSelectAll}
            />
            <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: '#6c757d', fontWeight: '500' }}>
              Select All {mode === 'item' ? 'Items' : 'Batches'}
            </span>
          </div>

          <div className="qr-card-grid">
            {mode === 'item' && selectedItems.map((item) => {
              const qrPayload = JSON.stringify({ type: 'item', id: item.id });
              const isSelected = selectedQRIds.includes(item.id);

              return (
                <div key={item.id} className={`qr-card ${isSelected ? 'qr-card--selected' : ''}`}>
                  <div className="qr-card-checkbox hide-on-print">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                    />
                  </div>

                  <div className="qr-code-wrapper">
                    <QRCodeSVG value={qrPayload} size={110} level="M" />
                  </div>

                  <div className="qr-card-details">
                    <h4 className="qr-card-title">{item.item_name}</h4>
                    <p className="qr-card-subtitle">Shelf Tag</p>
                  </div>
                </div>
              );
            })}

            {mode === 'batch' && isLoadingBatches && (
              <div className="qr-loading">Loading batches...</div>
            )}

            {mode === 'batch' && !isLoadingBatches && batches.length === 0 && (
              <div className="qr-loading">No active batches found for the selected items.</div>
            )}

            {mode === 'batch' && !isLoadingBatches && batches.map((batch) => {
              const qrPayload = JSON.stringify({ type: 'batch', id: batch.id, item_id: batch.inventory_item_id });
              const isSelected = selectedQRIds.includes(batch.id);

              return (
                <div key={batch.id} className={`qr-card ${isSelected ? 'qr-card--selected' : ''}`}>
                  <div className="qr-card-checkbox hide-on-print">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelect(batch.id)}
                    />
                  </div>

                  <div className="qr-code-wrapper">
                    <QRCodeSVG value={qrPayload} size={110} level="M" />
                  </div>

                  <div className="qr-card-details">
                    <h4 className="qr-card-title">{batch.inventory_items?.item_name}</h4>
                    <p className="qr-card-batch">Batch: {batch.batch_number}</p>
                    <p className="qr-card-expiry">EXP: {formatDate(batch.expiration_date)}</p>
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
      </div>
    </div>
  );
};

export default PrintQRCodeModal;
