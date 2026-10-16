import { useRef, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import * as usersApi from '../api/users.api'
import { useAuth } from '../auth/useAuth'
import { useToast } from './ToastProvider'
import UserAvatar from './UserAvatar'

const FORMATS = ['image/jpeg', 'image/png', 'image/webp']
const TAILLE_MAX = 5 * 1024 * 1024

/**
 * Envoi, remplacement et suppression de sa photo de profil (tous les rôles).
 * La photo est publique : elle apparaît partout où l'utilisateur est affiché.
 */
export default function ProfilePhotoEditor({ size = 96, compact = false }) {
  const { user, updateUser } = useAuth()
  const { showToast } = useToast()
  const inputRef = useRef(null)
  const [progression, setProgression] = useState(null)
  const [erreur, setErreur] = useState('')

  const enCours = progression !== null

  const choisir = async (fichier) => {
    setErreur('')
    if (!fichier) return
    if (!FORMATS.includes(fichier.type)) {
      setErreur('Format non accepté. Utilisez une image JPG, PNG ou WEBP.')
      return
    }
    if (fichier.size > TAILLE_MAX) {
      setErreur('Le fichier dépasse 5 Mo.')
      return
    }
    setProgression(0)
    try {
      const compte = await usersApi.envoyerPhoto(fichier, setProgression)
      updateUser({ photo: compte.photo })
      showToast('Photo de profil mise à jour.', 'success')
    } catch (err) {
      setErreur(err.response?.data?.photo?.[0] || "L'envoi de la photo a échoué.")
    } finally {
      setProgression(null)
    }
  }

  const retirer = async () => {
    setErreur('')
    setProgression(0)
    try {
      await usersApi.supprimerPhoto()
      updateUser({ photo: null })
      showToast('Photo de profil retirée.', 'info')
    } catch {
      setErreur('La suppression a échoué.')
    } finally {
      setProgression(null)
    }
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <UserAvatar photo={user?.photo} nom={user?.nom || user?.username} size={size} />
        {enCours && (
          <Box
            sx={{
              position: 'absolute', inset: 0, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.7)',
              display: 'grid', placeItems: 'center',
            }}
          >
            <CircularProgress size={28} variant={progression > 0 ? 'determinate' : 'indeterminate'} value={progression} />
          </Box>
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        {!compact && (
          <>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Photo de profil
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Visible par tous les utilisateurs de la plateforme. JPG, PNG ou WEBP, 5 Mo maximum.
            </Typography>
          </>
        )}
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PhotoCameraOutlinedIcon />}
            disabled={enCours}
            onClick={() => inputRef.current?.click()}
          >
            {user?.photo ? 'Changer la photo' : 'Ajouter une photo'}
          </Button>
          {user?.photo && (
            <Button size="small" color="error" startIcon={<DeleteOutlinedIcon />} disabled={enCours} onClick={retirer}>
              Retirer
            </Button>
          )}
        </Stack>
        <input
          ref={inputRef}
          type="file"
          accept={FORMATS.join(',')}
          hidden
          onChange={(event) => {
            choisir(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        {erreur && (
          <Alert severity="warning" sx={{ mt: 1.5 }}>
            {erreur}
          </Alert>
        )}
      </Box>
    </Stack>
  )
}
