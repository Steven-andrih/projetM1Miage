import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Badge,
  Box,
  List,
  ListItemButton,
  Paper,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import * as messagerieApi from '../../api/messagerie.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import StatusChip from '../../components/StatusChip'
import VerifiedBadge from '../../components/VerifiedBadge'
import { useAuth } from '../../auth/useAuth'
import { formatJourRelatif } from '../../utils/format'
import ChatThread from './ChatThread'
import UserAvatar from '../../components/UserAvatar'

const POLLING_LISTE_MS = 10000

function apercuMessage(conversation) {
  const dernier = conversation.dernier_message
  if (!dernier) return 'Aucun message pour le moment'
  if (dernier.type === 'SYSTEME') return dernier.contenu
  return `${dernier.est_moi ? 'Vous : ' : ''}${dernier.contenu}`
}

function ConversationItem({ conversation, active, readOnly, onClick }) {
  const theme = useTheme()
  const titre = readOnly
    ? `${conversation.client.nom} ↔ ${conversation.prestataire.nom}`
    : conversation.mon_role === 'PRESTATAIRE'
      ? conversation.client.nom
      : conversation.prestataire.nom
  const nonLus = conversation.non_lus || 0
  const photo = readOnly
    ? conversation.client.photo
    : conversation.mon_role === 'PRESTATAIRE'
      ? conversation.client.photo
      : conversation.prestataire.photo

  return (
    <ListItemButton
      onClick={onClick}
      selected={active}
      sx={{
        alignItems: 'flex-start',
        gap: 1.5,
        py: 1.5,
        px: 1.5,
        borderRadius: 2.5,
        '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.12) },
      }}
    >
      <Badge color="error" variant="dot" invisible={nonLus === 0} overlap="circular">
        <UserAvatar photo={photo} nom={titre} size={42} />
      </Badge>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle2" noWrap sx={{ flexGrow: 1, fontWeight: nonLus ? 700 : 600 }}>
            {titre}
            {!readOnly && conversation.mon_role === 'CLIENT' && conversation.prestataire.verifie && (
              <Box component="span" sx={{ ml: 0.5 }}>
                <VerifiedBadge compact />
              </Box>
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
            {formatJourRelatif(conversation.dernier_message?.date_envoi || conversation.date_creation)}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap component="div">
          {conversation.demande.titre}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
          <Typography
            variant="body2"
            noWrap
            sx={{ flexGrow: 1, color: nonLus ? 'text.primary' : 'text.secondary', fontWeight: nonLus ? 600 : 400 }}
          >
            {apercuMessage(conversation)}
          </Typography>
          {nonLus > 0 && (
            <Box
              sx={{
                minWidth: 20, height: 20, px: 0.75, borderRadius: 10, bgcolor: 'error.main', color: '#fff',
                fontSize: '0.7rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {nonLus}
            </Box>
          )}
        </Stack>
        <Box sx={{ mt: 0.75 }}>
          <StatusChip status={conversation.proposition.statut} />
        </Box>
      </Box>
    </ListItemButton>
  )
}

/** Page « Messages » : liste des conversations et fil sélectionné (lecture seule pour l'admin). */
export default function MessagerieContainer() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const { id } = useParams()
  const { role } = useAuth()
  const readOnly = role === 'ADMIN'
  const basePath = `/${(role || 'client').toLowerCase()}/messages`
  const selectionId = id ? Number(id) : null

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const charger = useCallback(
    () =>
      messagerieApi
        .getConversations()
        .then((data) => {
          setConversations(data)
          setError(false)
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    const premier = setTimeout(charger, 0)
    const intervalle = setInterval(() => {
      if (document.visibilityState === 'visible') charger()
    }, POLLING_LISTE_MS)
    return () => {
      clearTimeout(premier)
      clearInterval(intervalle)
    }
  }, [charger])

  // Sur ordinateur, ouvrir automatiquement la conversation la plus récente
  useEffect(() => {
    if (!isMobile && !selectionId && conversations.length > 0) {
      navigate(`${basePath}/${conversations[0].id}`, { replace: true })
    }
  }, [isMobile, selectionId, conversations, basePath, navigate])

  const ouvrir = (conversationId) => navigate(`${basePath}/${conversationId}`)

  const liste = (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 1 }}>
      {conversations.length === 0 ? (
        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 8, px: 2, color: 'text.secondary', textAlign: 'center' }}>
          <ChatBubbleOutlineIcon sx={{ fontSize: 44, color: 'secondary.main' }} />
          <Typography variant="body2">
            {readOnly
              ? 'Aucune conversation sur la plateforme.'
              : role === 'CLIENT'
                ? 'Aucune conversation. Utilisez « Discuter » sur une proposition reçue pour échanger avec un prestataire.'
                : 'Aucune conversation. Les clients peuvent vous écrire à propos de vos propositions.'}
          </Typography>
        </Stack>
      ) : (
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {conversations.map((c) => (
            <ConversationItem
              key={c.id}
              conversation={c}
              active={c.id === selectionId}
              readOnly={readOnly}
              onClick={() => ouvrir(c.id)}
            />
          ))}
        </List>
      )}
    </Box>
  )

  if (loading) return <LoadingSpinner label="Chargement des conversations…" />
  if (error && conversations.length === 0) return <ErrorMessage message="Impossible de charger vos conversations." />

  // Mobile : le fil s'ouvre en plein écran par-dessus l'interface
  if (isMobile && selectionId) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: theme.zIndex.appBar + 2,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ChatThread
          key={selectionId}
          conversationId={selectionId}
          readOnly={readOnly}
          onBack={() => navigate(basePath)}
          onActivity={charger}
        />
      </Box>
    )
  }

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle={
          readOnly
            ? 'Consultation des échanges entre clients et prestataires (lecture seule)'
            : 'Discutez et négociez avant de conclure une proposition'
        }
      />
      {isMobile ? (
        <Paper variant="outlined">{liste}</Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            display: 'grid',
            gridTemplateColumns: { md: '300px minmax(0, 1fr)', lg: '340px minmax(0, 1fr)' },
            height: 'calc(100vh - 230px)',
            minHeight: 520,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ borderRight: '1px solid', borderColor: 'divider', minHeight: 0 }}>{liste}</Box>
          <Box sx={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {selectionId ? (
              <ChatThread key={selectionId} conversationId={selectionId} readOnly={readOnly} onActivity={charger} />
            ) : (
              <Stack sx={{ alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 44, color: 'secondary.main', mb: 1 }} />
                <Typography variant="body2">Sélectionnez une conversation</Typography>
              </Stack>
            )}
          </Box>
        </Paper>
      )}
    </>
  )
}
