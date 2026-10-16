import { Chip, Tooltip } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'

/** Badge « Vérifié » : identité du prestataire contrôlée par l'administration. */
export default function VerifiedBadge({ size = 'small', compact = false }) {
  if (compact) {
    return (
      <Tooltip title="Identité vérifiée par l'administration">
        <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main', verticalAlign: 'middle' }} aria-label="vérifié" />
      </Tooltip>
    )
  }
  return (
    <Tooltip title="Identité vérifiée par l'administration">
      <Chip
        icon={<VerifiedIcon />}
        label="Vérifié"
        size={size}
        sx={{
          bgcolor: 'rgba(74, 112, 169, 0.12)',
          color: 'primary.dark',
          '& .MuiChip-icon': { color: 'primary.main', fontSize: 16 },
        }}
      />
    </Tooltip>
  )
}
