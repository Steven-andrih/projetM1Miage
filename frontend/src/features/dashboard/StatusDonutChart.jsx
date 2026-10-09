import { Box, Stack, Typography, useTheme } from '@mui/material'
import { PieChart } from '@mui/x-charts/PieChart'
import { getStatusConfig, getStatusColor } from '../../utils/statusConfig'
import { statusCountsToArray } from '../../utils/chartUtils'

/**
 * Anneau de répartition par statut.
 * Props : counts = { STATUT: nombre }, centerLabel = texte sous le total.
 */
export default function StatusDonutChart({ counts, centerLabel = 'au total', height = 240 }) {
  const theme = useTheme()
  const items = statusCountsToArray(counts)
  const total = items.reduce((acc, item) => acc + item.total, 0)

  if (total === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        Aucune donnée.
      </Typography>
    )
  }

  const data = items.map((item) => ({
    id: item.status,
    value: item.total,
    label: getStatusConfig(item.status).label,
    color: getStatusColor(theme, item.status),
  }))

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
      <Box sx={{ position: 'relative', flexShrink: 0 }}>
        <PieChart
          series={[
            {
              data,
              innerRadius: 62,
              outerRadius: 90,
              paddingAngle: 2,
              cornerRadius: 6,
              highlightScope: { fade: 'global', highlight: 'item' },
              valueFormatter: (item) => `${item.value}`,
            },
          ]}
          width={200}
          height={height}
          hideLegend
          margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h4" sx={{ lineHeight: 1 }}>
            {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {centerLabel}
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1} sx={{ flexGrow: 1, width: '100%' }}>
        {data.map((item) => (
          <Stack key={item.id} direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {item.label}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {item.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ width: 40, textAlign: 'right' }}>
              {Math.round((item.value / total) * 100)}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  )
}
