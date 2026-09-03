import React, { useState } from 'react';
import './addEmployeeModal.css';
import CustomSelect from '../../../../components/ui/CustomSelect/CustomSelect';
import { createEmployee } from '../../../../services/employees/employeeService';

const ROLE_ACCESS_MAP = {
  'Owner': "Dashboard, POS, Orders, Inventory, Inventory Valuation, Inventory Audit, Sales Report, Expenses, Menu, Employees, and Profile",
  'Cashier': "Dashboard, POS, Order History, and Profile",
  'Inventory Clerk': "Dashboard, Inventory Management, Inventory Valuation, Inventory Audit Log, and Profile"
};

const AddEmployeeModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    contactNumber: '',
    email: '',
    role: 'Cashier'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  const getPasswordStrength = (password) => {
    return {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  };

  const pwdRules = getPasswordStrength(formData.password);
  const isPasswordValid = Object.values(pwdRules).every(Boolean);

  React.useEffect(() => {
    if (isOpen) {
      setHasAttemptedSubmit(false);
      setErrors({});
      setErrorMessage('');
      setFormData({
        firstName: '', lastName: '', username: '', password: '', confirmPassword: '', contactNumber: '', email: '', role: 'Cashier'
      });
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required.';
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!formData.email.toLowerCase().endsWith('@gmail.com')) {
      newErrors.email = 'Must be a valid @gmail.com address.';
    }

    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact Number is required.';

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (!isPasswordValid) {
      newErrors.password = 'Please meet all password requirements.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
  }, [formData, isOpen, isPasswordValid]);

  const isFormValid = Object.keys(errors).length === 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getAccessString = (roleValue) => {
    return ROLE_ACCESS_MAP[roleValue] || "";
  };

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true);
    if (isSubmitting || !isFormValid) return;

    setErrorMessage('');

    setIsSubmitting(true);
    try {
      await createEmployee({
        roleName: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        username: formData.username,
        password: formData.password
      });

      // Clear form and close on success
      setFormData({
        firstName: '', lastName: '', username: '', password: '', confirmPassword: '', contactNumber: '', email: '', role: 'Cashier'
      });
      onClose(); // In the future we will call refetch() here
    } catch (err) {
      setErrorMessage(err.message || "An error occurred while creating the employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="employee-modal-overlay">
      <div className="employee-modal-content">
        <div className="employee-modal-header">
          <h2>Add Employee</h2>
          <button className="employee-modal-close" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="employee-modal-body">
          {/* Role Default Access Info Box at the very top */}
          <div className="employee-role-info-box">
            <div className="employee-role-info-title">Role Default Access</div>
            <p className="employee-role-info-text">
              This role will have access to <br />
              <i>{getAccessString(formData.role)}.</i>
            </p>
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Role *</label>
            <CustomSelect
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: 'Cashier', label: 'Cashier' },
                { value: 'Inventory Clerk', label: 'Inventory Clerk' },
                { value: 'Owner', label: 'Owner' }
              ]}
            />
          </div>

          <div className="employee-form-row-2col">
            <div className="employee-form-group">
              <label className="employee-form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                className={`employee-form-input ${hasAttemptedSubmit && errors.firstName ? 'is-invalid' : ''}`}
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Juan"
                autoComplete="off"
              />
              {hasAttemptedSubmit && errors.firstName && <p className="employee-error-text">{errors.firstName}</p>}
            </div>
            
            <div className="employee-form-group">
              <label className="employee-form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className={`employee-form-input ${hasAttemptedSubmit && errors.lastName ? 'is-invalid' : ''}`}
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Santos"
                autoComplete="off"
              />
              {hasAttemptedSubmit && errors.lastName && <p className="employee-error-text">{errors.lastName}</p>}
            </div>
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Username *</label>
            <input
              type="text"
              name="username"
              className={`employee-form-input ${hasAttemptedSubmit && errors.username ? 'is-invalid' : ''}`}
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. cashier_juan"
              autoComplete="off"
            />
            {hasAttemptedSubmit && errors.username && <p className="employee-error-text">{errors.username}</p>}
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Email *</label>
            <input
              type="email"
              name="email"
              className={`employee-form-input ${hasAttemptedSubmit && errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. juansantos@gmail.com"
              autoComplete="off"
            />
            {hasAttemptedSubmit && errors.email && <p className="employee-error-text">{errors.email}</p>}
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Contact Number *</label>
            <input
              type="text"
              name="contactNumber"
              className={`employee-form-input ${hasAttemptedSubmit && errors.contactNumber ? 'is-invalid' : ''}`}
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g. 09123456789"
              autoComplete="off"
            />
            {hasAttemptedSubmit && errors.contactNumber && <p className="employee-error-text">{errors.contactNumber}</p>}
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Password *</label>
            <div className={`employee-password-wrapper ${hasAttemptedSubmit && errors.password ? 'is-invalid-border' : ''}`}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`employee-form-input ${hasAttemptedSubmit && errors.password ? 'is-invalid' : ''}`}
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="employee-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {hasAttemptedSubmit && errors.password && <p className="employee-error-text">{errors.password}</p>}
            
            {formData.password.length > 0 && (
              <div className="employee-password-rules">
                <div className={pwdRules.length ? 'rule-passed' : 'rule-failed'}>
                  <i className={`bi ${pwdRules.length ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i> 8+ characters
                </div>
                <div className={pwdRules.uppercase ? 'rule-passed' : 'rule-failed'}>
                  <i className={`bi ${pwdRules.uppercase ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i> Uppercase letter
                </div>
                <div className={pwdRules.lowercase ? 'rule-passed' : 'rule-failed'}>
                  <i className={`bi ${pwdRules.lowercase ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i> Lowercase letter
                </div>
                <div className={pwdRules.number ? 'rule-passed' : 'rule-failed'}>
                  <i className={`bi ${pwdRules.number ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i> At least 1 number
                </div>
                <div className={pwdRules.special ? 'rule-passed' : 'rule-failed'}>
                  <i className={`bi ${pwdRules.special ? 'bi-check-circle-fill' : 'bi-x-circle'}`}></i> Special character
                </div>
              </div>
            )}
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Confirm Password *</label>
            <div className={`employee-password-wrapper ${hasAttemptedSubmit && errors.confirmPassword ? 'is-invalid-border' : ''}`}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className={`employee-form-input ${hasAttemptedSubmit && errors.confirmPassword ? 'is-invalid' : ''}`}
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="employee-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
            {hasAttemptedSubmit && errors.confirmPassword && <p className="employee-error-text">{errors.confirmPassword}</p>}
          </div>

          {errorMessage && (
            <div style={{ padding: '0.75rem 1.5rem', backgroundColor: '#F8D7DA', color: '#721C24', fontSize: '0.875rem' }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: '0.5rem' }}></i>
              {errorMessage}
            </div>
          )}
        </div>

        {hasAttemptedSubmit && !isFormValid && (
          <div style={{ color: '#dc3545', fontSize: '0.85rem', padding: '0 1.5rem', marginBottom: '1rem', textAlign: 'right', fontWeight: '500' }}>
            Please fill in all required fields (*)
          </div>
        )}

        <div className="employee-modal-footer">
          <button className="employee-modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="employee-modal-btn-save" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Add Employee'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
