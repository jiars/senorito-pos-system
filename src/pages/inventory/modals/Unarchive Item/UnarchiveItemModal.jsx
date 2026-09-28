import React, { useEffect, useState } from 'react';

import {
  fetchAffectedMenuItems,
  unarchiveInventoryItem
} from '../../../../services/inventory/inventoryItemsService';
import UnarchiveAffectedRecords from './components/UnarchiveAffectedRecords';
import UnarchiveItemHeader from './components/UnarchiveItemHeader';
import UnarchiveItemSummary from './components/UnarchiveItemSummary';

import './unarchiveItemModal.css';

const emptyRecords = { menuItems: [], addons: [] };

const normalizeAffectedRecords = (data) => {
  if (Array.isArray(data)) return { menuItems: data, addons: [] };

  return {
    menuItems: data?.menuItems || data?.menu_items || [],
    addons: data?.addons || []
  };
};

const UnarchiveItemModal = ({
  isOpen,
  onClose,
  item,
  refetchInventory,
  refreshMenuManagement,
  refreshPosManagement
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [records, setRecords] = useState(emptyRecords);
  const [isLoadingAffected, setIsLoadingAffected] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) return;

    let isCurrent = true;
    setApiError('');
    setRecords(emptyRecords);
    setIsLoadingAffected(true);

    const loadAffectedRecords = async () => {
      try {
        const data = await fetchAffectedMenuItems(item.id);
        if (isCurrent) setRecords(normalizeAffectedRecords(data));
      } catch (error) {
        console.error('Failed to load affected records:', error);
      } finally {
        if (isCurrent) setIsLoadingAffected(false);
      }
    };

    loadAffectedRecords();

    return () => {
      isCurrent = false;
    };
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const totalAffected =
    records.menuItems.length + records.addons.length;

  const handleUnarchive = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await unarchiveInventoryItem(item.id);

      // Refresh every page affected by the restored ingredient.
      const refreshTasks = [];
      if (refetchInventory) refreshTasks.push(refetchInventory());
      if (refreshMenuManagement) {
        refreshTasks.push(refreshMenuManagement());
      }
      if (refreshPosManagement) refreshTasks.push(refreshPosManagement());

      await Promise.all(refreshTasks);
      onClose();
    } catch (error) {
      setApiError(error.message || 'Failed to unarchive item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="unarchive-modal-overlay">
      <div className="unarchive-modal-content">
        <UnarchiveItemHeader
          itemName={item.item_name}
          onClose={onClose}
          isSubmitting={isSubmitting}
        />

        <div className="unarchive-modal-body">
          <UnarchiveItemSummary
            item={item}
            totalAffected={totalAffected}
          />

          <hr className="unarchive-divider" />

          <UnarchiveAffectedRecords
            records={records}
            isLoading={isLoadingAffected}
          />

          <div className="unarchive-warning-box">
            <i className="bi bi-info-circle-fill unarchive-warning-icon" />
            <p className="unarchive-warning-text">
              This item will return to active Inventory. Review its stock and
              expiry details after restoring it.
            </p>
          </div>
        </div>

        <div className="unarchive-modal-footer">
          {apiError && <p className="unarchive-error-msg">{apiError}</p>}
          <button
            type="button"
            className="unarchive-btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="unarchive-btn-confirm"
            onClick={handleUnarchive}
            disabled={isSubmitting}
          >
            <i className="bi bi-box-arrow-up" />
            {isSubmitting ? 'Unarchiving...' : 'Unarchive'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnarchiveItemModal;
