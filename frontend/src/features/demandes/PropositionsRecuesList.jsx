import { Link as RouterLink } from 'react-router-dom'
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Rating,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlineOutlined'
import StatusChip from '../../components/StatusChip'
import VerifiedBadge from '../../components/VerifiedBadge'
import BudgetIndicator from '../../components/BudgetIndicator'
import { formatAriary, formatDate } from '../../utils/format'

function PrestataireEntete({ info, prestataireId }) {
  const theme = useTheme()
  const nom = info?.nom || `Prestataire #${prestataireId}`
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Avatar sx={{ width: 44, height: 44, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark' }}>
        {nom[0]?.toUpperCase()}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
            {nom}
          </Typography>
          {info?.verifie && <VerifiedBadge />}
        </Stack>
        <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {info?.note_moyenne != null ? (
            <>
              <Rating value={info.note_moyenne} precision={0.5} readOnly size="small" />
              <Typography variant="caption" color="text.secondary">
                {info.note_moyenne.toFixed(1).replace('.', ',')} · {info.nb_avis} avis
              </Typography>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Pas encore d'avis
            </Typography>
          )}
          {info && (
            <Typography variant="caption" color="text.secondary">
              · {info.annee_experience} an(s) d'expérience
              {info.ville ? ` · ${info.ville}` : ''}
            </Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  )
}

export default function PropositionsRecuesList({ propositions, demande, onAccept, onRefuse, onDiscuss }) {
  if (propositions.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Aucune proposition reçue pour le moment.
      </Typography>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
      {propositions.map((proposition) => {
        const enAttente = proposition.statut === 'EN_ATTENTE'
        const nonLus = proposition.conversation?.non_lus || 0
        return (
          <Card key={proposition.id} variant="outlined">
            <CardContent>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' } }}
              >
                <PrestataireEntete info={proposition.prestataire_info} prestataireId={proposition.prestataire} />
                <StatusChip status={proposition.statut} />
              </Stack>

              <Typography variant="body2" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {proposition.message}
              </Typography>

              <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" component="div">
                    Tarif proposé
                  </Typography>
                  <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                    {formatAriary(proposition.tarif_propose)}
                  </Typography>
                </Box>
                <BudgetIndicator
                  tarif={proposition.tarif_propose}
                  budgetMin={demande?.budget_min}
                  budgetMax={demande?.budget_max}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Reçue le {formatDate(proposition.date_proposition)}
                </Typography>
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}
              >
                <Button
                  size="small"
                  component={RouterLink}
                  to={`/client/prestataires/${proposition.prestataire}`}
                  startIcon={<PersonOutlineIcon />}
                >
                  Voir le profil
                </Button>
                <Badge color="error" badgeContent={nonLus} invisible={nonLus === 0}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ChatBubbleOutlineIcon />}
                    onClick={() => onDiscuss(proposition.id)}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Discuter
                  </Button>
                </Badge>
                <Box sx={{ flexGrow: 1 }} />
                {enAttente && (
                  <>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<CloseIcon />}
                      onClick={() => onRefuse(proposition.id)}
                    >
                      Refuser
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => onAccept(proposition.id)}
                    >
                      Accepter
                    </Button>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        )
      })}
    </Box>
  )
}
