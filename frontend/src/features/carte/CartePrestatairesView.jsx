import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Box, Chip, Paper, Stack, Typography } from '@mui/material'
import UserAvatar from '../../components/UserAvatar'
import VerifiedBadge from '../../components/VerifiedBadge'

// Icône par défaut Leaflet cassée sous bundler (Vite) sans ce correctif explicite.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ANTANANARIVO_CENTER = [-18.8792, 47.5079]

function FlyToPrestataire({ position }) {
  const map = useMap()
  if (position) map.flyTo(position, 14)
  return null
}

export default function CartePrestatairesView({ prestataires }) {
  const [focused, setFocused] = useState(null)

  const withCoords = prestataires.filter((p) => p.latitude && p.longitude)

  return (
    <Box sx={{ display: 'flex', gap: 2, height: '70vh', flexDirection: { xs: 'column', md: 'row' } }}>
      <Paper
        variant="outlined"
        sx={{ width: { xs: '100%', md: 320 }, flexShrink: 0, overflowY: 'auto', p: 1 }}
      >
        {withCoords.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            Aucun prestataire géolocalisé pour le moment.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {withCoords.map((p) => (
              <Paper
                key={p.id}
                variant="outlined"
                onClick={() => setFocused([Number(p.latitude), Number(p.longitude)])}
                sx={{
                  p: 1.5,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'background.default' },
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <UserAvatar photo={p.photo} nom={p.nom || p.username} size={40} />
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                        {p.nom || p.username} {p.verifie && <VerifiedBadge compact />}
                      </Typography>
                      <Chip
                        label={p.disponible ? 'Disponible' : 'Indisponible'}
                        size="small"
                        color={p.disponible ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {p.ville || 'Ville non renseignée'}
                      {p.annee_experience != null && ` · ${p.annee_experience} an(s) d'expérience`}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <Box sx={{ flexGrow: 1, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <MapContainer center={ANTANANARIVO_CENTER} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {focused && <FlyToPrestataire position={focused} />}
          {withCoords.map((p) => (
            <Marker key={p.id} position={[Number(p.latitude), Number(p.longitude)]}>
              <Popup>
                <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', minWidth: 180 }}>
                  <UserAvatar photo={p.photo} nom={p.nom || p.username} size={40} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {p.nom || p.username} {p.verifie && <VerifiedBadge compact />}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div">
                      {p.ville || 'Ville non renseignée'}
                      {p.annee_experience != null && ` · ${p.annee_experience} an(s)`}
                    </Typography>
                    <Typography variant="caption" sx={{ color: p.disponible ? 'success.main' : 'text.secondary', fontWeight: 600 }}>
                      {p.disponible ? 'Disponible' : 'Indisponible'}
                    </Typography>
                  </Box>
                </Stack>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  )
}
