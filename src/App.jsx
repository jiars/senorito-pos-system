import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import { SpeedInsights } from "@vercel/speed-insights/react";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <SpeedInsights />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
