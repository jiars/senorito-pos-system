import { useEffect, useState } from "react";

import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { useEmployeeManagement } from "@/hooks/useEmployeeManagement";

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
  const [statusConfirmation, setStatusConfirmation] = useState(null);
  const [resetCooldownEndsAtByRequest, setResetCooldownEndsAtByRequest] = useState({});
  const [resetCooldownClock, setResetCooldownClock] = useState(() => Date.now());
  const hasResetCooldown = Object.values(resetCooldownEndsAtByRequest).some(
    (endsAt) => endsAt > resetCooldownClock,
  );

  // Keep deadlines outside the modal so closing it does not reset the timer.
  useEffect(() => {
    if (!hasResetCooldown) return undefined;
    const timerId = window.setInterval(() => setResetCooldownClock(Date.now()), 1000);
    return () => window.clearInterval(timerId);
  }, [hasResetCooldown]);

  const handleResetCooldownStart = (requestId, seconds) => {
    const now = Date.now();
    setResetCooldownEndsAtByRequest((current) => ({
      ...current,
      [String(requestId)]: now + seconds * 1000,
    }));
    setResetCooldownClock(now);
  };

  const handleReviewPasswordRequest = (employee, request) => {
    setPasswordRequestReview({ employee, request });
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
        refetchEmployeeManagement={refetchEmployeeManagement}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
      />

      {passwordRequestReview && (
        <PasswordResetRequestModal
          key={`${passwordRequestReview.employee.id}-${passwordRequestReview.request.id}`}
          employee={passwordRequestReview.employee}
          request={passwordRequestReview.request}
          cooldownEndsAt={resetCooldownEndsAtByRequest[String(passwordRequestReview.request.id)] || 0}
          cooldownClock={resetCooldownClock}
          onCooldownStart={handleResetCooldownStart}
          refetchEmployeeManagement={refetchEmployeeManagement}
          onClose={() => setPasswordRequestReview(null)}
        />
      )}

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
