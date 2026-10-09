import { Typography, useTheme } from '@mui/material'
import { LineChart } from '@mui/x-charts/LineChart'
import { buildMonthlyDataset } from '../../utils/chartUtils'

/**
 * Courbe d'évolution mensuelle de l'activité (demandes créées, missions démarrées).
 * Props : demandes et missions = tableaux [{ mois: ISO, total: number }].
 */
export default function EvolutionMensuelleChart({ demandes, missions, height = 300 }) {
  const theme = useTheme()
  const dataset = buildMonthlyDataset({ demandes, missions })

  if (dataset.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        Aucune donnée.
      </Typography>
    )
  }

  return (
    <LineChart
      dataset={dataset}
      height={height}
      xAxis={[{ dataKey: 'label', scaleType: 'point' }]}
      yAxis={[{ min: 0, tickMinStep: 1 }]}
      series={[
        {
          dataKey: 'demandes',
          label: 'Demandes créées',
          color: theme.palette.primary.main,
          area: true,
          showMark: true,
          curve: 'monotoneX',
        },
        {
          dataKey: 'missions',
          label: 'Missions démarrées',
          color: theme.palette.secondary.main,
          showMark: true,
          curve: 'monotoneX',
        },
      ]}
      grid={{ horizontal: true }}
      margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
      sx={{
        '& .MuiLineChart-area': { fillOpacity: 0.15 },
      }}
    />
  )
}
