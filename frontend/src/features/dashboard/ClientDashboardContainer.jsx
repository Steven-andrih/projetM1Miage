import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardActionArea, CardContent, List, ListItemButton, ListItemIcon, ListItemText, Paper, Stack, Typography } from '@mui/material'
import { formatDate } from '../../utils/format'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ChatBubbleIcon from '@mui/icons-material/ChatBubble'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import * as statistiquesApi from '../../api/statistiques.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import StatCard from '../../components/StatCard'
import StatusChip from '../../components/StatusChip'
import DashboardGrid from './DashboardGrid'
import StatusDonutChart from './StatusDonutChart'
import MonthlyBarChart from './MonthlyBarChart'
import UserAvatar from '../../components/UserAvatar'

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
          to={data.propositions_en_attente_de_ma_decision ? '/client/demandes' : undefined}
        />
        <StatCard
          icon={<ChatBubbleIcon />}
          label="Messages non lus"
          value={data.messages_non_lus ?? 0}
          color={data.messages_non_lus ? 'error.main' : 'primary.main'}
          hint={data.messages_non_lus ? 'Ne ratez pas une réponse' : undefined}
          to="/client/messages"
        />
      </DashboardGrid>

      {data.missions_a_noter?.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 2.5 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
            <RateReviewOutlinedIcon sx={{ color: 'warning.main' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Missions à noter ({data.nb_missions_a_noter})
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Votre avis aide les autres clients à choisir le bon prestataire.
          </Typography>
          <List dense disablePadding>
            {data.missions_a_noter.map((mission) => (
              <ListItemButton
                key={mission.id}
                onClick={() => navigate(`/client/missions/${mission.id}`)}
                sx={{ borderRadius: 2, px: 1 }}
              >
                <UserAvatar photo={mission.prestataire_photo} nom={mission.prestataire} size={32} sx={{ mr: 1.5 }} />
                <ListItemText
                  primary={mission.titre}
                  secondary={`${mission.prestataire} · terminée le ${formatDate(mission.date_fin)}`}
                  slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 600 } } }}
                />
                <ListItemIcon sx={{ minWidth: 0 }}>
                  <ChevronRightIcon fontSize="small" />
                </ListItemIcon>
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
          gap: 2.5,
          mb: 4,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Mes demandes par statut
          </Typography>
          <StatusDonutChart counts={data.demandes_par_statut} centerLabel="demandes" />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Demandes créées par mois
          </Typography>
          <MonthlyBarChart items={data.evolution_mensuelle} label="Demandes" />
        </Paper>
      </Box>

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
                  <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
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
