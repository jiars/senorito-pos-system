export const employeeStatusOptions = [
  { label: "Active", value: "Active" },
  { label: "Deactivated", value: "Deactivated" },
  { label: "Pending Setup", value: "Pending Setup" },
  { label: "Reset Requested", value: "Reset Requested" },
  { label: "Reset Link Sent", value: "Reset Link Sent" },
];

export const getEmployeeDisplayStatus = (employee, resetRequest) => {
  const accountStatus = String(employee.status || "Active").toLowerCase();
  if (accountStatus !== "active") return "Deactivated";
  if (employee.requires_password_setup) return "Pending Setup";
  if (resetRequest && resetRequest.status === "pending") return "Reset Requested";
  if (resetRequest && resetRequest.status === "approved") return "Reset Link Sent";
  return "Active";
};

const getTimestamp = (value) => {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 0;
  return timestamp;
};

export const getEmployeeRequestMap = (requests) => {
  const requestMap = new Map();
  requests.forEach((request) => {
    const employeeId = String(request.user_id);
    const current = requestMap.get(employeeId);
    // API rows are newest first; do not let an older request replace one.
    if (!current || getTimestamp(request.requested_at) > getTimestamp(current.requested_at)) {
      requestMap.set(employeeId, request);
    }
  });
  return requestMap;
};

export const getEmployeeActivityTime = (employee, resetRequest) => {
  const timestamps = [
    employee.created_at,
    employee.last_system_activity_at,
    employee.last_password_change_at,
  ];
  if (resetRequest) {
    timestamps.push(resetRequest.requested_at, resetRequest.reviewed_at);
  }
  // Ignore logins and expiry deadlines: neither is a management action.
  return Math.max(...timestamps.map(getTimestamp));
};

export const filterAndSortEmployees = (employees, filters, searchTerm, requestMap) => {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEmployees = employees.filter((employee) => {
    let roleName = employee.role_name || "";
    if (employee.role) roleName = employee.role.role_name || roleName;
    const resetRequest = requestMap.get(String(employee.id));
    const status = getEmployeeDisplayStatus(employee, resetRequest);
    const searchableText = [
      employee.first_name, employee.last_name, employee.full_name,
      employee.username, employee.contact_number, employee.contact,
      employee.email, roleName, status,
    ].filter(Boolean).join(" ").toLowerCase();

    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
    const matchesRole = filters.roles.length === 0 || filters.roles.includes(roleName);
    const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(status);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return filteredEmployees.sort((first, second) => {
    const firstTime = getEmployeeActivityTime(first, requestMap.get(String(first.id)));
    const secondTime = getEmployeeActivityTime(second, requestMap.get(String(second.id)));
    if (firstTime !== secondTime) return secondTime - firstTime;
    return String(first.id).localeCompare(String(second.id));
  });
};
