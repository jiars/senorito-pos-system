// Date and Time Formatters for Timestamps and Logs

export const formatDate = (dateString) => {
  if (dateString) {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return 'Unknown Date';
};

export const formatTime = (dateString) => {
  if (dateString) {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  return '';
};

export const formatDateTime = (dateString) => {
  if (dateString) {
    const dateObj = new Date(dateString);

    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return 'Unknown Date';
};
