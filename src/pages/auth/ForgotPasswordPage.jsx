import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import senoritoLogo from '../../assets/images/senorito_logo.png';
import './auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Forgot password submitted:', { email });
    setSent(true);
  };

  const handleResend = () => {
    console.log('Resend link clicked for:', email);
    setSent(false);
    setTimeout(() => setSent(true), 100);
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
            <h2 className="auth-card__heading">Forgot your password?</h2>
            <p className="auth-card__description">
              Enter the email address associated with your account and we'll send you a
              link to reset your password.
            </p>

            {sent && (
              <div className="auth-success-msg">
                <i className="bi bi-check-circle-fill"></i>
                <span>A password reset link has been sent to your email.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} id="forgot-form">
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="forgot-email">
                  Email
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="forgot-email"
                    className="auth-input"
                    type="email"
                    placeholder="staff@senoritocafe.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" id="forgot-submit">
                Send Link
              </button>
            </form>

            <div className="auth-secondary-links">
              <button type="button" className="auth-link auth-link--muted" onClick={handleResend}>
                Resend Link
              </button>
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

export default ForgotPasswordPage;
