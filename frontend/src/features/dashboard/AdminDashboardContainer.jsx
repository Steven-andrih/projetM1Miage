import { useEffect, useState } from 'react'
import { Box, Paper, Typography, useTheme } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import PercentIcon from '@mui/icons-material/Percent'
import TimerIcon from '@mui/icons-material/Timer'
import GroupsIcon from '@mui/icons-material/Groups'
import HandymanIcon from '@mui/icons-material/Handyman'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
import SyncAltIcon from '@mui/icons-material/SyncAlt'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import * as statistiquesApi from '../../api/statistiques.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import StatCard from '../../components/StatCard'
import DashboardGrid from './DashboardGrid'
import MiniBarList from './MiniBarList'
import EvolutionMensuelleChart from './EvolutionMensuelleChart'
import StatusDonutChart from './StatusDonutChart'
import GroupedMonthlyBarChart from './GroupedMonthlyBarChart'

function formatDuree(heures) {
  if (heures == null) return '—'
  if (heures >= 48) return `${(heures / 24).toFixed(1).replace('.', ',')} j`
  return `${heures.toFixed(1).replace('.', ',')} h`
}

function SectionTitle({ children }) {
  return (
    <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', fontWeight: 600, mb: 1.5 }}>
      {children}
    </Typography>
  )
}

function ChartCard({ title, subtitle, children, sx }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, ...sx }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
      <Box sx={{ mt: 2 }}>{children}</Box>
    </Paper>
  )
}

export default function AdminDashboardContainer() {
  const theme = useTheme()
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

  const tauxConversion = data.nb_demandes ? Math.round((data.nb_missions / data.nb_demandes) * 100) : null
  const enAttente = data.nb_prestataires_en_attente ?? 0

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue globale de la plateforme" />

      <SectionTitle>Communauté</SectionTitle>
      <DashboardGrid>
        <StatCard
          icon={<GroupsIcon />}
          label="Clients"
          value={data.nb_clients ?? 0}
          to="/admin/utilisateurs?role=CLIENT"
        />
        <StatCard
          icon={<HandymanIcon />}
          label="Prestataires"
          value={data.nb_prestataires ?? 0}
          to="/admin/utilisateurs?role=PRESTATAIRE"
        />
        <StatCard
          icon={<FactCheckIcon />}
          label="Prestataires en attente de validation"
          value={enAttente}
          color={enAttente > 0 ? 'warning.main' : 'success.main'}
          hint={enAttente > 0 ? 'Vérifier les documents' : 'Aucune vérification en attente'}
          to="/admin/verifications"
        />
      </DashboardGrid>

      <SectionTitle>Activité</SectionTitle>
      <DashboardGrid>
        <StatCard icon={<AssignmentIcon />} label="Demandes" value={data.nb_demandes ?? 0} />
        <StatCard icon={<WorkHistoryIcon />} label="Missions" value={data.nb_missions ?? 0} />
        <StatCard
          icon={<TaskAltIcon />}
          label="Missions terminées"
          value={data.missions_terminees ?? 0}
          color="success.main"
        />
        <StatCard
          icon={<SyncAltIcon />}
          label="Taux de conversion"
          value={tauxConversion != null ? `${tauxConversion}%` : '—'}
          hint="Missions ÷ demandes"
        />
        <StatCard
          icon={<PercentIcon />}
          label="Taux d'acceptation"
          value={data.taux_acceptation_pct != null ? `${Math.round(data.taux_acceptation_pct)}%` : '—'}
        />
        <StatCard
          icon={<TimerIcon />}
          label="Délai moyen de réponse"
          value={formatDuree(data.delai_moyen_reponse_heures)}
          color="secondary.main"
        />
        <StatCard
          icon={<HourglassBottomIcon />}
          label="Temps moyen de réalisation"
          value={formatDuree(data.temps_moyen_realisation_heures)}
          color="secondary.main"
        />
      </DashboardGrid>

      <ChartCard title="Évolution mensuelle de l'activité" sx={{ mb: 2.5 }}>
        <EvolutionMensuelleChart
          demandes={data.evolution_mensuelle}
          missions={data.evolution_mensuelle_missions}
          terminees={data.evolution_mensuelle_missions_terminees}
        />
      </ChartCard>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2.5,
          mb: 2.5,
        }}
      >
        <ChartCard title="Missions par statut" subtitle="Santé globale de l'activité">
          <StatusDonutChart counts={data.missions_par_statut} centerLabel="missions" />
        </ChartCard>
        <ChartCard title="Demandes par statut">
          <StatusDonutChart counts={data.demandes_par_statut} centerLabel="demandes" />
        </ChartCard>
      </Box>

      <ChartCard
        title="Demandes et missions par mois"
        subtitle="Repérer les mois où les demandes ne se transforment pas en missions"
        sx={{ mb: 2.5 }}
      >
        <GroupedMonthlyBarChart
          series={[
            {
              key: 'demandes',
              label: 'Demandes créées',
              color: theme.palette.primary.main,
              items: data.evolution_mensuelle,
            },
            {
              key: 'missions',
              label: 'Missions créées',
              color: theme.palette.secondary.main,
              items: data.evolution_mensuelle_missions,
            },
            {
              key: 'terminees',
              label: 'Missions terminées',
              color: theme.palette.success.main,
              items: data.evolution_mensuelle_missions_terminees,
            },
          ]}
        />
      </ChartCard>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2.5 }}>
        <ChartCard title="Répartition géographique des demandes">
          <MiniBarList items={repartition} labelKey="ville" valueKey="total" emptyLabel="Aucune donnée." />
        </ChartCard>
        <ChartCard title="Catégories les plus recherchées">
          <MiniBarList items={categories} labelKey="nom" valueKey="total" emptyLabel="Aucune donnée." />
        </ChartCard>
      </Box>
    </>
  )
}
