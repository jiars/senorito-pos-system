import React from 'react';
import './employeeCard.css';

const EmployeeCard = ({ employee, onEdit }) => {
  const roleName = employee.role?.role_name || employee.role_name || 'No Role';
  const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.full_name || 'Unknown';
  const contactNumber = employee.contact_number || employee.contact || 'N/A';

  // Determine badge color based on role
  const getRoleBadgeClass = (rName) => {
    switch (rName?.toLowerCase()) {
      case 'cashier':
        return 'role-badge-cashier';
      case 'inventory clerk':
        return 'role-badge-inventory';
      default:
        return 'role-badge-default';
    }
  };

  const maskEmail = (email) => {
    if (!email) return 'N/A';
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const localPart = parts[0];
    const domain = parts[1];
    
    if (localPart.length <= 3) {
      return localPart.charAt(0) + '*'.repeat(Math.max(1, localPart.length - 1)) + '@' + domain;
    }
    
    const firstChar = localPart.charAt(0);
    const lastTwoChars = localPart.slice(-2);
    const asterisks = '*'.repeat(localPart.length - 3);
    
    return `${firstChar}${asterisks}${lastTwoChars}@${domain}`;
  };

  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <div className="employee-info-top">
          <h3>{fullName}</h3>
          <span className={`role-badge ${getRoleBadgeClass(roleName)}`}>
            {roleName}
          </span>
        </div>
        <button className="btn-edit-employee" onClick={onEdit} title="Edit Employee">
          <i className="bi bi-pencil"></i>
        </button>
      </div>
      
      <div className="employee-card-body">
        <div className="employee-detail-row">
          <span className="detail-label">Username</span>
          <span className="detail-value">{employee.username}</span>
        </div>
        <div className="employee-detail-row">
          <span className="detail-label">Contact</span>
          <span className="detail-value">
            <div className="employee-detail-item">
              <span>{contactNumber}</span>
            </div>
          </span>
        </div>
        <div className="employee-detail-row">
          <span className="detail-label">Email</span>
          <span className="detail-value">{maskEmail(employee.email)}</span>
        </div>
        <div className="employee-detail-row">
          <span className="detail-label">Account Status</span>
          <span className={`status-badge ${employee.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
            {employee.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
