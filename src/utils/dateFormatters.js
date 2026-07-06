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
