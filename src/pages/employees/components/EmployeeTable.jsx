import { createContext, useContext, useEffect, useMemo, useState } from "react";

import DataTable from "@/components/data-table/DataTable";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import FilterOptionGroup from "@/components/filters/FilterOptionGroup";
import FilterPopover from "@/components/filters/FilterPopover";
import ToolbarSearchInput from "@/components/filters/ToolbarSearchInput";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ResendSetupLinkModal from "../modals/Resend Setup Link/ResendSetupLinkModal";

import EmployeeActionsMenu from "./EmployeeActionsMenu";

const EmployeeActionContext = createContext(null);

// A stable cell component keeps its dropdown mounted while the cooldown ticks.
const EmployeeActionCell = ({ row }) => {
  const actions = useContext(EmployeeActionContext);
  const employee = row.original;
  const cooldown = Math.max(0, Math.ceil(
    ((actions.cooldownEndsAtByEmployee[String(employee.id)] || 0) - actions.cooldownClock) / 1000,
  ));
  return (
    <EmployeeActionsMenu
      employee={employee}
      resetRequest={actions.requestByEmployeeId.get(String(employee.id))}
      onEdit={actions.onEdit}
      onChangeStatus={actions.onChangeStatus}
      onReviewPasswordRequest={actions.onReviewPasswordRequest}
      onResendSetupLink={actions.onResendSetupLink}
      cooldown={cooldown}
    />
  );
};

const statusOptions = [
  { label: "Active", value: "Active" },
  { label: "Deactivated", value: "Deactivated" },
];

const getEmployeeDisplayStatus = (employee, resetRequest) => {
  const accountStatus = String(employee.status || "Active").toLowerCase();

  if (accountStatus !== "active") return "Deactivated";
  if (employee.requires_password_setup) return "Pending Setup";
  if (resetRequest?.status === "pending") return "Reset Requested";
  if (resetRequest?.status === "approved") return "Reset Link Sent";

  return "Active";
};

const getStatusClassName = (status) => {
  if (status === "Deactivated")
    return "bg-[var(--app-color-danger-surface)] text-[var(--app-color-danger)]";

  if (status === "Pending Setup" || status === "Reset Requested")
    return "bg-[var(--app-color-warning-surface)] text-[var(--app-color-warning)]";

  return "bg-[var(--app-color-success-surface)] text-[var(--app-color-success)]";
};

const EmployeeTableToolbar = ({
  searchTerm,
  roles,
  filters,
  isLoading,
  onSearchChange,
  onApplyFilters,
}) => {
  const [draftFilters, setDraftFilters] = useState(filters);
  const roleOptions = roles.map((role) => ({
    label: role.role_name,
    value: role.role_name,
  }));

  const clearFilters = () => {
    const clearedFilters = { roles: [], statuses: [] };
    setDraftFilters(clearedFilters);
    onApplyFilters(clearedFilters);
  };

  if (isLoading) {
    return (
      <div className="flex w-full flex-wrap justify-end gap-[var(--app-space-2)]">
        <Skeleton className="h-[var(--app-touch-target-min)] w-full rounded-[var(--app-radius-control)] sm:w-[22rem]" />
        <Skeleton className="h-[var(--app-touch-target-min)] w-28 rounded-[var(--app-radius-control)]" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-end gap-[var(--app-space-2)]">
      <div className="w-full sm:w-[22rem]">
        <ToolbarSearchInput
          placeholder="Search employee, username, email..."
          value={searchTerm}
          onValueChange={onSearchChange}
        />
      </div>

      <FilterPopover
        onApply={() => onApplyFilters(draftFilters)}
        onClear={clearFilters}
        maxWidth="18rem"
        maxHeight="min(30rem, calc(100svh - 8rem))"
      >
        <FilterOptionGroup
          id="employee-table-roles"
          label="Roles"
          options={roleOptions}
          selectedValues={draftFilters.roles}
          onSelectedValuesChange={(nextRoles) =>
            setDraftFilters((current) => ({
              ...current,
              roles: nextRoles,
            }))
          }
          defaultOpen
        />

        <FilterOptionGroup
          id="employee-table-statuses"
          label="Status"
          options={statusOptions}
          selectedValues={draftFilters.statuses}
          onSelectedValuesChange={(nextStatuses) =>
            setDraftFilters((current) => ({
              ...current,
              statuses: nextStatuses,
            }))
          }
          defaultOpen
        />
      </FilterPopover>
    </div>
  );
};

const EmployeeTable = ({
  employees,
  roles,
  passwordResetRequests,
  isLoading,
  error,
  onEdit,
  onChangeStatus,
  onReviewPasswordRequest,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ roles: [], statuses: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [cooldownEndsAtByEmployee, setCooldownEndsAtByEmployee] = useState({});
  const [cooldownClock, setCooldownClock] = useState(() => Date.now());
  const [setupLinkEmployee, setSetupLinkEmployee] = useState(null);
  const setupLinkCooldown = Math.max(0, Math.ceil(
    ((cooldownEndsAtByEmployee[String(setupLinkEmployee?.id)] || 0) - cooldownClock) / 1000,
  ));

  const hasActiveCooldown = Object.values(cooldownEndsAtByEmployee).some(
    (endsAt) => endsAt > cooldownClock,
  );

  useEffect(() => {
    if (!hasActiveCooldown) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setCooldownClock(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [hasActiveCooldown]);

  const handleCooldownStart = (employeeId, seconds) => {
    const duration = Math.max(0, Number(seconds) || 0);
    const endsAt = Date.now() + duration * 1000;

    setCooldownEndsAtByEmployee((current) => ({
      ...current,
      [String(employeeId)]: endsAt,
    }));
    setCooldownClock(Date.now());
  };

  const requestByEmployeeId = useMemo(
    () =>
      new Map(
        passwordResetRequests.map((request) => [
          String(request.user_id),
          request,
        ]),
      ),
    [passwordResetRequests],
  );

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return employees.filter((employee) => {
      const roleName = employee.role?.role_name || employee.role_name || "";
      const status = employee.status || "Active";
      const searchableText = [
        employee.first_name,
        employee.last_name,
        employee.full_name,
        employee.username,
        employee.contact_number,
        employee.contact,
        employee.email,
        roleName,
        status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        normalizedSearch === "" || searchableText.includes(normalizedSearch);
      const matchesRole =
        filters.roles.length === 0 || filters.roles.includes(roleName);
      const matchesStatus =
        filters.statuses.length === 0 || filters.statuses.includes(status);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, filters, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / pageSize),
  );
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedEmployees = filteredEmployees.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize,
  );

  const columns = useMemo(
    () => [
      {
        id: "fullName",
        header: "Full Name",
        meta: { width: "12rem" },
        cell: ({ row }) => {
          const employee = row.original;
          const fullName =
            `${employee.first_name || ""} ${employee.last_name || ""}`.trim() ||
            employee.full_name ||
            "Unknown";

          return (
            <div className="grid min-w-0 gap-0.5">
              <span className="truncate font-semibold">{fullName}</span>
              <span className="truncate text-[length:var(--app-font-size-caption)] text-[var(--app-color-text-muted)]">
                @{employee.username || "username"}
              </span>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        meta: { width: "9rem" },
        cell: ({ row }) => {
          const employee = row.original;
          const resetRequest = requestByEmployeeId.get(String(employee.id));
          const displayedStatus = getEmployeeDisplayStatus(
            employee,
            resetRequest,
          );

          return (
            <Badge
              variant="secondary"
              className={`border-0 ${getStatusClassName(displayedStatus)}`}
            >
              {displayedStatus}
            </Badge>
          );
        },
      },
      {
        id: "role",
        header: "Role",
        meta: { width: "8rem" },
        cell: ({ row }) =>
          row.original.role?.role_name || row.original.role_name || "No Role",
      },
      {
        id: "contactNumber",
        header: "Contact No.",
        meta: { width: "9rem" },
        cell: ({ row }) =>
          row.original.contact_number || row.original.contact || "—",
      },
      {
        accessorKey: "email",
        header: "Email",
        meta: { width: "15rem" },
        cell: ({ row }) => row.original.email || "—",
      },
      {
        id: "actions",
        header: "Actions",
        meta: {
          width: "6rem",
          headerClassName: "text-center",
          cellClassName: "text-center",
        },
        cell: EmployeeActionCell,
      },
    ],
    [
      requestByEmployeeId,
    ],
  );

  const handleApplyFilters = (nextFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  };

  return (
    <EmployeeActionContext.Provider value={{
      cooldownClock, cooldownEndsAtByEmployee, requestByEmployeeId,
      onEdit, onChangeStatus, onReviewPasswordRequest,
      onResendSetupLink: setSetupLinkEmployee,
    }}>
    <section className="grid min-w-0 gap-[var(--app-gap-section)]">
      <EmployeeTableToolbar
        key={`${filters.roles.join("|")}::${filters.statuses.join("|")}`}
        searchTerm={searchTerm}
        roles={roles}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        onApplyFilters={handleApplyFilters}
      />

      <DataTable
        columns={columns}
        data={paginatedEmployees}
        getRowId={(employee) => String(employee.id)}
        tableLabel="Employees"
        isLoading={isLoading}
        skeletonRowCount={6}
        errorMessage={error || ""}
        emptyMessage="No employees match your search and filters."
        tableClassName="table-fixed"
        scrollAreaClassName="employee-table-scroll-area w-full"
        scrollbarOrientation="both"
      />

      <DataTablePagination
        totalItems={filteredEmployees.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 30]}
        currentPage={safeCurrentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        isLoading={isLoading}
      />

      {setupLinkEmployee && (
        <ResendSetupLinkModal
          key={setupLinkEmployee.id}
          employee={setupLinkEmployee}
          employees={employees}
          cooldown={setupLinkCooldown}
          cooldownEndsAt={cooldownEndsAtByEmployee[String(setupLinkEmployee.id)] || 0}
          onCooldownStart={handleCooldownStart}
          onClose={() => setSetupLinkEmployee(null)}
        />
      )}
    </section>
    </EmployeeActionContext.Provider>
  );
};

export default EmployeeTable;
