import { BUSINESS_TIME_ZONE } from "./businessDates";

// Shared business display defaults to Philippine time, not the device timezone.

export const formatDate = (dateString, timeZone = BUSINESS_TIME_ZONE) => {
  if (dateString) {
    const dateObj = new Date(dateString);
    // A date-only value is a calendar label, not an instant to shift between zones.
    let displayTimeZone = timeZone;
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      displayTimeZone = 'UTC';
    }
    return dateObj.toLocaleDateString('en-US', {
      timeZone: displayTimeZone,
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  return 'Unknown Date';
};

export const formatTime = (dateString, timeZone = BUSINESS_TIME_ZONE) => {
  if (dateString) {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleTimeString('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  return '';
};

export const formatDateTime = (dateString, timeZone = BUSINESS_TIME_ZONE) => {
  if (dateString) {
    const dateObj = new Date(dateString);

    return dateObj.toLocaleString('en-US', {
      timeZone,
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
