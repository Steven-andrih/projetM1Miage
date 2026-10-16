import { useState } from 'react'
import { Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import FitScreenIcon from '@mui/icons-material/FitScreen'
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupportedOutlined'

const ZOOM_MIN = 1
const ZOOM_MAX = 4

/** Visionneuse d'image avec zoom (boutons ou molette + Ctrl) et défilement. */
export default function ImageZoomViewer({ src, alt, loading, error, height = 420 }) {
  const [zoom, setZoom] = useState(1)
  const changer = (delta) => setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + delta).toFixed(2))))

  return (
    <Box sx={{ position: 'relative', borderRadius: 3, bgcolor: '#1B2430', overflow: 'hidden' }}>
      <Box
        onWheel={(event) => {
          if (!event.ctrlKey) return
          event.preventDefault()
          changer(event.deltaY < 0 ? 0.25 : -0.25)
        }}
        sx={{
          height,
          overflow: zoom > 1 ? 'auto' : 'hidden',
          display: 'grid',
          placeItems: zoom > 1 ? 'start' : 'center',
        }}
      >
        {loading && <CircularProgress sx={{ color: '#fff' }} />}
        {!loading && error && (
          <Stack spacing={1} sx={{ alignItems: 'center', color: 'rgba(255,255,255,0.7)' }}>
            <ImageNotSupportedIcon />
            <Typography variant="body2">Document indisponible</Typography>
          </Stack>
        )}
        {!loading && !error && src && (
          <Box
            component="img"
            src={src}
            alt={alt}
            draggable={false}
            sx={{
              display: 'block',
              maxWidth: zoom === 1 ? '100%' : 'none',
              maxHeight: zoom === 1 ? height : 'none',
              width: zoom === 1 ? 'auto' : `${zoom * 100}%`,
              objectFit: 'contain',
              userSelect: 'none',
            }}
          />
        )}
      </Box>

      {src && !error && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            alignItems: 'center',
            position: 'absolute', right: 12, bottom: 12, px: 1, py: 0.5,
            borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.92)', boxShadow: 2,
          }}
        >
          <Tooltip title="Dézoomer">
            <span>
              <IconButton size="small" onClick={() => changer(-0.5)} disabled={zoom <= ZOOM_MIN} aria-label="dézoomer">
                <ZoomOutIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant="caption" sx={{ width: 40, textAlign: 'center', fontWeight: 600 }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <Tooltip title="Zoomer">
            <span>
              <IconButton size="small" onClick={() => changer(0.5)} disabled={zoom >= ZOOM_MAX} aria-label="zoomer">
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Ajuster">
            <IconButton size="small" onClick={() => setZoom(1)} aria-label="ajuster à la taille">
              <FitScreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      )}
    </Box>
  )
}
