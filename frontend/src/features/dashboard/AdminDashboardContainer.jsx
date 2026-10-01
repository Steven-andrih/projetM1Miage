import { useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import PercentIcon from '@mui/icons-material/Percent'
import TimerIcon from '@mui/icons-material/Timer'
import * as statistiquesApi from '../../api/statistiques.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import StatCard from '../../components/StatCard'
import DashboardGrid from './DashboardGrid'
import MiniBarList from './MiniBarList'

export default function AdminDashboardContainer() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    statistiquesApi
      .getDashboardAdmin()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Chargement du tableau de bord…" />
  if (error || !data) return <ErrorMessage message="Impossible de charger le tableau de bord." />

  const repartition = (data.repartition_geographique ?? []).map((item) => ({
    ville: item.client__ville || 'Non renseignée',
    total: item.total,
  }))
  const categories = (data.categories_les_plus_recherchees ?? []).map((item) => ({
    nom: item.service__categorie__nom || 'Non renseignée',
    total: item.total,
  }))

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue globale de la plateforme" />

      <DashboardGrid>
        <StatCard icon={<AssignmentIcon />} label="Demandes" value={data.nb_demandes ?? 0} />
        <StatCard icon={<WorkHistoryIcon />} label="Missions" value={data.nb_missions ?? 0} />
        <StatCard
          icon={<PercentIcon />}
          label="Taux d'acceptation"
          value={data.taux_acceptation_pct != null ? `${Math.round(data.taux_acceptation_pct)}%` : '—'}
        />
        <StatCard
          icon={<TimerIcon />}
          label="Délai moyen de réponse"
          value={data.delai_moyen_reponse_heures != null ? `${data.delai_moyen_reponse_heures.toFixed(1)} h` : '—'}
          color="secondary.main"
        />
      </DashboardGrid>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2.5 }}>
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Répartition géographique des demandes
          </Typography>
          <MiniBarList items={repartition} labelKey="ville" valueKey="total" emptyLabel="Aucune donnée." />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Catégories les plus recherchées
          </Typography>
          <MiniBarList items={categories} labelKey="nom" valueKey="total" emptyLabel="Aucune donnée." />
        </Paper>
      </Box>
    </>
  )
}
