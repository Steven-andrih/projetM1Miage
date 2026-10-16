import { Avatar, alpha, useTheme } from '@mui/material'
import { mediaUrl } from '../utils/media'

/**
 * Avatar d'un utilisateur : sa photo de profil si elle existe, sinon son initiale.
 * `photo` est le chemin renvoyé par l'API (public, visible par tous).
 */
export default function UserAvatar({ photo, nom, size = 40, sx, variant = 'soft' }) {
  const theme = useTheme()
  const initiale = (nom || '?').trim()[0]?.toUpperCase() || '?'
  const couleurs =
    variant === 'filled'
      ? { bgcolor: 'primary.main', color: '#fff' }
      : { bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark' }

  return (
    <Avatar
      src={mediaUrl(photo) || undefined}
      alt={nom || ''}
      sx={{ width: size, height: size, fontSize: size * 0.4, fontWeight: 600, ...couleurs, ...sx }}
    >
      {initiale}
    </Avatar>
  )
}
