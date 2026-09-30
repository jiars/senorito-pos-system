import { useState } from "react";

import PageLayout from "@/components/layout/PageLayout";
import ConfirmationModal from "@/components/modals/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement";
import {
  approvePasswordResetRequest,
  cancelPasswordResetRequest,
  deactivateEmployee,
  reactivateEmployee,
  resendPasswordResetLink,
} from "@/services/employees/employeeAccountsService";

import "./employeeManagement.css";
import EmployeeTable from "./components/EmployeeTable";

import AddEmployeeModal from "./modals/Add Employee/AddEmployeeModal";
import EditEmployeeModal from "./modals/Edit Employee/EditEmployeeModal";
import PasswordResetRequestModal from "./modals/Password Reset Request/PasswordResetRequestModal";

const EmployeeManagementPage = () => {
  const {
    employees,
    roles,
    passwordResetRequests,
    isLoading,
    error,
    refetchEmployeeManagement,
  } = useEmployeeManagement();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [passwordRequestReview, setPasswordRequestReview] = useState(null);
  const [passwordRequestAction, setPasswordRequestAction] = useState("");
  const [passwordRequestError, setPasswordRequestError] = useState("");
  const [statusConfirmation, setStatusConfirmation] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const handleReviewPasswordRequest = (employee, request) => {
    setPasswordRequestError("");
    setPasswordRequestReview({ employee, request });
  };

  const handlePasswordRequestAction = async (action, operation) => {
    const requestId = passwordRequestReview?.request?.id;
    if (!requestId || passwordRequestAction) return;

    setPasswordRequestError("");
    setPasswordRequestAction(action);

    try {
      await operation(requestId);
      await refetchEmployeeManagement();
      setPasswordRequestReview(null);
    } catch (requestError) {
      setPasswordRequestError(
        requestError.response?.data?.message ||
          requestError.message ||
          "The password request could not be updated.",
      );
    } finally {
      setPasswordRequestAction("");
    }
  };

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleStatusClick = (employee, nextStatus) => {
    setStatusError("");
    setStatusConfirmation({ employee, nextStatus });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmation || isUpdatingStatus) return;

    const { employee, nextStatus } = statusConfirmation;

    setStatusError("");
    setIsUpdatingStatus(true);

    try {
      const updateStatus =
        nextStatus === "Deactivated" ? deactivateEmployee : reactivateEmployee;

      await updateStatus(employee.id);

      await refetchEmployeeManagement();
      setStatusConfirmation(null);
    } catch (statusUpdateError) {
      setStatusError(
        statusUpdateError.response?.data?.message ||
          statusUpdateError.message ||
          "Failed to update the employee status.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const pageActions = (
    <Button
      type="button"
      onClick={() => setIsAddModalOpen(true)}
      className="h-[var(--app-touch-target-min)] rounded-[var(--app-radius-control)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-[length:var(--app-font-size-body-secondary)] font-medium text-white hover:bg-[var(--app-color-brand-hover)] transition-shadow hover:shadow-brand active:shadow-brand"
    >
      <i aria-hidden="true" className="bi bi-plus-lg" />
      Add Employee
    </Button>
  );

  const statusEmployee = statusConfirmation?.employee;
  const nextStatus = statusConfirmation?.nextStatus;
  const isDeactivating = nextStatus === "Deactivated";

  const statusEmployeeName = statusEmployee
    ? `${statusEmployee.first_name || ""} ${
        statusEmployee.last_name || ""
      }`.trim() ||
      statusEmployee.username ||
      "Employee"
    : "Employee";

  return (
    <PageLayout
      title="Employee Management"
      subtitle="Create, edit, and manage employee accounts and roles."
      actions={pageActions}
      className="employee-page-shell flex flex-col gap-[var(--app-gap-section)]"
    >
      <div className="employee-page-layout">
        <EmployeeTable
          employees={employees}
          roles={roles}
          passwordResetRequests={passwordResetRequests}
          isLoading={isLoading}
          error={error}
          onEdit={handleEditClick}
          onChangeStatus={handleStatusClick}
          onReviewPasswordRequest={handleReviewPasswordRequest}
        />
      </div>

      {isAddModalOpen && (
        <AddEmployeeModal
          roles={roles}
          employees={employees}
          refetchEmployeeManagement={refetchEmployeeManagement}
          onClose={() => {
            setIsAddModalOpen(false);
          }}
        />
      )}

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        roles={roles}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
          refetchEmployeeManagement();
        }}
        employee={selectedEmployee}
      />

      <PasswordResetRequestModal
        open={Boolean(passwordRequestReview)}
        onOpenChange={(open) => {
          if (!open && !passwordRequestAction) {
            setPasswordRequestReview(null);
            setPasswordRequestError("");
          }
        }}
        employee={passwordRequestReview?.employee}
        request={passwordRequestReview?.request}
        onApprove={() =>
          handlePasswordRequestAction("approve", approvePasswordResetRequest)
        }
        onCancelRequest={() =>
          handlePasswordRequestAction("cancel", cancelPasswordResetRequest)
        }
        onResend={() =>
          handlePasswordRequestAction("resend", resendPasswordResetLink)
        }
        isApproving={passwordRequestAction === "approve"}
        isCancelling={passwordRequestAction === "cancel"}
        isResending={passwordRequestAction === "resend"}
        error={passwordRequestError}
      />

      <ConfirmationModal
        open={Boolean(statusConfirmation)}
        onOpenChange={(open) => {
          if (!open && !isUpdatingStatus) {
            setStatusConfirmation(null);
            setStatusError("");
          }
        }}
        title={isDeactivating ? "Deactivate Account" : "Reactivate Account"}
        description={
          isDeactivating
            ? `Are you sure you want to deactivate ${statusEmployeeName}? This account can be reactivated later.`
            : `Reactivate ${statusEmployeeName} and restore access to the account?`
        }
        iconClassName={isDeactivating ? "bi bi-person-x" : "bi bi-person-check"}
        tone={isDeactivating ? "danger" : "success"}
        error={statusError}
        actions={[
          {
            key: "confirm-status",
            label: isDeactivating ? "Deactivate" : "Reactivate",
            loadingLabel: isDeactivating
              ? "Deactivating..."
              : "Reactivating...",
            tone: isDeactivating ? "danger" : "success",
            isLoading: isUpdatingStatus,
            onClick: handleConfirmStatusChange,
          },
          {
            key: "cancel",
            label: "Cancel",
            tone: "secondary",
            close: true,
          },
        ]}
      />
    </PageLayout>
  );
};

export default EmployeeManagementPage;
