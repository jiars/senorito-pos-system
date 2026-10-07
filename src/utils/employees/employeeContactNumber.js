// Display the national number beside +63; retain 09 format in current payloads.
export const getNationalMobileNumber = (value) => {
  let number = String(value || "").replace(/[\s()-]/g, "");
  if (number.startsWith("+63")) number = number.slice(3);
  else if (number.length === 12 && number.startsWith("63")) number = number.slice(2);
  if (number.startsWith("0")) number = number.slice(1);
  return number;
};

export const normalizeEmployeeContactInput = (value) => {
  const number = getNationalMobileNumber(value);
  if (!/^\d{0,10}$/.test(number)) return null;
  if (!number) return "";
  return `0${number}`;
};

export const isValidEmployeeContactNumber = (value) => {
  return /^09\d{9}$/.test(String(value || ""));
};

export const formatEmployeeContactNumber = (value) => {
  const number = getNationalMobileNumber(value);
  if (number.length <= 3) return number;
  if (number.length <= 7) return `${number.slice(0, 3)}-${number.slice(3)}`;
  return `${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`;
};

// Restore the cursor by digit position, ignoring display-only separators.
export const getEmployeeContactCaret = (formattedNumber, digitCount) => {
  let position = 0;
  let digits = 0;
  while (position < formattedNumber.length && digits < digitCount) {
    if (/\d/.test(formattedNumber[position])) digits += 1;
    position += 1;
  }
  if (formattedNumber[position] === "-") position += 1;
  return position;
};
