import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Avatar, Box, Chip, Paper, Rating, Stack, Typography, alpha, useTheme } from '@mui/material'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import WorkOutlineIcon from '@mui/icons-material/WorkOutlineOutlined'
import * as usersApi from '../../api/users.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import VerifiedBadge from '../../components/VerifiedBadge'
import { formatAriary, formatDate } from '../../utils/format'

function Bloc({ title, children }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      {children}
    </Paper>
  )
}

/** Profil public d'un prestataire, consulté par un client depuis une proposition. */
export default function PrestatairePublicContainer() {
  const { id } = useParams()
  const theme = useTheme()
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let annule = false
    usersApi
      .getPrestatairePublic(id)
      .then((data) => !annule && setProfil(data))
      .catch(() => !annule && setError(true))
      .finally(() => !annule && setLoading(false))
    return () => {
      annule = true
    }
  }, [id])

  if (loading) return <LoadingSpinner label="Chargement du profil…" />
  if (error || !profil) return <ErrorMessage message="Ce prestataire est introuvable ou n'est plus disponible." />

  return (
    <>
      <PageHeader title={profil.nom} subtitle="Profil du prestataire" showBack />

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2.5 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}>
          <Avatar
            sx={{ width: 72, height: 72, fontSize: '1.6rem', bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark' }}
          >
            {profil.nom?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h5">{profil.nom}</Typography>
              {profil.verifie && <VerifiedBadge />}
              <Chip
                size="small"
                label={profil.disponible ? 'Disponible' : 'Indisponible'}
                sx={{
                  bgcolor: profil.disponible ? 'rgba(47,158,110,0.12)' : 'rgba(107,114,128,0.12)',
                  color: profil.disponible ? 'success.main' : 'text.secondary',
                }}
              />
            </Stack>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', mt: 1, color: 'text.secondary' }} useFlexGap>
              {profil.ville && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <LocationOnOutlinedIcon fontSize="small" />
                  <Typography variant="body2">{profil.ville}</Typography>
                </Stack>
              )}
              <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                <WorkOutlineIcon fontSize="small" />
                <Typography variant="body2">{profil.annee_experience} an(s) d'expérience</Typography>
              </Stack>
              <Typography variant="body2">Membre depuis {formatDate(profil.membre_depuis)}</Typography>
            </Stack>
          </Box>
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            {profil.note_moyenne != null ? (
              <>
                <Typography variant="h4">{profil.note_moyenne.toFixed(1).replace('.', ',')}</Typography>
                <Rating value={profil.note_moyenne} precision={0.5} readOnly size="small" />
                <Typography variant="caption" color="text.secondary" component="div">
                  {profil.nb_avis} avis · {profil.missions.terminees} mission(s) terminée(s)
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Pas encore d'avis
              </Typography>
            )}
          </Box>
        </Stack>
        {profil.description && (
          <Typography variant="body1" sx={{ mt: 2.5, whiteSpace: 'pre-wrap' }}>
            {profil.description}
          </Typography>
        )}
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5, alignItems: 'start' }}>
        <Bloc title={`Services proposés (${profil.services.length})`}>
          {profil.services.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun service renseigné.
            </Typography>
          ) : (
            <Stack spacing={1.25}>
              {profil.services.map((s) => (
                <Stack
                  key={s.id}
                  direction="row"
                  spacing={2}
                  sx={{ justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: 2.5, bgcolor: 'background.default' }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                      {s.service}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.categorie}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                    {formatAriary(s.tarif_min)} – {formatAriary(s.tarif_max)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Bloc>

        <Bloc title="Avis des clients">
          {profil.avis.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun avis pour le moment.
            </Typography>
          ) : (
            <Stack spacing={2} divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
              {profil.avis.map((a) => (
                <Box key={a.id}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Rating value={a.note} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(a.date_creation)}
                    </Typography>
                  </Stack>
                  {a.commentaire && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      « {a.commentaire} »
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {a.client} · {a.demande}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Bloc>
      </Box>
    </>
  )
}
