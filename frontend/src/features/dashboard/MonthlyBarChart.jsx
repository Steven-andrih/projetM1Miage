import { Typography, useTheme } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { buildMonthlyDataset } from '../../utils/chartUtils'

/**
 * Barres mensuelles d'une série ({ mois, total }[]).
 * Props : items, label (nom de la série), formatValue (affichage des valeurs), color.
 */
export default function MonthlyBarChart({ items, label, formatValue, color, height = 260 }) {
  const theme = useTheme()
  const dataset = buildMonthlyDataset({ valeur: items })

  if (dataset.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        Aucune donnée.
      </Typography>
    )
  }

  return (
    <BarChart
      dataset={dataset}
      height={height}
      xAxis={[{ dataKey: 'label', scaleType: 'band', categoryGapRatio: 0.45 }]}
      yAxis={[{ min: 0, tickMinStep: 1 }]}
      series={[
        {
          dataKey: 'valeur',
          label,
          color: color || theme.palette.primary.main,
          valueFormatter: (value) => (formatValue ? formatValue(value) : `${value ?? 0}`),
        },
      ]}
      borderRadius={6}
      grid={{ horizontal: true }}
      hideLegend
      margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
    />
  )
}
