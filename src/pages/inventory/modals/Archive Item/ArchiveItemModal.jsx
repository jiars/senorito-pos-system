import React, { useEffect, useState } from 'react';

import {
  archiveInventoryItem,
  fetchAffectedMenuItems
} from '../../../../services/inventory/inventoryItemsService';
import ArchiveAffectedRecords from './components/ArchiveAffectedRecords';
import ArchiveItemHeader from './components/ArchiveItemHeader';
import ArchiveItemSummary from './components/ArchiveItemSummary';

import './archiveItemModal.css';

const emptyRecords = { menuItems: [], addons: [] };

const normalizeAffectedRecords = (data) => {
  if (Array.isArray(data)) return { menuItems: data, addons: [] };

  return {
    menuItems: data?.menuItems || data?.menu_items || [],
    addons: data?.addons || []
  };
};

const ArchiveItemModal = ({
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

  const handleArchive = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await archiveInventoryItem(item.id);

      // Refresh every page affected by the archived ingredient.
      const refreshTasks = [];
      if (refetchInventory) refreshTasks.push(refetchInventory());
      if (refreshMenuManagement) {
        refreshTasks.push(refreshMenuManagement());
      }
      if (refreshPosManagement) refreshTasks.push(refreshPosManagement());

      await Promise.all(refreshTasks);
      onClose();
    } catch (error) {
      setApiError(error.message || 'Failed to archive item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="archive-modal-overlay">
      <div className="archive-modal-content">
        <ArchiveItemHeader
          itemName={item.item_name}
          onClose={onClose}
          isSubmitting={isSubmitting}
        />

        <div className="archive-modal-body">
          <ArchiveItemSummary
            item={item}
            totalAffected={totalAffected}
          />

          <hr className="archive-divider" />

          <ArchiveAffectedRecords
            records={records}
            isLoading={isLoadingAffected}
          />

          {totalAffected > 0 && (
            <div className="archive-warning-box">
              <i className="bi bi-exclamation-triangle-fill archive-warning-icon" />
              <p className="archive-warning-text">
                <strong>Warning:</strong> This ingredient is used by{' '}
                {totalAffected} Menu Item or Add-on recipe
                {totalAffected > 1 ? 's' : ''}. Review them after archiving.
              </p>
            </div>
          )}
        </div>

        <div className="archive-modal-footer">
          {apiError && <p className="archive-error-msg">{apiError}</p>}
          <button
            type="button"
            className="archive-btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="archive-btn-confirm"
            onClick={handleArchive}
            disabled={isSubmitting}
          >
            <i className="bi bi-archive" />
            {isSubmitting ? 'Archiving...' : 'Archive Anyway'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveItemModal;
