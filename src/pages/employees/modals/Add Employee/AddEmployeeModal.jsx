import { useRef, useState } from "react";

import BlockingFeedback from "@/components/feedback/blocking/BlockingFeedback";
import InlineFeedback from "@/components/feedback/inline/InlineFeedback";
import { toast } from "@/components/ui/toast";
import { useFeedback } from "@/hooks/feedback/useFeedback";
import {
  getAddEmployeeErrorCode,
  getAddEmployeeInlineFeedback,
  getAddEmployeeStatusFeedback,
  getAddEmployeeToastFeedback,
} from "@/utils/employees/feedback/addEmployeeFeedback";

import Modal from "@/components/modals/Modal";
import ActionAlertDialog from "@/components/modals/ActionAlertDialog";
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
import { validateAddEmployee, getAddEmployeeServerFieldErrors } from "@/utils/validation/employees/addEmployeeValidation";

import { addEmployee } from "../../../../services/employees/employeeAccountsService";
import { generateEmployeeUsername } from "../../../../utils/employee/employeeUsernameUtils";

const ROLE_ACCESS_MAP = {
  Cashier: "Dashboard, POS, Order History, and Profile",
  "Inventory Clerk":
    "Dashboard, Inventory Management, Inventory Valuation, Inventory Audit Log, and Profile",
};

const labelClassName =
  "text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text)]";

const controlClassName =
  "h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] shadow-none focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0";

const errorClassName =
  "text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)]";

const AddEmployeeModal = ({
  onClose,
  roles,
  employees,
  refetchEmployeeManagement,
}) => {
  const allowedRoles = roles.filter((role) => {
    return ["Cashier", "Inventory Clerk"].includes(role.role_name);
  });

  const defaultRoleId = allowedRoles.length > 0 ? allowedRoles[0].id : "";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    email: "",
    roleId: defaultRoleId,
  });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmedResult, setConfirmedResult] = useState(null);
  const [saveBlocked, setSaveBlocked] = useState(false);
  const operationInFlight = useRef(false);
  const { feedback, showFeedback, clearFeedback } = useFeedback(getAddEmployeeInlineFeedback);

  const selectedRole = allowedRoles.find((role) => {
    return role.id === formData.roleId;
  });

  const selectedRoleName = selectedRole ? selectedRole.role_name : "";
  const accessDescription = ROLE_ACCESS_MAP[selectedRoleName] || "";
  const generatedUsername = generateEmployeeUsername(
    selectedRoleName,
    formData.firstName,
    formData.lastName,
    employees,
  );
  const validation = validateAddEmployee(formData, allowedRoles);
  const errors = { ...serverFieldErrors, ...validation.errors };
  const isFormValid = validation.isFormValid && Object.keys(serverFieldErrors).length === 0;
  const formLocked = isSubmitting || isConfirmationOpen || Boolean(confirmedResult) || saveBlocked;

  const handleChange = (event) => {
    if (formLocked) return;
    const fieldName = event.target.name;
    const fieldValue = event.target.value;
    clearFeedback();
    setServerFieldErrors({});

    setFormData((current) => ({
      ...current,
      [fieldName]: fieldValue,
    }));
  };

  const handleRoleChange = (role) => {
    if (formLocked) return;
    clearFeedback();
    setServerFieldErrors({});
    setFormData((current) => ({
      ...current,
      roleId: role?.id || "",
    }));
  };

  const handleClose = () => {
    if (!operationInFlight.current && !confirmedResult && !isConfirmationOpen) onClose();
  };

  // Once created, recovery retries the list read only, never the creation POST.
  const refreshCreatedEmployee = async (resultDetails) => {
    try {
      const result = await refetchEmployeeManagement();
      if (result && (result.isError || result.error)) return;
    } catch {
      return;
    }
    toast.add(getAddEmployeeToastFeedback(resultDetails.code, resultDetails));
    onClose();
  };

  const handleSubmit = () => {
    if (operationInFlight.current || confirmedResult || saveBlocked || isConfirmationOpen) return;
    setHasAttemptedSubmit(true);
    if (!isFormValid) {
      const fieldIds = {
        roleId: "add-employee-role", firstName: "add-employee-first-name",
        lastName: "add-employee-last-name", email: "add-employee-email",
        contactNumber: "add-employee-contact",
      };
      const firstInvalidInput = document.getElementById(fieldIds[Object.keys(errors)[0]]);
      if (firstInvalidInput) firstInvalidInput.focus();
      return;
    }
    clearFeedback();
    setIsConfirmationOpen(true);
  };

  const handleConfirmAdd = async () => {
    if (operationInFlight.current || confirmedResult || saveBlocked || !isConfirmationOpen) return;
    if (!isFormValid) {
      setIsConfirmationOpen(false);
      return;
    }
    operationInFlight.current = true;
    setIsConfirmationOpen(false);
    clearFeedback();
    setIsSubmitting(true);
    try {
      let response;
      try {
        response = await addEmployee({
          role_id: formData.roleId,
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          contact_number: formData.contactNumber,
          username: generatedUsername,
        });
      } catch (error) {
        const code = getAddEmployeeErrorCode(error);
        showFeedback(code);
        if (code === "SAVE_UNCONFIRMED") setSaveBlocked(true);
        if (code === "VALIDATION_FAILED" && error.response.data && error.response.data.errors) {
          setServerFieldErrors(getAddEmployeeServerFieldErrors(error.response.data.errors));
        }
        return;
      }

      let code = "EMPLOYEE_ADDED";
      if (response.setup_email_sent !== true) code = "EMPLOYEE_ADDED_EMAIL_FAILED";
      const resultDetails = { code, employeeName: `${formData.firstName.trim()} ${formData.lastName.trim()}` };
      setConfirmedResult(resultDetails);
      await refreshCreatedEmployee(resultDetails);
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRetryRefresh = async () => {
    if (operationInFlight.current || !confirmedResult) return;
    operationInFlight.current = true;
    setIsSubmitting(true);
    try {
      await refreshCreatedEmployee(confirmedResult);
    } finally {
      operationInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const isRefreshError = Boolean(confirmedResult) && !isSubmitting;
  let statusCode = "EMPLOYEE_ADDING";
  if (confirmedResult) statusCode = "EMPLOYEES_REFRESHING";
  if (isRefreshError) statusCode = "EMPLOYEES_REFRESH_FAILED";
  const statusFeedback = getAddEmployeeStatusFeedback(statusCode);
  let blockingAction;
  if (isRefreshError) blockingAction = { label: statusFeedback.buttonLabel, onClick: handleRetryRefresh };

  return (
    <>
    <Modal
      isOpen={!isSubmitting && !confirmedResult}
      onClose={handleClose}
      maxWidth="38rem"
      maxHeight="min(90svh, 44rem)"
    >
      <ModalHeader
        title="Add Employee"
        description="Create an employee account and assign its system role."
        iconClassName="bi bi-person-plus"
        closeDisabled={isSubmitting}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        <ModalContent>
          <fieldset disabled={formLocked} className="contents">
          <Field data-invalid={hasAttemptedSubmit && Boolean(errors.roleId)}>
            <FieldLabel htmlFor="add-employee-role" className={labelClassName}>
              Role
              <span className="text-[var(--app-color-danger)]">*</span>
            </FieldLabel>

            <Combobox
              disabled={formLocked}
              items={allowedRoles}
              value={selectedRole || null}
              onValueChange={handleRoleChange}
              itemToStringLabel={(role) => role?.role_name || ""}
              itemToStringValue={(role) => String(role?.id || "")}
              isItemEqualToValue={(option, value) =>
                String(option?.id) === String(value?.id)
              }
            >
              <ComboboxInput
                id="add-employee-role"
                placeholder="Select role"
                className={controlClassName}
                aria-invalid={hasAttemptedSubmit && Boolean(errors.roleId)}
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

            {accessDescription && (
              <p className="text-[length:var(--app-font-size-caption)] italic leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
                Access: {accessDescription}
              </p>
            )}

            {hasAttemptedSubmit && errors.roleId && (
              <FieldError className={errorClassName}>
                {errors.roleId}
              </FieldError>
            )}
          </Field>

          <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
            <Field
              data-invalid={hasAttemptedSubmit && Boolean(errors.firstName)}
            >
              <FieldLabel
                htmlFor="add-employee-first-name"
                className={labelClassName}
              >
                First Name
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>
              <Input
                id="add-employee-first-name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Juan"
                autoComplete="off"
                className={controlClassName}
                aria-invalid={hasAttemptedSubmit && Boolean(errors.firstName)}
              />
              {hasAttemptedSubmit && errors.firstName && (
                <FieldError className={errorClassName}>
                  {errors.firstName}
                </FieldError>
              )}
            </Field>

            <Field
              data-invalid={hasAttemptedSubmit && Boolean(errors.lastName)}
            >
              <FieldLabel
                htmlFor="add-employee-last-name"
                className={labelClassName}
              >
                Last Name
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>
              <Input
                id="add-employee-last-name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Santos"
                autoComplete="off"
                className={controlClassName}
                aria-invalid={hasAttemptedSubmit && Boolean(errors.lastName)}
              />
              {hasAttemptedSubmit && errors.lastName && (
                <FieldError className={errorClassName}>
                  {errors.lastName}
                </FieldError>
              )}
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-[var(--app-gap-related)] sm:grid-cols-2">
            <Field>
              <FieldLabel
                htmlFor="add-employee-username"
                className={labelClassName}
              >
                Username
              </FieldLabel>
              <Input
                id="add-employee-username"
                value={generatedUsername}
                disabled
                placeholder="Generated automatically"
                className={`${controlClassName} disabled:cursor-not-allowed disabled:bg-[var(--app-color-canvas)] disabled:text-[var(--app-color-text-muted)] disabled:opacity-100`}
              />
              <p className="text-[length:var(--app-font-size-caption)] italic leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
                Generated automatically from the employee role and name.
              </p>
            </Field>

            <Field
              data-invalid={hasAttemptedSubmit && Boolean(errors.contactNumber)}
            >
              <FieldLabel
                htmlFor="add-employee-contact"
                className={labelClassName}
              >
                Contact Number
                <span className="text-[var(--app-color-danger)]">*</span>
              </FieldLabel>
              <EmployeeContactInput
                id="add-employee-contact"
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
            <FieldLabel htmlFor="add-employee-email" className={labelClassName}>
              Email
              <span className="text-[var(--app-color-danger)]">*</span>
            </FieldLabel>
            <Input
              id="add-employee-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. juansantos@gmail.com"
              autoComplete="email"
              className={controlClassName}
              aria-invalid={hasAttemptedSubmit && Boolean(errors.email)}
            />
            <p className="text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-text-muted)]">
              The employee will receive a secure password setup link.
            </p>
            {hasAttemptedSubmit && errors.email && (
              <FieldError className={errorClassName}>{errors.email}</FieldError>
            )}
          </Field>

          </fieldset>
          <InlineFeedback feedback={feedback} id="add-employee-feedback" />
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
          {isSubmitting ? "Creating..." : "Add Employee"}
        </Button>
      </ModalFooter>
      <ActionAlertDialog
        open={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        type="small"
        title="Add employee?"
        description={
          <>Add <span className="font-semibold text-[var(--app-color-text)]">{formData.firstName.trim()} {formData.lastName.trim()}</span> and send a setup link to <span className="font-semibold text-[var(--app-color-text)] [overflow-wrap:anywhere]">{formData.email.trim()}</span>?</>
        }
        actions={[
          { key: "cancel", label: "Cancel", close: true },
          { key: "confirm", label: "Confirm", tone: "success", onClick: handleConfirmAdd, disabled: isSubmitting },
        ]}
      />
    </Modal>
    <BlockingFeedback
      open={isSubmitting || Boolean(confirmedResult)}
      status={isRefreshError ? "error" : "loading"}
      title={statusFeedback.title}
      message={statusFeedback.message}
      action={blockingAction}
    />
    </>
  );
};

export default AddEmployeeModal;
