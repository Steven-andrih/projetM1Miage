import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material'
import { useAuth } from '../auth/useAuth'
import ProfilePhotoEditor from './ProfilePhotoEditor'

const ROLES = { CLIENT: 'Client', PRESTATAIRE: 'Prestataire', ADMIN: 'Administrateur' }

/** Fenêtre « Mon compte », ouverte depuis la barre latérale, disponible pour tous les rôles. */
export default function MonCompteDialog({ open, onClose }) {
  const { user, role } = useAuth()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mon compte</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          <ProfilePhotoEditor />
          <Divider />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Nom
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user?.nom || user?.username || '—'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Identifiant
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                @{user?.username}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Rôle
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {ROLES[role] || role}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  )
}
