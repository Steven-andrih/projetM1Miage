import { useEffect, useState } from 'react'
import { Typography } from '@mui/material'
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

export default function PrestataireDashboardContainer() {
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

      {data.nb_opportunites_disponibles != null && (
        <Typography color="text.secondary">
          {data.nb_opportunites_disponibles} opportunité(s) disponible(s) sur vos services — consultez «
          Demandes ouvertes ».
        </Typography>
      )}
    </>
  )
}
