import { useState } from "react";

import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement";
import {
  approvePasswordResetRequest,
  cancelPasswordResetRequest,
  resendPasswordResetLink,
} from "@/services/employees/employeeAccountsService";

import "./employeeManagement.css";
import EmployeeTable from "./components/EmployeeTable";

import AddEmployeeModal from "./modals/Add Employee/AddEmployeeModal";
import EditEmployeeModal from "./modals/Edit Employee/EditEmployeeModal";
import PasswordResetRequestModal from "./modals/Password Reset Request/PasswordResetRequestModal";
import EmployeeStatusModal from "./modals/Account Status/EmployeeStatusModal";

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
    setStatusConfirmation({ employee, nextStatus });
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

      {statusConfirmation && (
        <EmployeeStatusModal
          key={`${statusConfirmation.employee.id}-${statusConfirmation.nextStatus}`}
          employee={statusConfirmation.employee}
          nextStatus={statusConfirmation.nextStatus}
          refetchEmployeeManagement={refetchEmployeeManagement}
          onClose={() => setStatusConfirmation(null)}
        />
      )}
    </PageLayout>
  );
};

export default EmployeeManagementPage;
