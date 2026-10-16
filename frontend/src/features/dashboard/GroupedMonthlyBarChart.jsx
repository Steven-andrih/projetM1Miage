import { Typography } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { buildMonthlyDataset } from '../../utils/chartUtils'

/**
 * Barres groupées par mois pour plusieurs séries.
 * series = [{ key, label, color, items: [{ mois, total }] }]
 */
export default function GroupedMonthlyBarChart({ series, height = 300 }) {
  const dataset = buildMonthlyDataset(Object.fromEntries(series.map((s) => [s.key, s.items])))

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
      xAxis={[{ dataKey: 'label', scaleType: 'band', categoryGapRatio: 0.35, barGapRatio: 0.15 }]}
      yAxis={[{ min: 0, tickMinStep: 1 }]}
      series={series.map((s) => ({ dataKey: s.key, label: s.label, color: s.color }))}
      borderRadius={4}
      grid={{ horizontal: true }}
      margin={{ left: 8, right: 8, top: 8, bottom: 8 }}
    />
  )
}
