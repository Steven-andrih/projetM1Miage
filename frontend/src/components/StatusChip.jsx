import { Chip, alpha, useTheme } from '@mui/material';
import { getStatusConfig, getStatusColor } from '../utils/statusConfig';

export default function StatusChip({ status }) {
  const theme = useTheme();
  const config = getStatusConfig(status);
  const main = getStatusColor(theme, status);

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        bgcolor: alpha(main, 0.12),
        color: config.palette ? main : 'text.primary',
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  );
}
