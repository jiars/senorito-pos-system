import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'

import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles/global.css';

import App from './App.jsx'
import { Toaster } from '@/components/ui/toast'
import { ERROR_FEEDBACK_POLICIES } from '@/utils/feedback/errorFeedback'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <Toaster timeout={ERROR_FEEDBACK_POLICIES.notification.duration} limit={3} />
  </QueryClientProvider>,
)
