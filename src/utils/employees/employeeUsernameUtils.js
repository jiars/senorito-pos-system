const toPascalPart = (value) => {
  const cleanValue = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();

  if (!cleanValue) {
    return "";
  }

  return cleanValue
    .split(/\s+/)
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join("");
};

// Build the read-only username preview used by Employee forms.
export const generateEmployeeUsername = (
  roleName,
  firstName,
  lastName,
  employees,
) => {
  if (!roleName || !firstName.trim() || !lastName.trim()) {
    return "";
  }

  const rolePrefix = roleName === "Inventory Clerk" ? "Inventory" : "Cashier";
  const firstNamePart = toPascalPart(firstName);
  const lastNamePart = toPascalPart(lastName).slice(0, 3);
  const baseUsername = `${rolePrefix}_${firstNamePart}_${lastNamePart}`;

  const existingUsernames = employees.map((employee) => {
    return String(employee.username || "").toLowerCase();
  });

  let username = baseUsername;
  let suffix = 2;

  while (existingUsernames.includes(username.toLowerCase())) {
    username = `${baseUsername}_${suffix}`;
    suffix += 1;
  }

  return username;
};
