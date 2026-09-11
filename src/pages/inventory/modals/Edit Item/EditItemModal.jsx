import React, { useEffect, useState } from 'react';

import { updateInventoryItem } from '../../../../services/inventory/inventoryItemsService';
import { validateEditInventoryItem } from '../../../../utils/validation/inventory/editInventoryValidation';
import EditConversionUnitsSection from './components/EditConversionUnitsSection';
import EditInventoryBaseInfo from './components/EditInventoryBaseInfo';

import './editItemModal.css';

const EditItemModal = ({
  isOpen,
  onClose,
  item,
  existingItems = [],
  categories = [],
  refetchInventory
}) => {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [cost, setCost] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [supplier, setSupplier] = useState('');
  const [conversions, setConversions] = useState([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!isOpen || !item) return;

    setName(item.item_name || '');
    setUnit(item.base_unit || '');
    setCategory(item.category_id || '');
    setCost(item.cost_per_unit?.toString() || '');
    setReorderLevel(item.minimum_level?.toString() || '0');
    setSupplier(item.supplier || '');
    setConversions(
      (item.inventory_conversion_units || []).map((conversion) => ({
        id: conversion.id,
        clientId: conversion.id,
        unit: conversion.converted_unit,
        equivalent: conversion.equivalent_base_amount.toString()
      }))
    );
    setHasAttemptedSubmit(false);
    setIsSubmitting(false);
    setApiError('');
  }, [isOpen, item]);

  const { errors, conversionsValid, isFormValid } =
    validateEditInventoryItem({
      name,
      originalName: item?.item_name || '',
      existingItems,
      unit,
      category,
      cost,
      reorderLevel,
      conversions
    });

  const handleAddConversion = () => {
    const clientId = `new-${Date.now()}-${conversions.length}`;

    // New rows have no database ID until Laravel saves them.
    setConversions((current) => [
      ...current,
      { id: null, clientId, unit: '', equivalent: '' }
    ]);
  };

  const handleRemoveConversion = (clientId) => {
    setConversions((current) => (
      current.filter((conversion) => conversion.clientId !== clientId)
    ));
  };

  const handleConversionChange = (clientId, field, value) => {
    setConversions((current) => (
      current.map((conversion) => (
        conversion.clientId === clientId
          ? { ...conversion, [field]: value }
          : conversion
      ))
    ));
  };

  const handleSave = async () => {
    setHasAttemptedSubmit(true);
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      // One nested payload, ready for the Laravel Edit orchestrator.
      const payload = {
        itemData: {
          item_name: name.trim(),
          base_unit: unit,
          category_id: category,
          cost_per_unit: Number(cost),
          minimum_level: Number(reorderLevel),
          supplier: supplier.trim() || null
        },
        conversionsData: conversions.map((conversion) => ({
          ...(conversion.id ? { id: conversion.id } : {}),
          converted_unit: conversion.unit.trim(),
          equivalent_base_amount: Number(conversion.equivalent)
        }))
      };

      await updateInventoryItem(item.id, payload);

      if (refetchInventory) await refetchInventory();
      onClose();
    } catch (error) {
      setApiError(error.message || 'Failed to update inventory item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <div className="edit-modal-header">
          <h3>Edit Item</h3>
          <span className="edit-modal-subtitle">{item.item_name}</span>
          <button
            type="button"
            className="edit-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="bi bi-x" />
          </button>
        </div>

        <div className="edit-modal-body">
          <EditInventoryBaseInfo
            name={name}
            unit={unit}
            category={category}
            setCategory={setCategory}
            cost={cost}
            setCost={setCost}
            reorderLevel={reorderLevel}
            setReorderLevel={setReorderLevel}
            supplier={supplier}
            setSupplier={setSupplier}
            categories={categories}
            hasBatches={(item.inventory_batches || []).length > 0}
            hasAttemptedSubmit={hasAttemptedSubmit}
            errors={errors}
          />

          <hr className="edit-modal-divider" />

          <EditConversionUnitsSection
            conversions={conversions}
            unit={unit}
            hasAttemptedSubmit={hasAttemptedSubmit}
            onAdd={handleAddConversion}
            onRemove={handleRemoveConversion}
            onChange={handleConversionChange}
          />
        </div>

        {hasAttemptedSubmit && (!isFormValid || !conversionsValid) && (
          <div className="edit-modal-form-error">
            Please fill in all required fields (*)
          </div>
        )}

        <div className="edit-modal-footer">
          {apiError && (
            <p className="edit-modal-error-msg edit-modal-api-error">
              {apiError}
            </p>
          )}
          <button
            type="button"
            className="edit-btn-cancel"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="edit-btn-save"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditItemModal;
