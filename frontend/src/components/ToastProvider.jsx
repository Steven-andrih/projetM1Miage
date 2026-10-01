import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { subscribeToast } from '../utils/toastBus'

const ToastContext = createContext(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast doit être utilisé à l\'intérieur d\'un <ToastProvider>')
  return ctx
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, severity = 'success') => {
    setToast({ message, severity })
  }, [])

  useEffect(() => {
    // Permet à axiosClient.js (hors arbre React) de déclencher un toast
    // en cas d'erreur réseau globale (ex. serveur injoignable).
    return subscribeToast(({ message, severity }) => showToast(message, severity))
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  )
}
