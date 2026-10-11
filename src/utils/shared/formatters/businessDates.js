export const BUSINESS_TIME_ZONE = "Asia/Manila";

const businessDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const businessHourFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "2-digit",
  hourCycle: "h23",
});

// Return 0-23 in Philippine time, regardless of the device's timezone.
export const getBusinessHour = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return NaN;

  return Number(businessHourFormatter.format(date));
};

export const getBusinessDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = businessDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;
  return `${year}-${month}-${day}`;
};

// Calendar pickers need local Date fields for the Manila date label.
// This is a picker value, not a timestamp to save or send to the API.
export const getBusinessDateForPicker = (value = new Date()) => {
  const dateKey = getBusinessDateKey(value);
  return new Date(`${dateKey}T00:00:00`);
};

export const getBusinessPeriodDates = (period) => {
  if (period === "all") return { fromDate: "", toDate: "" };

  const toDate = getBusinessDateKey(new Date());
  if (period === "today") return { fromDate: toDate, toDate };

  // Use UTC only for calendar arithmetic after obtaining the Manila day.
  const start = new Date(`${toDate}T00:00:00Z`);
  if (period === "week") {
    start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  } else {
    start.setUTCDate(1);
  }

  return { fromDate: start.toISOString().slice(0, 10), toDate };
};

export const getBusinessWeekDates = () => {
  const period = getBusinessPeriodDates("week");
  // Date-label arithmetic only: extend the Manila Sunday through Saturday.
  const end = new Date(`${period.fromDate}T00:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);

  return { fromDate: period.fromDate, toDate: end.toISOString().slice(0, 10) };
};
