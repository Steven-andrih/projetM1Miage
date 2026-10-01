import { CssBaseline, ThemeProvider } from '@mui/material'
import theme from './theme'
import { AuthProvider } from './auth/AuthContext'
import { ToastProvider } from './components/ToastProvider'
import ErrorBoundary from './components/ErrorBoundary'
import AppRouter from './app/AppRouter'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
