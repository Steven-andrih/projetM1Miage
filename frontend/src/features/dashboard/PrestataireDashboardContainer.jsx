import { useEffect, useState } from 'react'
import { Box, Paper, Typography, useTheme } from '@mui/material'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StarIcon from '@mui/icons-material/Star'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import PaidIcon from '@mui/icons-material/Paid'
import PercentIcon from '@mui/icons-material/Percent'
import * as statistiquesApi from '../../api/statistiques.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import StatCard from '../../components/StatCard'
import DashboardGrid from './DashboardGrid'
import StatusDonutChart from './StatusDonutChart'
import MonthlyBarChart from './MonthlyBarChart'

const formatAriary = (value) => `${Number(value ?? 0).toLocaleString('fr-FR')} €`

export default function PrestataireDashboardContainer() {
  const theme = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    statistiquesApi
      .getDashboardPrestataire()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Chargement du tableau de bord…" />
  if (error || !data) return <ErrorMessage message="Impossible de charger votre tableau de bord." />

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre activité" />

      <DashboardGrid>
        <StatCard icon={<WorkHistoryIcon />} label="Missions en cours" value={data.nb_missions_en_cours ?? 0} />
        <StatCard icon={<CheckCircleIcon />} label="Missions terminées" value={data.nb_missions_terminees ?? 0} />
        <StatCard
          icon={<StarIcon />}
          label={`Note moyenne (${data.nb_avis_recus ?? 0} avis)`}
          value={data.note_moyenne != null ? Number(data.note_moyenne).toFixed(1) : '—'}
          color="secondary.main"
        />
        <StatCard icon={<PendingActionsIcon />} label="Propositions en attente" value={data.propositions_en_attente ?? 0} />
        <StatCard
          icon={<PercentIcon />}
          label="Taux d'acceptation"
          value={data.taux_acceptation_pct != null ? `${Math.round(data.taux_acceptation_pct)}%` : '—'}
        />
        <StatCard
          icon={<PaidIcon />}
          label="Revenu estimé"
          value={
            data.revenu_total_estime != null
              ? `${Number(data.revenu_total_estime).toLocaleString('fr-FR')} €`
              : '—'
          }
          color="secondary.main"
        />
      </DashboardGrid>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
          gap: 2.5,
          mb: 2.5,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Mes propositions par statut
          </Typography>
          <StatusDonutChart counts={data.propositions_par_statut} centerLabel="propositions" />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            Missions démarrées par mois
          </Typography>
          <MonthlyBarChart items={data.evolution_mensuelle_missions} label="Missions" />
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
          Revenus des missions terminées par mois
        </Typography>
        <MonthlyBarChart
          items={data.revenus_par_mois}
          label="Revenus"
          formatValue={formatAriary}
          color={theme.palette.secondary.main}
          height={220}
        />
      </Paper>

      {data.nb_opportunites_disponibles != null && (
        <Typography color="text.secondary">
          {data.nb_opportunites_disponibles} opportunité(s) disponible(s) sur vos services — consultez «
          Demandes ouvertes ».
        </Typography>
      )}
    </>
  )
}
