import { Chip } from '@mui/material';

// Regroupe les statuts de toutes les ressources (demandes, propositions, missions)
const STATUS_COLORS = {
  BROUILLON: 'default',
  PUBLIEE: 'info',
  EN_COURS: 'warning',
  TERMINEE: 'success',
  ANNULEE: 'error',
  EN_ATTENTE: 'warning',
  ACCEPTEE: 'success',
  REFUSEE: 'error',
};

export default function StatusChip({ status }) {
  return (
    <Chip
      label={status}
      size="small"
      color={STATUS_COLORS[status] || 'default'}
    />
  );
}
