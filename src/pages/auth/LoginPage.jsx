import { useState } from 'react';

import loginHeroPlaceholder from '../../assets/images/default_menu_picture.jpg';

import { useAuth } from '../../hooks/useAuth';

import AuthBrand from './components/AuthBrand';
import AuthLayout from './components/AuthLayout';
import LoginForm from './components/LoginForm';

import './login.css';

// Replace these placeholders with the three exported Figma photos when available.
const loginHeroSlides = [
  {
    id: 'login-hero-one',
    src: loginHeroPlaceholder,
    alt: 'A Señorito Café drink displayed on a wooden counter',
  },
  {
    id: 'login-hero-two',
    src: loginHeroPlaceholder,
    alt: 'A featured Señorito Café product',
  },
  {
    id: 'login-hero-three',
    src: loginHeroPlaceholder,
    alt: 'A selection from Señorito Café',
  },
];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setErrorMessage('');
    setIsLoggingIn(true);

    try {
      await login(email, password);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Invalid email or password. Please try again.');
      setIsLoggingIn(false);
    }
  };

  return (
    <AuthLayout heroSlides={loginHeroSlides}>
      <div className="w-full max-w-[500px]">
        <AuthBrand />
        <LoginForm
          email={email}
          password={password}
          showPassword={showPassword}
          errorMessage={errorMessage}
          isLoggingIn={isLoggingIn}
          rememberMe={rememberMe}
          onEmailChange={(event) => setEmail(event.target.value)}
          onPasswordChange={(event) => setPassword(event.target.value)}
          onRememberMeChange={(event) => setRememberMe(event.target.checked)}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onSubmit={handleSubmit}
        />
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
