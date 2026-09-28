import { useState } from "react";

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
import { updateEmployee } from "@/services/employees/employeeAccountsService";

const labelClassName =
  "text-[length:var(--app-font-size-caption)] font-semibold leading-[var(--app-line-height-caption)] text-[var(--app-color-text)]";
const controlClassName =
  "h-[var(--app-touch-target-min)] rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] px-[var(--app-space-2)] text-[length:var(--app-font-size-body-secondary)] leading-[var(--app-line-height-body-secondary)] text-[var(--app-color-text)] shadow-none focus-visible:border-[var(--app-color-brand)] focus-visible:ring-0";
const disabledControlClassName =
  "disabled:cursor-not-allowed disabled:bg-[var(--app-color-canvas)] disabled:text-[var(--app-color-text-muted)] disabled:opacity-100";
const errorClassName =
  "text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)]";

const getFormErrors = (formData) => {
  const errors = {};

  if (!formData.role) {
    errors.role = "Role is required.";
  }

  if (!formData.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!formData.contactNumber.trim()) {
    errors.contactNumber = "Contact Number is required.";
  }

  return errors;
};

const createInitialFormData = (employee) => ({
  firstName: employee.first_name || "",
  lastName: employee.last_name || "",
  username: employee.username || "",
  email: employee.email || "",
  contactNumber: employee.contact_number || "",
  role: employee.role?.role_name || employee.role_name || "Cashier",
  status: employee.status || "Active",
});

const EditEmployeeModalContent = ({ onClose, employee, roles = [] }) => {
  const [formData, setFormData] = useState(() =>
    createInitialFormData(employee),
  );
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = getFormErrors(formData);
  const isFormValid = Object.keys(errors).length === 0;
  const editableRoles = roles.filter(
    (role) => String(role.role_name).toLowerCase() !== "owner",
  );
  const selectedRole =
    editableRoles.find((role) => role.role_name === formData.role) || null;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setErrorMessage("");
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleRoleChange = (role) => {
    setErrorMessage("");
    setFormData((current) => ({
      ...current,
      role: role?.role_name || "",
    }));
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (isSubmitting || !isFormValid) return;

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await updateEmployee(employee.id, {
        role_id: selectedRole.id,
        email: formData.email.trim(),
        contact_number: formData.contactNumber.trim(),
      });
      onClose();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while updating the employee.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
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
          <Field data-invalid={hasAttemptedSubmit && Boolean(errors.role)}>
            <FieldLabel htmlFor="edit-employee-role" className={labelClassName}>
              Role
              <span className="text-[var(--app-color-danger)]">*</span>
            </FieldLabel>

            <Combobox
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
                className="z-[1100] rounded-[var(--app-radius-nested)] border border-[var(--app-color-border-subtle)] bg-[var(--app-color-surface)] shadow-[var(--app-shadow-card)] ring-0"
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
              <Input
                id="edit-employee-contact"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 09123456789"
                autoComplete="tel"
                aria-invalid={
                  hasAttemptedSubmit && Boolean(errors.contactNumber)
                }
                className={controlClassName}
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

          {errorMessage && (
            <p
              role="alert"
              className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
            >
              {errorMessage}
            </p>
          )}

          {hasAttemptedSubmit && !isFormValid && (
            <p
              role="alert"
              className="text-right text-[length:var(--app-font-size-caption)] leading-[var(--app-line-height-caption)] text-[var(--app-color-danger)]"
            >
              Please complete all required fields.
            </p>
          )}
        </ModalContent>
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="min-h-[var(--app-touch-target-min)] min-w-24 rounded-[var(--app-radius-nested)] border-[var(--app-color-border-subtle)] bg-[var(--app-color-filter-bg)] px-[var(--app-space-4)]"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="min-h-[var(--app-touch-target-min)] min-w-28 rounded-[var(--app-radius-nested)] bg-[var(--app-color-brand)] px-[var(--app-space-4)] text-white hover:bg-[var(--app-color-brand-hover)]"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

const EditEmployeeModal = ({ isOpen, onClose, employee, roles = [] }) => {
  if (!isOpen || !employee) return null;

  return (
    <EditEmployeeModalContent
      key={employee.id}
      onClose={onClose}
      employee={employee}
      roles={roles}
    />
  );
};

export default EditEmployeeModal;
