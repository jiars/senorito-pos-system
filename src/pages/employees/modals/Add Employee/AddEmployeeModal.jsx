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

const getFormErrors = (formData) => {
  const errors = {};

  if (!formData.roleId) {
    errors.roleId = "Role is required.";
  }

  if (!formData.firstName.trim()) {
    errors.firstName = "First Name is required.";
  }

  if (!formData.lastName.trim()) {
    errors.lastName = "Last Name is required.";
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
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const errors = getFormErrors(formData);
  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (event) => {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;
    setErrorMessage("");

    setFormData((current) => ({
      ...current,
      [fieldName]: fieldValue,
    }));
  };

  const handleRoleChange = (role) => {
    setErrorMessage("");
    setFormData((current) => ({
      ...current,
      roleId: role?.id || "",
    }));
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);

    if (isSubmitting || !isFormValid) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await addEmployee({
        role_id: formData.roleId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        contact_number: formData.contactNumber,
        username: generatedUsername,
      });

      await refetchEmployeeManagement();
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
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
        title="Add Employee"
        description="Create an employee account and assign its system role."
        iconClassName="bi bi-person-plus"
        closeDisabled={isSubmitting}
      />

      <ModalBody viewportClassName="!max-h-[calc(var(--app-modal-max-height)-9.75rem)]">
        <ModalContent>
          <Field data-invalid={hasAttemptedSubmit && Boolean(errors.roleId)}>
            <FieldLabel htmlFor="add-employee-role" className={labelClassName}>
              Role
              <span className="text-[var(--app-color-danger)]">*</span>
            </FieldLabel>

            <Combobox
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
              <Input
                id="add-employee-contact"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 09123456789"
                autoComplete="tel"
                className={controlClassName}
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

          {errorMessage && (
            <p
              role="alert"
              className="rounded-[var(--app-radius-nested)] bg-[var(--app-color-danger-surface)] px-[var(--app-space-4)] py-[var(--app-space-2)] text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]"
            >
              {errorMessage}
            </p>
          )}

          {hasAttemptedSubmit && !isFormValid && (
            <p
              role="alert"
              className="text-right text-[length:var(--app-font-size-caption)] text-[var(--app-color-danger)]"
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
          {isSubmitting ? "Creating..." : "Add Employee"}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AddEmployeeModal;
