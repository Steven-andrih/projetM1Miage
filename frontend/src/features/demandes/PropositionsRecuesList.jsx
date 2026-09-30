import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StatusChip from '../../components/StatusChip'

export default function PropositionsRecuesList({ propositions, onAccept }) {
  if (propositions.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Aucune proposition reçue pour le moment.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
      {propositions.map((proposition) => (
        <Card key={proposition.id} variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Typography variant="subtitle2" fontWeight={600}>
                Prestataire #{proposition.prestataire}
              </Typography>
              <StatusChip status={proposition.statut} />
            </Stack>
            <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
              {proposition.message}
            </Typography>
            {proposition.tarif_propose && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tarif proposé : {Number(proposition.tarif_propose).toLocaleString('fr-FR')} €
              </Typography>
            )}
            {proposition.statut === 'EN_ATTENTE' && (
              <Button
                startIcon={<CheckCircleIcon />}
                variant="contained"
                size="small"
                sx={{ mt: 2 }}
                onClick={() => onAccept(proposition.id)}
              >
                Accepter cette proposition
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  )
}
