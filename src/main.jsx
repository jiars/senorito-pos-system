import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'

import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/global.css';

import App from './App.jsx'
import { Toaster } from '@/components/ui/toast'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster timeout={4000} limit={3} />
    </QueryClientProvider>
  </StrictMode>,
)
