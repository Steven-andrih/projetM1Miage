import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import * as statistiquesApi from '../../api/statistiques.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import StatCard from '../../components/StatCard'
import StatusChip from '../../components/StatusChip'
import DashboardGrid from './DashboardGrid'

export default function ClientDashboardContainer() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    statistiquesApi
      .getDashboardClient()
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
        <StatCard icon={<AssignmentIcon />} label="Demandes totales" value={data.nb_demandes_total ?? 0} />
        <StatCard icon={<WorkHistoryIcon />} label="Missions en cours" value={data.nb_missions_en_cours ?? 0} />
        <StatCard icon={<CheckCircleIcon />} label="Missions terminées" value={data.nb_missions_terminees ?? 0} />
        <StatCard
          icon={<PendingActionsIcon />}
          label="Propositions à traiter"
          value={data.propositions_en_attente_de_ma_decision ?? 0}
          color="secondary.main"
        />
      </DashboardGrid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Dernières demandes
      </Typography>
      {!data.dernieres_demandes || data.dernieres_demandes.length === 0 ? (
        <Typography color="text.secondary">Aucune demande récente.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 2 }}>
          {data.dernieres_demandes.map((demande) => (
            <Card variant="outlined" key={demande.id}>
              <CardActionArea onClick={() => navigate(`/client/demandes/${demande.id}`)}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {demande.titre}
                    </Typography>
                    <StatusChip status={demande.statut} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {demande.nb_propositions} proposition(s) reçue(s)
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}
    </>
  )
}
