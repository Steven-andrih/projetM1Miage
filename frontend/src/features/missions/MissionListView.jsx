import { Box, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'
import StatusChip from '../../components/StatusChip'

export default function MissionListView({ missions, onOpen }) {
  if (missions.length === 0) {
    return (
      <Stack alignItems="center" spacing={1.5} sx={{ py: 10, color: 'text.secondary' }}>
        <InboxIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
        <Typography variant="body1">Aucune mission pour le moment.</Typography>
      </Stack>
    )
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 2.5 }}>
      {missions.map((mission) => (
        <Card key={mission.id} variant="outlined">
          <CardActionArea onClick={() => onOpen(mission.id)} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {mission.titreDemande || `Mission #${mission.id}`}
                </Typography>
                <StatusChip status={mission.statut} />
              </Stack>
              {mission.date_debut && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Début : {new Date(mission.date_debut).toLocaleDateString('fr-FR')}
                </Typography>
              )}
              {mission.date_fin && (
                <Typography variant="body2" color="text.secondary">
                  Fin : {new Date(mission.date_fin).toLocaleDateString('fr-FR')}
                </Typography>
              )}
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  )
}
