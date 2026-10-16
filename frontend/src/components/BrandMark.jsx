import { Box } from '@mui/material'

/**
 * Pictogramme de la marque : un carré arrondi dégradé avec un « J » stylisé.
 * Utilisé dans la sidebar et sur les pages d'authentification.
 */
export default function BrandMark({ size = 40, light = false }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        borderRadius: size / 3.2,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: light
          ? 'rgba(255,255,255,0.18)'
          : 'linear-gradient(135deg, #4A70A9 0%, #8FABD4 100%)',
        color: '#FFFFFF',
        fontWeight: 800,
        fontSize: size * 0.5,
        letterSpacing: '-0.04em',
        boxShadow: light ? 'none' : '0 6px 14px rgba(74, 112, 169, 0.25)',
        border: light ? '1px solid rgba(255,255,255,0.28)' : 'none',
      }}
    >
      J
    </Box>
  )
}
