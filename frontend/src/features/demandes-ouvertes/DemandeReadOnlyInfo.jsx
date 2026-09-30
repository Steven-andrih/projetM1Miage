import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import PaidIcon from '@mui/icons-material/PaidOutlined';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import StatusChip from '../../components/StatusChip';

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ flex: '1 1 220px' }}
    >
      {icon}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function DemandeReadOnlyInfo({ demande }) {
  const budget =
    demande.budget_min || demande.budget_max
      ? `${demande.budget_min ? Number(demande.budget_min).toLocaleString('fr-FR') : '?'} € - ${
          demande.budget_max
            ? Number(demande.budget_max).toLocaleString('fr-FR')
            : '?'
        } €`
      : null;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
      <Stack spacing={3}>
        <StatusChip status={demande.statut} />

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {demande.description}
        </Typography>

        <Divider />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
          <InfoRow
            icon={<PaidIcon sx={{ color: 'secondary.main' }} />}
            label="Budget"
            value={budget}
          />
          <InfoRow
            icon={<PriorityHighIcon sx={{ color: 'secondary.main' }} />}
            label="Urgence"
            value={demande.urgence}
          />
          <InfoRow
            icon={<EventIcon sx={{ color: 'secondary.main' }} />}
            label="Date souhaitée"
            value={
              demande.date_souhaitee
                ? new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')
                : null
            }
          />
          <InfoRow
            icon={<LocationOnIcon sx={{ color: 'secondary.main' }} />}
            label="Adresse"
            value={demande.adresse}
          />
        </Box>
      </Stack>
    </Paper>
  );
}
