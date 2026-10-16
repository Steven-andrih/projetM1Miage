import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import * as messagerieApi from '../../api/messagerie.api'
import * as propositionsApi from '../../api/propositions.api'
import StatusChip from '../../components/StatusChip'
import VerifiedBadge from '../../components/VerifiedBadge'
import BudgetIndicator from '../../components/BudgetIndicator'
import ConfirmDialog from '../../components/ConfirmDialog'
import { useToast } from '../../components/ToastProvider'
import useNotifications from '../../hooks/useNotifications'
import { formatAriary, formatHeure } from '../../utils/format'
import TarifDialog from './TarifDialog'

const POLLING_MS = 4000

function libelleJour(date) {
  const d = new Date(date)
  const aujourdhui = new Date()
  const hier = new Date()
  hier.setDate(aujourdhui.getDate() - 1)
  if (d.toDateString() === aujourdhui.toDateString()) return "Aujourd'hui"
  if (d.toDateString() === hier.toDateString()) return 'Hier'
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function Bulle({ message }) {
  const theme = useTheme()
  if (message.type === 'SYSTEME') {
    return (
      <Stack sx={{ alignItems: 'center', my: 1 }}>
        <Box
          sx={{
            px: 1.5,
            py: 0.75,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: 'primary.dark',
            maxWidth: '85%',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            {message.contenu}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.7 }}>
            {formatHeure(message.date_envoi)}
          </Typography>
        </Box>
      </Stack>
    )
  }

  const moi = message.est_moi
  return (
    <Stack sx={{ alignItems: moi ? 'flex-end' : 'flex-start', my: 0.5 }}>
      {!moi && message.auteur_nom && (
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5, mb: 0.25 }}>
          {message.auteur_nom}
        </Typography>
      )}
      <Box
        sx={{
          maxWidth: { xs: '85%', sm: '70%' },
          px: 1.75,
          py: 1,
          borderRadius: 3,
          borderBottomRightRadius: moi ? 6 : 24,
          borderBottomLeftRadius: moi ? 24 : 6,
          bgcolor: moi ? 'primary.main' : 'background.paper',
          color: moi ? '#fff' : 'text.primary',
          border: moi ? 'none' : '1px solid',
          borderColor: 'divider',
          boxShadow: moi ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.25)}` : 'none',
        }}
      >
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.contenu}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'right', mt: 0.25, opacity: moi ? 0.8 : 0.6, fontSize: '0.68rem' }}
        >
          {formatHeure(message.date_envoi)}
        </Typography>
      </Box>
    </Stack>
  )
}

/**
 * Fil d'une conversation : en-tête de contexte, messages (polling), saisie.
 * `readOnly` : vue de modération (admin).
 */
export default function ChatThread({ conversationId, onBack, readOnly = false, onActivity }) {
  const theme = useTheme()
  const { showToast } = useToast()
  const { refresh: rafraichirNotifications } = useNotifications()
  const [conversation, setConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState(false)
  const [texte, setTexte] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [tarifOpen, setTarifOpen] = useState(false)
  const [acceptOpen, setAcceptOpen] = useState(false)
  const [accepting, setAccepting] = useState(false)

  const scrollRef = useRef(null)
  const dernierIdRef = useRef(null)
  const collerEnBasRef = useRef(true)

  const marquerLu = useCallback(() => {
    if (readOnly || document.visibilityState !== 'visible') return
    messagerieApi
      .marquerLu(conversationId)
      .then(() => {
        rafraichirNotifications()
        onActivity?.()
      })
      .catch(() => {})
  }, [conversationId, readOnly, rafraichirNotifications, onActivity])

  const rafraichir = useCallback(async () => {
    const [conv, nouveaux] = await Promise.all([
      messagerieApi.getConversation(conversationId),
      messagerieApi.getMessages(conversationId, dernierIdRef.current),
    ])
    setConversation(conv)
    if (nouveaux.length > 0) {
      dernierIdRef.current = nouveaux[nouveaux.length - 1].id
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id))
        return [...prev, ...nouveaux.filter((m) => !ids.has(m.id))]
      })
      if (nouveaux.some((m) => !m.est_moi)) marquerLu()
    }
    return conv
  }, [conversationId, marquerLu])

  // Chargement initial puis polling
  useEffect(() => {
    let actif = true
    dernierIdRef.current = null
    collerEnBasRef.current = true
    Promise.resolve()
      .then(() => {
        if (!actif) return null
        setMessages([])
        setLoading(true)
        setErreur(false)
        return rafraichir()
      })
      .then(() => {
        if (actif) marquerLu()
      })
      .catch(() => actif && setErreur(true))
      .finally(() => actif && setLoading(false))

    const intervalle = setInterval(() => {
      if (document.visibilityState === 'visible') rafraichir().catch(() => {})
    }, POLLING_MS)
    return () => {
      actif = false
      clearInterval(intervalle)
    }
  }, [conversationId, rafraichir, marquerLu])

  // Défilement automatique vers le dernier message
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && collerEnBasRef.current) el.scrollTop = el.scrollHeight
  }, [messages])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    collerEnBasRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  const envoyer = async () => {
    const contenu = texte.trim()
    if (!contenu || envoi) return
    setEnvoi(true)
    try {
      const message = await messagerieApi.envoyerMessage(conversationId, contenu)
      collerEnBasRef.current = true
      dernierIdRef.current = message.id
      setMessages((prev) => [...prev, message])
      setTexte('')
      onActivity?.()
    } catch (err) {
      showToast(err.response?.data?.contenu?.[0] || err.response?.data?.detail || "Le message n'a pas pu être envoyé.", 'error')
    } finally {
      setEnvoi(false)
    }
  }

  const accepter = async () => {
    setAccepting(true)
    try {
      await propositionsApi.acceptProposition(conversation.proposition.id)
      showToast('Proposition acceptée : la mission est créée.', 'success')
      setAcceptOpen(false)
      await rafraichir()
      onActivity?.()
    } catch (err) {
      showToast(err.response?.data?.detail || "L'acceptation a échoué.", 'error')
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%' }}>
        <CircularProgress size={28} />
      </Stack>
    )
  }
  if (erreur || !conversation) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Impossible de charger cette conversation.</Alert>
      </Box>
    )
  }

  const { proposition, demande, client, prestataire, mon_role: monRole } = conversation
  const interlocuteur = monRole === 'PRESTATAIRE' ? client : prestataire
  const enAttente = proposition.statut === 'EN_ATTENTE'
  const lienDemande =
    monRole === 'CLIENT'
      ? `/client/demandes/${demande.id}`
      : monRole === 'PRESTATAIRE'
        ? `/prestataire/demandes/${demande.id}`
        : null
  const peutEcrire = !readOnly && conversation.peut_ecrire

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* En-tête de contexte */}
      <Box sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          {onBack && (
            <IconButton onClick={onBack} aria-label="retour aux conversations" size="small">
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          )}
          <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.dark', fontSize: '0.9rem' }}>
            {(readOnly ? client.nom : interlocuteur.nom)?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle2" noWrap>
                {readOnly ? `${client.nom} ↔ ${prestataire.nom}` : interlocuteur.nom}
              </Typography>
              {(readOnly || monRole === 'CLIENT') && prestataire.verifie && <VerifiedBadge compact />}
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap component="div">
              {demande.titre}
            </Typography>
          </Box>
          {lienDemande && (
            <Tooltip title="Voir la demande">
              <IconButton component={RouterLink} to={lienDemande} size="small" aria-label="voir la demande">
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 1.25, pl: onBack ? 6 : 0 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatAriary(proposition.tarif_propose)}
          </Typography>
          <StatusChip status={proposition.statut} />
          {monRole === 'CLIENT' && (
            <BudgetIndicator tarif={proposition.tarif_propose} budgetMin={demande.budget_min} budgetMax={demande.budget_max} />
          )}
          <Box sx={{ flexGrow: 1 }} />
          {monRole === 'PRESTATAIRE' && enAttente && (
            <Button size="small" variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setTarifOpen(true)}>
              Modifier le tarif
            </Button>
          )}
          {monRole === 'CLIENT' && enAttente && (
            <Button size="small" variant="contained" startIcon={<CheckCircleOutlinedIcon />} onClick={() => setAcceptOpen(true)}>
              Accepter la proposition
            </Button>
          )}
        </Stack>
      </Box>

      {/* Messages */}
      <Box
        ref={scrollRef}
        onScroll={handleScroll}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 1.5, sm: 2.5 }, py: 2, bgcolor: 'background.default' }}
      >
        {messages.length === 0 && (
          <Stack spacing={1} sx={{ alignItems: 'center', py: 6, color: 'text.secondary', textAlign: 'center' }}>
            <InfoOutlinedIcon />
            <Typography variant="body2">
              {readOnly
                ? 'Aucun message dans cette conversation.'
                : 'Démarrez la discussion : posez vos questions ou négociez le tarif avant de conclure.'}
            </Typography>
          </Stack>
        )}
        {messages.map((message, index) => {
          const precedent = messages[index - 1]
          const nouveauJour =
            !precedent || new Date(precedent.date_envoi).toDateString() !== new Date(message.date_envoi).toDateString()
          return (
            <Fragment key={message.id}>
              {nouveauJour && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', my: 1.5, fontWeight: 600, textTransform: 'capitalize' }}
                >
                  {libelleJour(message.date_envoi)}
                </Typography>
              )}
              <Bulle message={message} />
            </Fragment>
          )
        })}
      </Box>

      {/* Saisie */}
      <Box sx={{ p: { xs: 1.25, sm: 2 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        {peutEcrire ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-end' }}>
            <TextField
              placeholder="Écrire un message…"
              value={texte}
              onChange={(event) => setTexte(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  envoyer()
                }
              }}
              multiline
              maxRows={4}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { maxLength: 2000, 'aria-label': 'message' } }}
            />
            <IconButton
              color="primary"
              onClick={envoyer}
              disabled={!texte.trim() || envoi}
              aria-label="envoyer"
              sx={{
                bgcolor: 'primary.main',
                color: '#fff',
                width: 40,
                height: 40,
                '&:hover': { bgcolor: 'primary.dark' },
                '&.Mui-disabled': { bgcolor: alpha(theme.palette.primary.main, 0.3), color: '#fff' },
              }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 0.5 }}>
            {readOnly
              ? 'Lecture seule : consultation à des fins de modération.'
              : 'Conversation en lecture seule : la proposition a été refusée ou annulée.'}
          </Typography>
        )}
        {peutEcrire && (
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, mt: 0.75 }}>
            Entrée pour envoyer, Maj + Entrée pour aller à la ligne
          </Typography>
        )}
      </Box>

      {tarifOpen && (
        <TarifDialog
          open
          proposition={proposition}
          onClose={() => setTarifOpen(false)}
          onSaved={() => {
            showToast('Tarif mis à jour, le client est informé.', 'success')
            rafraichir().catch(() => {})
            onActivity?.()
          }}
        />
      )}
      <ConfirmDialog
        open={acceptOpen}
        title="Accepter cette proposition ?"
        message={`Tarif retenu : ${formatAriary(proposition.tarif_propose)}. Les autres propositions seront refusées et la mission sera créée.`}
        confirmLabel="Accepter"
        loading={accepting}
        onCancel={() => setAcceptOpen(false)}
        onConfirm={accepter}
      />
    </Box>
  )
}
