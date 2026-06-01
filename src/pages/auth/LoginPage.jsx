import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import senoritoLogo from '../../assets/images/senorito_logo.png';
import './auth.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', { email, password });
    navigate('/dashboard');
  };

  return (
    <div className="auth-page auth-page--login">
      {/* ── Left: Form Panel ── */}
      <div className="auth-panel auth-panel--form">
        <div className="auth-form-inner">
          <div className="auth-brand">
            <h1 className="auth-brand__title">Señorito Café</h1>
            <p className="auth-brand__subtitle">Point of Sale and Inventory System</p>
          </div>

          <div className="auth-card">
            <h2 className="auth-card__heading">Login to your account to continue</h2>

            <form onSubmit={handleSubmit} id="login-form">
              <div className="auth-field">
                <label className="auth-field__label" htmlFor="login-email">
                  Email/Username
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="login-email"
                    className="auth-input"
                    type="text"
                    placeholder="Enter your username or email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field__label" htmlFor="login-password">
                  Password
                </label>
                <div className="auth-input-wrapper">
                  <input
                    id="login-password"
                    className="auth-input auth-input--password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                  </button>
                </div>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" className="auth-submit-btn" id="login-submit">
                Login
              </button>
            </form>
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

export default LoginPage;
