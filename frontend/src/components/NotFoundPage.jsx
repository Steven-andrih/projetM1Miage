import { Box, Button, Stack, Typography } from '@mui/material'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
        <SearchOffIcon sx={{ fontSize: 56, color: 'secondary.main' }} />
        <Typography variant="h5" fontWeight={600}>
          Page introuvable
        </Typography>
        <Typography variant="body2" color="text.secondary">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </Stack>
    </Box>
  )
}
