import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { ConfirmProvider } from './context/ConfirmContext.tsx'
import { PromptProvider } from './context/PromptContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ConfirmProvider>
        <PromptProvider>
          <App />
        </PromptProvider>
      </ConfirmProvider>
    </AuthProvider>
  </StrictMode>,
)