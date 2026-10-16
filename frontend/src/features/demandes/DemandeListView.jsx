import { Box, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined'
import EventIcon from '@mui/icons-material/EventOutlined'
import PaidIcon from '@mui/icons-material/PaidOutlined'
import InboxIcon from '@mui/icons-material/Inbox'
import StatusChip from '../../components/StatusChip'
import { formatAriaryRange } from '../../utils/format'

function formatBudget(min, max) {
  return formatAriaryRange(min, max)
}

export default function DemandeListView({ demandes, onOpen }) {
  if (demandes.length === 0) {
    return (
      <Stack spacing={1.5} sx={{ alignItems: 'center', py: 10, color: 'text.secondary' }}>
        <InboxIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
        <Typography variant="body1">Aucune demande ne correspond à ces critères.</Typography>
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 2.5,
        alignItems: 'stretch',
      }}
    >
      {demandes.map((demande) => {
        const budget = formatBudget(demande.budget_min, demande.budget_max)
        return (
          <Card
            key={demande.id}
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              transition: 'box-shadow 0.2s, transform 0.2s',
              '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
            }}
          >
            <CardActionArea
              onClick={() => onOpen(demande.id)}
              sx={{
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                height: '100%',
              }}
            >
              <CardContent sx={{ width: '100%' }}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, pr: 1 }}>
                    {demande.titre}
                  </Typography>
                  <StatusChip status={demande.statut} />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {demande.description}
                </Typography>

                <Stack spacing={0.75} sx={{ mt: 2 }}>
                  {budget && (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <PaidIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      <Typography variant="body2">{budget}</Typography>
                    </Stack>
                  )}
                  {demande.adresse && (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <LocationOnIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      <Typography variant="body2" noWrap>
                        {demande.adresse}
                      </Typography>
                    </Stack>
                  )}
                  {demande.date_souhaitee && (
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      <EventIcon fontSize="small" sx={{ color: 'secondary.main' }} />
                      <Typography variant="body2">
                        {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        )
      })}
    </Box>
  )
}
