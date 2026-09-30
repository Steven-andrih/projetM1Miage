import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StatusChip from '../../components/StatusChip'

export default function MissionDetailView({ mission, isPrestataire, onMarkTerminee, submitting }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <StatusChip status={mission.statut} />
          {isPrestataire && mission.statut === 'EN_COURS' && (
            <Button
              startIcon={<CheckCircleIcon />}
              variant="contained"
              size="small"
              onClick={onMarkTerminee}
              disabled={submitting}
            >
              {submitting ? 'Mise à jour…' : 'Marquer comme terminée'}
            </Button>
          )}
        </Stack>

        <Divider />

        {mission.demande && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Demande associée
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {mission.demande.titre}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {mission.demande.description}
            </Typography>
          </Box>
        )}

        {mission.proposition && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Proposition acceptée
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {mission.proposition.message}
            </Typography>
            {mission.proposition.tarif_propose && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Tarif : {Number(mission.proposition.tarif_propose).toLocaleString('fr-FR')} €
              </Typography>
            )}
          </Box>
        )}

        <Stack direction="row" spacing={4} flexWrap="wrap">
          {mission.date_debut && (
            <Typography variant="body2">
              Début : {new Date(mission.date_debut).toLocaleDateString('fr-FR')}
            </Typography>
          )}
          {mission.date_fin && (
            <Typography variant="body2">Fin : {new Date(mission.date_fin).toLocaleDateString('fr-FR')}</Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  )
}
