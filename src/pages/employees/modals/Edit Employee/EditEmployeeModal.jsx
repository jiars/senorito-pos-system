import { useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getEditEmployeeErrorCode,
  getEditEmployeeInlineFeedback,
  getEditEmployeeStatusFeedback,
  getEditEmployeeToastFeedback,
} from "@/utils/employees/feedback/editEmployeeFeedback";

import Modal from "@/components/modals/Modal";
import ModalBody from "@/components/modals/ModalBody";
import ModalContent from "@/components/modals/ModalContent";
import ModalFooter from "@/components/modals/ModalFooter";
import ModalHeader from "@/components/modals/ModalHeader";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import EmployeeContactInput from "../../components/EmployeeContactInput";
import { validateEditEmployee, getEditEmployeeServerFieldErrors } from "@/utils/employees/validation/editEmployeeValidation";
import { updateEmployee } from "@/services/employees/employeeAccountsService";

const labelClassName =
  "text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text)]";
const controlClassName =
  "h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] shadow-none focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0";
const disabledControlClassName =
  "disabled:cursor-not-allowed disabled:bg-[var(--app-color-canvas)] disabled:text-[var(--app-color-text-muted)] disabled:opacity-100";
const errorClassName =
  "text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)]";

const createInitialFormData = (employee) => ({
  firstName: employee.first_name || "",
  lastName: employee.last_name || "",
  username: employee.username || "",
  email: employee.email || "",
  contactNumber: employee.contact_number || "",
  role: employee.role?.role_name || employee.role_name || "Cashier",
});

const EditEmployeeModalContent = ({ onClose, employee, roles = [], refetchEmployeeManagement }) => {
  const [formData, setFormData] = useState(() =>
    createInitialFormData(employee),
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getEditEmployeeInlineFeedback);
  const employeeName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
    || employee.username || "Employee";

  const editableRoles = roles.filter(
    (role) => ["Cashier", "Inventory Clerk"].includes(role.role_name),
  );
  const selectedRole =
    editableRoles.find((role) => role.role_name === formData.role) || null;
  const validation = validateEditEmployee(formData, editableRoles);
  const errors = { ...serverFieldErrors, ...validation.errors };
  const isFormValid = validation.isFormValid && Object.keys(serverFieldErrors).length === 0;
  const formLocked = isSubmitting || hasSaved || saveBlocked;

  const handleChange = (event) => {
    if (formLocked) return;
    const { name, value } = event.target;

    clearFeedback();
    setServerFieldErrors({});
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    if (formLocked) return;
    clearFeedback();
    setServerFieldErrors({});
    setFormData((current) => ({
      ...current,
      role: role?.role_name || "",
    }));
  };

  const handleClose = () => {
    if (!operationInFlight.current && !hasSaved) onClose();
  };

  // A confirmed update retries only the required list read if refresh fails.
  const refreshUpdatedEmployee = async () => {
    try {
      const result = await refetchEmployeeManagement();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getEditEmployeeToastFeedback("EMPLOYEE_UPDATED", { employeeName }));
    onClose();
  };

  const handleSubmit = async () => {
    if (operationInFlight.current || hasSaved || saveBlocked) return;
    setHasAttemptedSubmit(true);
    if (!isFormValid) {
      const fieldIds = { role: "edit-employee-role", email: "edit-employee-email", contactNumber: "edit-employee-contact" };
      const firstInvalidInput = document.getElementById(fieldIds[Object.keys(errors)[0]]);
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }
    operationInFlight.current = true;
    clearFeedback();
    setIsSubmitting(true);
    try {
      try {
        await updateEmployee(employee.id, {
          role_id: selectedRole.id,
          email: formData.email.trim(),
          contact_number: formData.contactNumber.trim(),
        });
      } catch (error) {
        const code = getEditEmployeeErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED" || code === "EMPLOYEE_CONFLICT") setSaveBlocked(true);
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          setServerFieldErrors(getEditEmployeeServerFieldErrors(error.response.data.errors));
        }
        return;
      }
      setHasSaved(true);
      await refreshUpdatedEmployee();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !hasSaved) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshUpdatedEmployee();
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = hasSaved && !isSubmitting;
  let statusCode = "EMPLOYEE_SAVING";
  if (hasSaved) statusCode = "EMPLOYEES_REFRESHING";
  if (isRefreshError) statusCode = "EMPLOYEES_REFRESH_FAILED";
  const statusFeedback = getEditEmployeeStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };

  return (
    <>
    <Modal
      isOpen={!isSubmitting && !hasSaved}
      onClose={handleClose}
      maxWidth="38rem"
      maxHeight="min(90svh, 44rem)"
    >
      <ModalHeader
        title="Edit Employee"
        description="Update the employee role and contact information."
        iconClassName="bi bi-person-gear"
        closeDisabled={isSubmitting}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        <ModalContent>
          <fieldset disabled={formLocked} className="contents">
          <Field data-invalid={hasAttemptedSubmit && Boolean(errors.role)}>
            <FieldLabel htmlFor="edit-employee-role" className={labelClassName}>
              Role
              <span className="text-[var(--app-color-danger)]">*</span>
            </FieldLabel>

            <Combobox
              disabled={formLocked}
              items={editableRoles}
              value={selectedRole}
              onValueChange={handleRoleChange}
              itemToStringLabel={(role) => role?.role_name || ""}
              itemToStringValue={(role) => String(role?.id || "")}
              isItemEqualToValue={(option, value) =>
                String(option?.id) === String(value?.id)
              }
            >
              <ComboboxInput
                id="edit-employee-role"
                placeholder="Select role"
                aria-invalid={hasAttemptedSubmit && Boolean(errors.role)}
                className={controlClassName}
              />
              <ComboboxContent
                positionerClassName="!z-[1100]"
                className="z-[1100] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)]  ring-0"
              >
                <ComboboxEmpty>No role found.</ComboboxEmpty>
                <ComboboxList>
                  {(role) => (
                    <ComboboxItem
                      key={role.id}
                      value={role}
                      className="min-h-[var(--app-touch-target-min)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)]"
                    >
                      {role.role_name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            {hasAttemptedSubmit && errors.role && (
              <FieldError className={errorClassName}>{errors.role}</FieldError>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
            <Field>
              <FieldLabel
                htmlFor="edit-employee-first-name"
                className={labelClassName}
              >
                First Name
              </FieldLabel>
              <Input
                id="edit-employee-first-name"
                value={formData.firstName}
                disabled
                className={`${controlClassName} ${disabledControlClassName}`}
              />
            </Field>

            <Field>
              <FieldLabel
                htmlFor="edit-employee-last-name"
                className={labelClassName}
              >
                Last Name
              </FieldLabel>
              <Input
                id="edit-employee-last-name"
                value={formData.lastName}
                disabled
                className={`${controlClassName} ${disabledControlClassName}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
            <Field>
              <FieldLabel
                htmlFor="edit-employee-username"
                className={labelClassName}
              >
                Username
              </FieldLabel>
              <Input
                id="edit-employee-username"
                value={formData.username}
                disabled
                className={`${controlClassName} ${disabledControlClassName}`}
              />
              <p className="text-[length:var(--app-font-size-caption)] italic leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
                Username cannot be changed.
              </p>
            </Field>

            <Field
              data-invalid={hasAttemptedSubmit && Boolean(errors.contactNumber)}
            >
              <FieldLabel
                htmlFor="edit-employee-contact"
                className={labelClassName}
              >
                Contact Number
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>
              <EmployeeContactInput
                id="edit-employee-contact"
                value={formData.contactNumber}
                onValueChange={(contactNumber) => {
                  if (formLocked) return;
                  clearFeedback();
                  setServerFieldErrors({});
                  setFormData((current) => ({ ...current, contactNumber }));
                }}
                disabled={formLocked}
                aria-invalid={
                  hasAttemptedSubmit && Boolean(errors.contactNumber)
                }
              />
              {hasAttemptedSubmit && errors.contactNumber && (
                <FieldError className={errorClassName}>
                  {errors.contactNumber}
                </FieldError>
              )}
            </Field>
          </div>

          <Field data-invalid={hasAttemptedSubmit && Boolean(errors.email)}>
            <FieldLabel
              htmlFor="edit-employee-email"
              className={labelClassName}
            >
              Email
              <span className="text-[var(--app-color-danger)]">*</span>
            </FieldLabel>
            <Input
              id="edit-employee-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. juansantos@gmail.com"
              autoComplete="email"
              aria-invalid={hasAttemptedSubmit && Boolean(errors.email)}
              className={controlClassName}
            />
            {hasAttemptedSubmit && errors.email && (
              <FieldError className={errorClassName}>{errors.email}</FieldError>
            )}
          </Field>

          </fieldset>
          <InlineFeedback feedback={feedback} id="edit-employee-feedback" />
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
          className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={formLocked}
          className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </ModalFooter>
    </Modal>
    <BlockingFeedback
      open={isSubmitting || hasSaved}
      status={isRefreshError ? "error" : "loading"}
      title={statusFeedback.title}
      message={statusFeedback.message}
      action={blockingAction}
    />
    </>
  );
};

const EditEmployeeModal = ({ isOpen, onClose, employee, roles = [], refetchEmployeeManagement }) => {
  if (!isOpen || !employee) return null;

  return (
    <EditEmployeeModalContent
      key={employee.id}
      onClose={onClose}
      employee={employee}
      roles={roles}
      refetchEmployeeManagement={refetchEmployeeManagement}
    />
  );
};

export default EditEmployeeModal;
