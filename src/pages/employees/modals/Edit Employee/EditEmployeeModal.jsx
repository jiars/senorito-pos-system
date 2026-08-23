import React, { useState, useEffect } from 'react';
import '../Add Employee/addEmployeeModal.css'; // Reusing the same CSS for consistency
import CustomSelect from '../../../../components/ui/CustomSelect/CustomSelect';
import { updateEmployee } from '../../../../services/employees/employeeService';

const getAccessString = (roleName) => {
  switch (roleName) {
    case 'Cashier':
      return 'POS, Order History';
    case 'Inventory Clerk':
      return 'Inventory Management, Purchase Orders, Inventory Valuation, Inventory Audit Log';
    case 'Admin (Owner)':
      return 'All system features';
    default:
      return 'No access defined';
  }
};

const EditEmployeeModal = ({ isOpen, onClose, employee }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    role: 'Cashier',
    status: 'Active'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.first_name || '',
        lastName: employee.last_name || '',
        username: employee.username || '',
        email: employee.email || '',
        contactNumber: employee.contact_number || '',
        password: '', // Always empty on init
        confirmPassword: '',
        role: employee.role?.role_name || employee.role_name || 'Cashier',
        status: employee.status || 'Active'
      });
      setError(null);
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [employee, isOpen]);

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

  if (!isOpen || !employee) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusToggle = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'Active' ? 'Deactivated' : 'Active'
    }));
  };

  const handleSubmit = async () => {
    setError(null);
    if (!formData.firstName || !formData.lastName) {
      setError("Please fill in all required fields (*)");
      return;
    }

    if (formData.password) {
      if (!isPasswordValid) {
        setError("Please meet all the new password requirements.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await updateEmployee(employee.id, {
        roleName: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        contactNumber: formData.contactNumber,
        status: formData.status,
        password: formData.password
      });

      onClose(); // Will trigger refresh in parent
    } catch (err) {
      setError(err.message || "An error occurred while updating the employee.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employee-modal-overlay">
      <div className="employee-modal-content">
        <div className="employee-modal-header">
          <h2>Edit Employee</h2>
          <button className="employee-modal-close" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="employee-modal-body">
          {/* Status Toggle */}
          <div className="employee-form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', marginBottom: 0, background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
            <label className="employee-form-label" style={{ margin: 0 }}>Account Status</label>
            <div 
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={handleStatusToggle}
            >
              <div style={{
                width: '40px',
                height: '24px',
                backgroundColor: formData.status === 'Active' ? '#4CAF50' : '#ccc',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background-color 0.3s'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: formData.status === 'Active' ? '18px' : '2px',
                  transition: 'left 0.3s'
                }}/>
              </div>
              <span style={{ 
                fontWeight: '600', 
                fontSize: '0.875rem',
                color: formData.status === 'Active' ? '#4CAF50' : '#6c757d'
              }}>
                {formData.status}
              </span>
            </div>
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
                { value: 'Admin (Owner)', label: 'Admin (Owner)' }
              ]}
            />
          </div>

          <div className="employee-form-row-2col">
            <div className="employee-form-group">
              <label className="employee-form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                className="employee-form-input"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Juan"
                autoComplete="off"
              />
            </div>
            
            <div className="employee-form-group">
              <label className="employee-form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                className="employee-form-input"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Santos"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Username</label>
            <input
              type="text"
              name="username"
              className="employee-form-input"
              value={formData.username}
              disabled
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' }}
            />
            <div style={{ fontSize: '0.65rem', color: '#6c757d', marginTop: '0.25rem', fontStyle: 'italic' }}>
              Username cannot be changed.
            </div>
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Email</label>
            <input
              type="email"
              name="email"
              className="employee-form-input"
              value={formData.email}
              disabled
              style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed', color: '#6c757d' }}
            />
            <div style={{ fontSize: '0.65rem', color: '#6c757d', marginTop: '0.25rem', fontStyle: 'italic' }}>
              Email cannot be changed.
            </div>
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">Contact Number</label>
            <input
              type="text"
              name="contactNumber"
              className="employee-form-input"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="e.g. 09123456789"
              autoComplete="off"
            />
          </div>

          <div className="employee-form-group">
            <label className="employee-form-label">New Password</label>
            <div className="employee-password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="employee-form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
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
            <label className="employee-form-label">Confirm New Password</label>
            <div className="employee-password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="employee-form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password if changing"
                autoComplete="new-password"
                disabled={!formData.password}
              />
              <button
                type="button"
                className="employee-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          {error && (
            <div style={{ color: '#dc3545', fontSize: '0.875rem', fontWeight: '500', marginTop: '0.5rem' }}>
              {error}
            </div>
          )}
        </div>

        <div className="employee-modal-footer">
          <button className="employee-modal-btn-cancel" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="employee-modal-btn-save" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
