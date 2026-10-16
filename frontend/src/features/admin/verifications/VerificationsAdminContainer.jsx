import { useCallback, useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import * as adminApi from '../../../api/admin.api'
import PageHeader from '../../../components/PageHeader'
import LoadingSpinner from '../../../components/LoadingSpinner'
import ErrorMessage from '../../../components/ErrorMessage'
import ConfirmDialog from '../../../components/ConfirmDialog'
import ImageZoomViewer from '../../../components/ImageZoomViewer'
import { useToast } from '../../../components/ToastProvider'
import useBlobUrl from '../../../hooks/useBlobUrl'
import useNotifications from '../../../hooks/useNotifications'
import { formatDateTime } from '../../../utils/format'
import { libelleTypeDocument } from '../../../utils/verification'
import UserAvatar from '../../../components/UserAvatar'

const ONGLETS = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'REFUSE', label: 'Refusés' },
  { value: 'VALIDE', label: 'Validés' },
]

const CHIPS = {
  EN_ATTENTE: { label: 'En attente', color: 'warning' },
  REFUSE: { label: 'Refusé', color: 'error' },
  VALIDE: { label: 'Vérifié', color: 'success' },
}

function Info({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

function DetailVerification({ prestataire, onDecision }) {
  const fetchDocument = useCallback(
    () => adminApi.getDocumentPrestataire(prestataire.id),
    [prestataire.id],
  )
  const document = useBlobUrl(fetchDocument, prestataire.date_soumission)
  const [refusOpen, setRefusOpen] = useState(false)
  const [motif, setMotif] = useState('')
  const [enCours, setEnCours] = useState(false)

  const decider = async (decision) => {
    setEnCours(true)
    try {
      await onDecision(prestataire, decision, motif.trim())
      setRefusOpen(false)
      setMotif('')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <UserAvatar photo={prestataire.photo} nom={prestataire.nom} size={48} />
          <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6">{prestataire.nom}</Typography>
          <Typography variant="body2" color="text.secondary">
            @{prestataire.username} · {prestataire.ville || 'Ville non renseignée'}
          </Typography>
          </Box>
        </Stack>
        <Chip size="small" {...CHIPS[prestataire.statut_validation]} variant="outlined" />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 2.5 }}>
        <Info label="Type de document" value={libelleTypeDocument(prestataire.type_document)} />
        <Info label="Soumis le" value={formatDateTime(prestataire.date_soumission)} />
        <Info label="Email" value={prestataire.email} />
        <Info label="Téléphone" value={prestataire.telephone} />
      </Box>

      <ImageZoomViewer
        src={document.url}
        loading={document.loading}
        error={document.error}
        alt={`Pièce d'identité de ${prestataire.nom}`}
      />

      {prestataire.statut_validation === 'REFUSE' && prestataire.motif_refus && (
        <Alert severity="error" variant="outlined" sx={{ mt: 2 }}>
          <strong>Motif du refus :</strong> {prestataire.motif_refus}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2.5 }}>
        {prestataire.statut_validation !== 'VALIDE' && (
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            disabled={enCours || !document.url}
            onClick={() => decider('valider')}
          >
            Valider
          </Button>
        )}
        {prestataire.statut_validation === 'EN_ATTENTE' && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            disabled={enCours}
            onClick={() => setRefusOpen(true)}
          >
            Refuser
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button component={RouterLink} to={`/admin/utilisateurs/${prestataire.utilisateur_id}`}>
          Voir le profil complet
        </Button>
      </Stack>

      <ConfirmDialog
        open={refusOpen}
        title="Refuser ce document ?"
        message="Le motif sera affiché au prestataire, qui pourra envoyer un nouveau document."
        confirmLabel="Refuser"
        confirmColor="error"
        loading={enCours}
        confirmDisabled={!motif.trim()}
        onCancel={() => setRefusOpen(false)}
        onConfirm={() => decider('refuser')}
      >
        <TextField
          autoFocus
          label="Motif du refus"
          placeholder="Ex. : photo floue, document expiré, nom illisible…"
          value={motif}
          onChange={(event) => setMotif(event.target.value)}
          multiline
          minRows={3}
          fullWidth
          required
          sx={{ mt: 2 }}
        />
      </ConfirmDialog>
    </Paper>
  )
}

export default function VerificationsAdminContainer() {
  const { showToast } = useToast()
  const notifications = useNotifications()
  const [onglet, setOnglet] = useState('EN_ATTENTE')
  const [liste, setListe] = useState([])
  const [selectionId, setSelectionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let annule = false
    adminApi
      .getVerifications(onglet)
      .then((data) => {
        if (annule) return
        setListe(data)
        setError(false)
        setSelectionId((courant) => (data.some((p) => p.id === courant) ? courant : data[0]?.id ?? null))
      })
      .catch(() => !annule && setError(true))
      .finally(() => !annule && setLoading(false))
    return () => {
      annule = true
    }
  }, [onglet, version])

  const handleDecision = async (prestataire, decision, motif) => {
    try {
      if (decision === 'valider') {
        await adminApi.validerPrestataire(prestataire.id)
        showToast(`${prestataire.nom} est maintenant vérifié.`, 'success')
      } else {
        await adminApi.refuserPrestataire(prestataire.id, motif)
        showToast('Document refusé, le motif a été transmis au prestataire.', 'info')
      }
      setVersion((v) => v + 1)
      notifications.refresh()
    } catch (err) {
      showToast(err.response?.data?.detail || err.response?.data?.motif?.[0] || 'La décision a échoué.', 'error')
      throw err
    }
  }

  const selection = liste.find((p) => p.id === selectionId)

  return (
    <>
      <PageHeader
        title="Vérification des prestataires"
        subtitle="Contrôlez les pièces d'identité envoyées et validez les profils"
      />

      <Tabs
        value={onglet}
        onChange={(_, value) => {
          setOnglet(value)
          setLoading(true)
        }}
        sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {ONGLETS.map((o) => (
          <Tab
            key={o.value}
            value={o.value}
            label={
              o.value === 'EN_ATTENTE' && notifications.verificationsEnAttente > 0
                ? `${o.label} (${notifications.verificationsEnAttente})`
                : o.label
            }
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>

      {loading ? (
        <LoadingSpinner label="Chargement des vérifications…" />
      ) : error ? (
        <ErrorMessage message="Impossible de charger les vérifications." />
      ) : liste.length === 0 ? (
        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 10, color: 'text.secondary' }}>
          <FactCheckOutlinedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
          <Typography>
            {onglet === 'EN_ATTENTE' ? 'Aucun document en attente de vérification.' : 'Aucun prestataire dans cette catégorie.'}
          </Typography>
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: '280px minmax(0, 1fr)' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          <Stack spacing={1.25}>
            {liste.map((p) => (
              <Card
                key={p.id}
                variant="outlined"
                sx={{
                  borderColor: p.id === selectionId ? 'primary.main' : 'divider',
                  boxShadow: p.id === selectionId ? 2 : 'none',
                }}
              >
                <CardActionArea onClick={() => setSelectionId(p.id)}>
                  <CardContent sx={{ py: 1.75, display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <UserAvatar photo={p.photo} nom={p.nom} size={36} />
                    <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap>
                      {p.nom}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="div" noWrap>
                      {libelleTypeDocument(p.type_document)} · {p.ville || '—'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Soumis le {formatDateTime(p.date_soumission)}
                    </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
          {selection && <DetailVerification key={selection.id} prestataire={selection} onDecision={handleDecision} />}
        </Box>
      )}
    </>
  )
}
