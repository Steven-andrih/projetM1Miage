import { Component } from 'react'
import { Box, Button, Stack, Typography } from '@mui/material'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Erreur applicative non gérée :', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 3,
          }}
        >
          <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center', maxWidth: 420 }}>
            <ReportProblemIcon sx={{ fontSize: 56, color: 'secondary.main' }} />
            <Typography variant="h6">Une erreur inattendue est survenue</Typography>
            <Typography variant="body2" color="text.secondary">
              Essayez de recharger la page. Si le problème persiste, contactez le support.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Recharger la page
            </Button>
          </Stack>
        </Box>
      )
    }
    return this.props.children
  }
}
