import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { formatFullName, formatInitials } from '../../utils/stringFormatters';

import { useAuth } from '../../hooks/useAuth';
import { connectBluetoothPrinter } from '../../services/hardware/bluetoothPrinterService';

import './layout.css';


const Topbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const { profile, role } = useAuth();

  let fullName = formatFullName(profile.first_name, profile.last_name);
  let initials = formatInitials(profile.first_name, profile.last_name);

  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [printerName, setPrinterName] = useState('');

  const handleConnectPrinter = async () => {
    try {
      const deviceName = await connectBluetoothPrinter();
      setIsPrinterConnected(true);
      setPrinterName(deviceName);
      alert(`Successfully connected to: ${deviceName}`);
    } catch (error) {
      alert('Failed to connect printer. Make sure it is turned on and your browser supports Web Bluetooth.');
    }
  };

  return (
    <header className="layout-topbar">
      <div className="layout-topbar-left">
        <button
          className="layout-hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      <div className="layout-topbar-right">
        <button 
          onClick={handleConnectPrinter}
          style={{ 
            marginRight: '15px', 
            padding: '6px 12px', 
            borderRadius: '6px', 
            backgroundColor: isPrinterConnected ? '#28a745' : '#3A1A0A', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem'
          }}
        >
          <i className="bi bi-bluetooth"></i> 
          {isPrinterConnected ? `Connected: ${printerName}` : 'Connect Printer'}
        </button>

        <div
          className="layout-user-profile"
          onClick={() => window.location.href = '/profile'}
          style={{ cursor: 'pointer' }}
        >
          <div className="layout-user-avatar">
            {initials.toUpperCase()}
          </div>
          <div className="layout-user-info">
            <p className="layout-user-name">{fullName}</p>
            <p className="layout-user-role">{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
