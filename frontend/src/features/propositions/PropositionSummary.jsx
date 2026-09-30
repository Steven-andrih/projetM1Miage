import { Paper, Stack, Typography } from '@mui/material';
import StatusChip from '../../components/StatusChip';

export default function PropositionSummary({ proposition }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Votre proposition</Typography>
          <StatusChip status={proposition.statut} />
        </Stack>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {proposition.message}
        </Typography>
        {proposition.tarif_propose && (
          <Typography variant="body2" color="text.secondary">
            Tarif proposé :{' '}
            {Number(proposition.tarif_propose).toLocaleString('fr-FR')} €
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
