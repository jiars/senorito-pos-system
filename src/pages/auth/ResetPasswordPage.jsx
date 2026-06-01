import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import senoritoLogo from '../../assets/images/senorito_logo.png';
import './auth.css';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    console.log('Reset password submitted:', { newPassword, confirmPassword });
  };

  return (
    <div className="auth-page auth-page--slid">
      {/* ── Left: Form Panel ── */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-inner">
          <div className="auth-brand">
            <h1 className="auth-brand__title">Señorito Café</h1>
            <p className="auth-brand__subtitle">Point of Sale and Inventory System</p>
          </div>

          <div className="auth-card">
            <h2 className="auth-card__heading">Reset your password</h2>
            <p className="auth-card__description">
              Enter your new password below. Make sure it's at least 6 characters long.
            </p>

            {error && (
              <div className="auth-error-msg">
                <i className="bi bi-exclamation-circle-fill"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} id="reset-form">
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="reset-new-password">
                  New Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="reset-new-password"
                    className="auth-input auth-input--password"
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowNew(!showNew)}
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showNew ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                  </button>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field__label" htmlFor="reset-confirm-password">
                  Confirm Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="reset-confirm-password"
                    className="auth-input auth-input--password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showConfirm ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" id="reset-submit">
                Reset Password
              </button>
            </form>

            <div className="auth-secondary-links">
              <Link to="/login" className="auth-link">
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Logo Panel ── */}
      <div className="auth-panel auth-panel--logo">
        <div className="auth-logo-content">
          <div className="auth-logo-circle">
            <img
              className="auth-logo-circle__img"
              src={senoritoLogo}
              alt="Señorito Café Logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
