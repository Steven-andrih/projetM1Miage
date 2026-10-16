import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Rating,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import StarIcon from '@mui/icons-material/Star'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import PaidIcon from '@mui/icons-material/Paid'
import PercentIcon from '@mui/icons-material/Percent'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ExploreIcon from '@mui/icons-material/Explore'
import SavingsIcon from '@mui/icons-material/Savings'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import * as statistiquesApi from '../../api/statistiques.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import StatCard from '../../components/StatCard'
import DashboardGrid from './DashboardGrid'
import StatusDonutChart from './StatusDonutChart'
import MonthlyBarChart from './MonthlyBarChart'
import { formatAriary, formatDate } from '../../utils/format'
import { VERIFICATION, statutVerification } from '../../utils/verification'
import UserAvatar from '../../components/UserAvatar'

const ETAPES_COMPLETUDE = [
  { cle: 'description', label: 'Ajouter une description', to: '/prestataire/profil' },
  { cle: 'adresse', label: 'Renseigner votre adresse', to: '/prestataire/profil' },
  { cle: 'position', label: 'Indiquer votre position sur la carte', to: '/prestataire/profil' },
  { cle: 'service', label: 'Proposer au moins un service', to: '/prestataire/services' },
  { cle: 'document', label: "Envoyer une pièce d'identité", to: '/prestataire/verification' },
]

function CompletudeCard({ completude }) {
  const navigate = useNavigate()
  const faites = ETAPES_COMPLETUDE.filter((e) => completude?.[e.cle]).length
  const pourcentage = Math.round((faites / ETAPES_COMPLETUDE.length) * 100)

  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Complétude du profil
        </Typography>
        <Typography variant="h6" sx={{ color: pourcentage === 100 ? 'success.main' : 'primary.main' }}>
          {pourcentage}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pourcentage}
        color={pourcentage === 100 ? 'success' : 'primary'}
        sx={{ height: 8, borderRadius: 4, my: 1.5 }}
      />
      <List dense disablePadding>
        {ETAPES_COMPLETUDE.map((etape) => {
          const fait = Boolean(completude?.[etape.cle])
          return (
            <ListItemButton
              key={etape.cle}
              onClick={() => navigate(etape.to)}
              disabled={fait}
              sx={{ px: 1, borderRadius: 2, '&.Mui-disabled': { opacity: 1 } }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {fait ? (
                  <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />
                ) : (
                  <RadioButtonUncheckedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={etape.label}
                slotProps={{ primary: {
                  variant: 'body2',
                  sx: fait ? { color: 'text.secondary', textDecoration: 'line-through' } : { fontWeight: 500 },
                } }}
              />
              {!fait && <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
            </ListItemButton>
          )
        })}
      </List>
    </Paper>
  )
}

function DerniersAvisCard({ avis }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
        Derniers avis reçus
      </Typography>
      {!avis || avis.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Vous n'avez pas encore reçu d'avis.
        </Typography>
      ) : (
        <Stack spacing={2} divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
          {avis.map((a) => (
            <Box key={a.id}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <UserAvatar photo={a.client_photo} nom={a.client} size={28} />
                <Rating value={a.note} readOnly size="small" sx={{ flexGrow: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDate(a.date_creation)}
                </Typography>
              </Stack>
              {a.commentaire && (
                <Typography variant="body2" sx={{ mt: 0.75 }}>
                  « {a.commentaire} »
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {a.client} · {a.demande}
              </Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  )
}

export default function PrestataireDashboardContainer() {
  const theme = useTheme()
  const navigate = useNavigate()
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

  const cleVerif = statutVerification(data.statut_validation, data.a_document)
  const verif = VERIFICATION[cleVerif]
  const opportunites = data.nb_opportunites_disponibles ?? 0

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre activité" />

      <DashboardGrid>
        <StatCard
          icon={<VerifiedUserIcon />}
          label="Vérification d'identité"
          value={verif.label}
          valueVariant="h6"
          color={`${verif.palette}.main`}
          hint={cleVerif === 'VERIFIE' ? 'Badge visible par les clients' : 'Compléter la vérification'}
          to="/prestataire/verification"
        />
        <StatCard
          icon={<ExploreIcon />}
          label="Opportunités ouvertes"
          value={opportunites}
          hint={opportunites > 0 ? 'Voir les demandes ouvertes' : undefined}
          to="/prestataire/demandes"
        />
        <StatCard icon={<WorkHistoryIcon />} label="Missions en cours" value={data.nb_missions_en_cours ?? 0} />
        <StatCard
          icon={<CheckCircleIcon />}
          label="Missions terminées"
          value={data.nb_missions_terminees ?? 0}
          color="success.main"
        />
        <StatCard
          icon={<StarIcon />}
          label={`Note moyenne (${data.nb_avis_recus ?? 0} avis)`}
          value={data.note_moyenne != null ? Number(data.note_moyenne).toFixed(1).replace('.', ',') : '—'}
          color="warning.main"
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
          value={formatAriary(data.revenu_total_estime)}
          color="secondary.main"
        />
        <StatCard
          icon={<SavingsIcon />}
          label="Revenu moyen par mission"
          value={formatAriary(data.revenu_moyen_par_mission)}
          color="secondary.main"
        />
      </DashboardGrid>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2.5,
          mb: 2.5,
        }}
      >
        <CompletudeCard completude={data.completude} />
        <DerniersAvisCard avis={data.derniers_avis} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '5fr 7fr' },
          gap: 2.5,
          mb: 2.5,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Mes propositions par statut
          </Typography>
          <StatusDonutChart counts={data.propositions_par_statut} centerLabel="propositions" />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Missions démarrées par mois
          </Typography>
          <MonthlyBarChart items={data.evolution_mensuelle_missions} label="Missions" />
        </Paper>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
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

      {opportunites > 0 && (
        <Button variant="outlined" onClick={() => navigate('/prestataire/demandes')}>
          Voir les {opportunites} demande(s) ouverte(s) sur vos services
        </Button>
      )}
    </>
  )
}
