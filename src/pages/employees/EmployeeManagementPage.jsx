import React, { useState, useEffect } from 'react';
import './employeeManagement.css';
import EmployeeCard from './components/EmployeeCard';
import AddEmployeeModal from './modals/Add Employee/AddEmployeeModal';
import EditEmployeeModal from './modals/Edit Employee/EditEmployeeModal';
import { fetchEmployees } from '../../services/employees/employeeService';

const EmployeeManagementPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
    const username = (emp.username || '').toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(search) || username.includes(search) || email.includes(search);

    const roleName = emp.role?.role_name || emp.role_name || '';
    const matchesRole = roleFilter === 'All Roles' || roleName === roleFilter;

    const status = emp.status || 'Active';
    const matchesStatus = statusFilter === 'All Status' || status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  return (
    <div className="employee-page">
      <div className="employee-page-header">
        <div className="layout-page-heading">
          <h2>Employee Management</h2>
          <p>
            Create, edit, and manage employee accounts and roles here.
          </p>
        </div>
        <div className="employee-header-actions">
          <button
            className="employee-btn-add"
            onClick={() => setIsAddModalOpen(true)}
          >
            <i className="bi bi-plus-circle"></i> Add Employee
          </button>
        </div>
      </div>

      <div className="employee-panel">
        <div className="employee-filters-bar">
          <div className="employee-search">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="employee-filter-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All Roles">All Roles</option>
            <option value="Cashier">Cashier</option>
            <option value="Inventory Clerk">Inventory Clerk</option>
          </select>

          <select
            className="employee-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Deactivated">Deactivated</option>
          </select>

          <button
            className="employee-reset-btn"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('All Roles');
              setStatusFilter('All Status');
            }}
          >
            Reset
          </button>
        </div>

        <div className="employee-grid">
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: '#6c757d' }}>
              Loading employees...
            </div>
          ) : filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                onEdit={() => handleEditClick(emp)}
              />
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1', color: '#6c757d' }}>
              No employees found matching your filters.
            </div>
          )}
        </div>
      </div>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          loadEmployees(); // Refresh list after adding
        }}
      />

      <EditEmployeeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
          loadEmployees(); // Refresh list after editing
        }}
        employee={selectedEmployee}
      />
    </div>
  );
};

export default EmployeeManagementPage;
