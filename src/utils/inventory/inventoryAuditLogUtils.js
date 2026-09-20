import * as XLSX from 'xlsx';

export const getAuditItem = (log) => {
  if (log.inventory_item) return log.inventory_item;
  if (log.inventory_items) return log.inventory_items;
  return null;
};

export const getAuditBatch = (log) => {
  if (log.inventory_batch) return log.inventory_batch;
  if (log.inventory_batches) return log.inventory_batches;
  return null;
};

export const getAuditPerformer = (log) => {
  if (log.performer) return log.performer;
  if (log.profiles) return log.profiles;
  return null;
};

export const getAuditActionClass = (action) => {
  if (action === 'Wastage') return 'audit-chip--red';
  if (action === 'Purchase') return 'audit-chip--green';
  return 'audit-chip--teal';
};

export const getAuditSourceClass = (source) => {
  if (source === 'Stock Log Modal') return 'audit-chip--yellow';
  if (source === 'Purchase Order') return 'audit-chip--green';
  return 'audit-chip--teal';
};

export const getAuditChangeClass = (change) => {
  if (Number(change) > 0) return 'audit-change-positive';
  if (Number(change) < 0) return 'audit-change-negative';
  return '';
};

export const formatAuditLog = (log) => {
  const item = getAuditItem(log);
  const batch = getAuditBatch(log);
  const performer = getAuditPerformer(log);
  const logDate = new Date(log.created_at);
  const unit = item ? item.base_unit || '' : '';
  const quantityChange = Number(log.quantity_change);

  let performerName = 'System';
  if (performer) {
    performerName = `${performer.first_name || ''} ${performer.last_name || ''}`.trim();
  }

  return {
    date: logDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    time: logDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }),
    itemName: item ? item.item_name || 'Unknown Item' : 'Unknown Item',
    action: log.action,
    source: log.source,
    change: quantityChange > 0
      ? `+${quantityChange} ${unit}`
      : `${quantityChange} ${unit}`,
    before: log.stock_before,
    after: log.stock_after,
    batchNumber: batch ? batch.batch_number || '-' : '-',
    reason: log.reason_reference || '-',
    reference: log.log_number || '-',
    performerName,
  };
};

export const filterInventoryAuditLogs = (logs, filters) => {
  return logs.filter((log) => {
    const formattedLog = formatAuditLog(log);
    const searchTerm = filters.searchTerm.trim().toLowerCase();
    const selectedRecordedBy = filters.recordedBy || [];
    const selectedReasons = filters.reasons || [];
    const selectedSources = filters.sources || [];

    if (searchTerm) {
      const searchableText = [
        formattedLog.itemName,
        formattedLog.reason,
        formattedLog.source,
        formattedLog.batchNumber,
        formattedLog.reference,
      ].join(' ').toLowerCase();

      if (!searchableText.includes(searchTerm)) return false;
    }

    const logDate = new Date(log.created_at);

    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      fromDate.setHours(0, 0, 0, 0);
      if (logDate < fromDate) return false;
    }

    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      toDate.setHours(23, 59, 59, 999);
      if (logDate > toDate) return false;
    }

    if (
      selectedRecordedBy.length > 0 &&
      !selectedRecordedBy.includes(formattedLog.performerName)
    ) return false;

    if (
      selectedReasons.length > 0 &&
      !selectedReasons.some((reason) =>
        formattedLog.reason.toLowerCase().includes(reason.toLowerCase()),
      )
    ) return false;

    if (
      selectedSources.length > 0 &&
      !selectedSources.includes(formattedLog.source)
    ) return false;

    return true;
  });
};

export const exportInventoryAuditLogs = (logs) => {
  const workbook = XLSX.utils.book_new();

  const createExportRow = (log) => {
    const row = formatAuditLog(log);

    return {
      'Date & Time': `${row.date} ${row.time}`,
      Item: row.itemName,
      Action: row.action,
      Source: row.source,
      Change: row.change,
      Before: row.before,
      After: row.after,
      'Batch Number': row.batchNumber,
      'Reason / Remarks': row.reason,
      Reference: row.reference,
      'Processed By': row.performerName,
    };
  };

  const columnWidths = [
    { wch: 22 }, { wch: 30 }, { wch: 18 }, { wch: 15 },
    { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 18 },
    { wch: 30 }, { wch: 18 }, { wch: 20 },
  ];

  const allRows = logs.map(createExportRow);
  const allSheet = XLSX.utils.json_to_sheet(allRows);
  allSheet['!cols'] = columnWidths;
  XLSX.utils.book_append_sheet(workbook, allSheet, 'All Logs');

  const uniqueActions = [...new Set(logs.map((log) => log.action))];

  uniqueActions.forEach((action) => {
    const actionRows = logs
      .filter((log) => log.action === action)
      .map(createExportRow);

    const actionSheet = XLSX.utils.json_to_sheet(actionRows);
    actionSheet['!cols'] = columnWidths;

    // Excel does not allow these characters in worksheet names.
    const invalidSheetCharacters = ['\\', '/', '*', '?', ':', '[', ']'];
    const safeName = invalidSheetCharacters
      .reduce((name, character) => name.replaceAll(character, ''), action)
      .substring(0, 31);
    XLSX.utils.book_append_sheet(workbook, actionSheet, safeName || 'Other');
  });

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Inventory_Audit_Log_${today}.xlsx`);
};
