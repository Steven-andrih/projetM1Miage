import { Card, CardActionArea, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useNavigate } from 'react-router-dom'

/**
 * Carte KPI. Avec `to` (route) ou `onClick`, la carte devient cliquable.
 * `hint` : petite ligne d'aide sous le libellé.
 */
export default function StatCard({ icon, label, value, color = 'primary.main', hint, to, onClick, valueVariant = 'h4' }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const [paletteKey, shade = 'main'] = String(color).split('.')
  const resolved = theme.palette[paletteKey]?.[shade] || theme.palette.primary.main
  const clickable = Boolean(to || onClick)

  const content = (
    <CardContent>
      <Stack spacing={2}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {icon && (
            <Stack
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: alpha(resolved, 0.12),
                color: resolved,
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': { fontSize: 20 },
              }}
            >
              {icon}
            </Stack>
          )}
          {clickable && <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
        </Stack>
        <Stack spacing={0.25}>
          <Typography
            variant={valueVariant}
            sx={{ fontVariantNumeric: 'tabular-nums', ...(valueVariant !== 'h4' && { color: resolved, fontWeight: 700 }) }}
          >
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {hint && (
            <Typography variant="caption" sx={{ color: resolved, fontWeight: 600 }}>
              {hint}
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardContent>
  )

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...(clickable && { '&:hover': { borderColor: resolved, boxShadow: 3 } }),
      }}
    >
      {clickable ? (
        <CardActionArea
          onClick={onClick || (() => navigate(to))}
          sx={{ height: '100%', alignItems: 'stretch' }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  )
}
