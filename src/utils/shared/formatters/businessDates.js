const businessDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const getBusinessDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const parts = businessDateFormatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;
  return `${year}-${month}-${day}`;
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
