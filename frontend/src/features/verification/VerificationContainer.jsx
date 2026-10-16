import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import VerifiedIcon from '@mui/icons-material/Verified'
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined'
import ReportOutlinedIcon from '@mui/icons-material/ReportGmailerrorredOutlined'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import * as usersApi from '../../api/users.api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import ImageZoomViewer from '../../components/ImageZoomViewer'
import { useToast } from '../../components/ToastProvider'
import useBlobUrl from '../../hooks/useBlobUrl'
import { formatDateTime } from '../../utils/format'
import { TYPES_DOCUMENT, VERIFICATION, libelleTypeDocument, statutVerification } from '../../utils/verification'

const FORMATS = ['image/jpeg', 'image/png', 'image/webp']
const TAILLE_MAX = 5 * 1024 * 1024

const ICONES = {
  VERIFIE: VerifiedIcon,
  EN_COURS: HourglassTopOutlinedIcon,
  REFUSE: ReportOutlinedIcon,
  NON_VERIFIE: BadgeOutlinedIcon,
}

function StatutCard({ profil }) {
  const theme = useTheme()
  const cle = statutVerification(profil.statut_validation, profil.a_document)
  const config = VERIFICATION[cle]
  const couleur = theme.palette[config.palette].main
  const Icone = ICONES[cle]

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderColor: alpha(couleur, 0.4), bgcolor: alpha(couleur, 0.04) }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
            bgcolor: alpha(couleur, 0.14), color: couleur, display: 'grid', placeItems: 'center',
          }}
        >
          <Icone />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: couleur }}>
            {config.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {config.description}
          </Typography>
          {profil.a_document && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              {libelleTypeDocument(profil.type_document)} envoyé le {formatDateTime(profil.date_soumission)}
              {cle === 'VERIFIE' && profil.date_validation && ` · vérifié le ${formatDateTime(profil.date_validation)}`}
            </Typography>
          )}
          {cle === 'REFUSE' && profil.motif_refus && (
            <Alert severity="error" variant="outlined" sx={{ mt: 1.5 }}>
              <strong>Motif du refus :</strong> {profil.motif_refus}
            </Alert>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

export default function VerificationContainer() {
  const theme = useTheme()
  const { showToast } = useToast()
  const [profil, setProfil] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)

  const [typeDocument, setTypeDocument] = useState('CIN')
  const [fichier, setFichier] = useState(null)
  const [erreurFichier, setErreurFichier] = useState('')
  const [progression, setProgression] = useState(null)
  const [erreurEnvoi, setErreurEnvoi] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    usersApi
      .getPrestataireProfile()
      .then((data) => {
        setProfil(data)
        if (data.type_document) setTypeDocument(data.type_document)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [version])

  const fetchDocument = useCallback(() => usersApi.getMonDocument(), [])
  const documentActuel = useBlobUrl(profil?.a_document ? fetchDocument : null, version)

  const apercu = useMemo(() => (fichier ? URL.createObjectURL(fichier) : null), [fichier])
  useEffect(() => () => apercu && URL.revokeObjectURL(apercu), [apercu])

  const choisirFichier = (candidat) => {
    setErreurEnvoi('')
    if (!candidat) return
    if (!FORMATS.includes(candidat.type)) {
      setFichier(null)
      setErreurFichier('Format non accepté. Utilisez une image JPG, PNG ou WEBP.')
      return
    }
    if (candidat.size > TAILLE_MAX) {
      setFichier(null)
      setErreurFichier('Le fichier dépasse 5 Mo.')
      return
    }
    setErreurFichier('')
    setFichier(candidat)
  }

  const envoyer = async () => {
    if (!fichier) return
    setProgression(0)
    setErreurEnvoi('')
    try {
      await usersApi.envoyerDocument({ typeDocument, fichier }, setProgression)
      setFichier(null)
      showToast('Document envoyé. Il sera vérifié par l’administration.', 'success')
      setVersion((v) => v + 1)
    } catch (err) {
      const data = err.response?.data
      setErreurEnvoi(data?.document?.[0] || data?.detail || "L'envoi a échoué. Réessayez.")
    } finally {
      setProgression(null)
    }
  }

  if (loading) return <LoadingSpinner label="Chargement de votre vérification…" />
  if (error || !profil) return <ErrorMessage message="Impossible de charger votre statut de vérification." />

  const estVerifie = profil.statut_validation === 'VALIDE'
  const envoiEnCours = progression !== null

  return (
    <>
      <PageHeader
        title="Vérification d'identité"
        subtitle="Une identité vérifiée rassure les clients et met en avant vos propositions"
      />

      <Stack spacing={2.5}>
        <StatutCard profil={profil} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: estVerifie ? '1fr' : '7fr 5fr' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          {!estVerifie && (
            <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {profil.a_document ? 'Remplacer le document' : 'Envoyer un document'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                Photo nette et lisible, sans reflet. Formats JPG, PNG ou WEBP, 5 Mo maximum.
              </Typography>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Type de document
              </Typography>
              <ToggleButtonGroup
                value={typeDocument}
                exclusive
                onChange={(_, value) => value && setTypeDocument(value)}
                size="small"
                sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1, '& .MuiToggleButton-root': { borderRadius: '10px !important', border: '1px solid', borderColor: 'divider', px: 1.75, textTransform: 'none', fontWeight: 600 } }}
              >
                {TYPES_DOCUMENT.map((t) => (
                  <ToggleButton key={t.value} value={t.value}>
                    {t.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>

              <Box
                component="label"
                onDragOver={(event) => {
                  event.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(event) => {
                  event.preventDefault()
                  setDragOver(false)
                  choisirFichier(event.dataTransfer.files?.[0])
                }}
                sx={{
                  display: 'block',
                  cursor: envoiEnCours ? 'default' : 'pointer',
                  border: '2px dashed',
                  borderColor: dragOver ? 'primary.main' : 'divider',
                  bgcolor: dragOver ? alpha(theme.palette.primary.main, 0.04) : 'background.default',
                  borderRadius: 3,
                  p: apercu ? 1.5 : 4,
                  textAlign: 'center',
                  transition: 'border-color 0.15s, background-color 0.15s',
                }}
              >
                <input
                  type="file"
                  accept={FORMATS.join(',')}
                  hidden
                  disabled={envoiEnCours}
                  onChange={(event) => {
                    choisirFichier(event.target.files?.[0])
                    event.target.value = ''
                  }}
                />
                {apercu ? (
                  <Stack spacing={1} sx={{ alignItems: 'center' }}>
                    <Box
                      component="img"
                      src={apercu}
                      alt="Aperçu du document"
                      sx={{ maxWidth: '100%', maxHeight: 260, borderRadius: 2, objectFit: 'contain' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {fichier.name} · {(fichier.size / 1024 / 1024).toFixed(2).replace('.', ',')} Mo · cliquez pour changer
                    </Typography>
                  </Stack>
                ) : (
                  <Stack spacing={1} sx={{ alignItems: 'center' }}>
                    <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Glissez votre image ici ou cliquez pour la choisir
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      JPG, PNG ou WEBP · 5 Mo maximum
                    </Typography>
                  </Stack>
                )}
              </Box>

              {erreurFichier && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {erreurFichier}
                </Alert>
              )}
              {erreurEnvoi && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {erreurEnvoi}
                </Alert>
              )}
              {envoiEnCours && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={progression} sx={{ height: 6, borderRadius: 3 }} />
                  <Typography variant="caption" color="text.secondary">
                    Envoi… {progression}%
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUploadOutlinedIcon />}
                disabled={!fichier || envoiEnCours}
                onClick={envoyer}
                sx={{ mt: 2.5 }}
              >
                {profil.a_document ? 'Remplacer le document' : 'Envoyer pour vérification'}
              </Button>
            </Paper>
          )}

          <Stack spacing={2.5}>
            {profil.a_document && (
              <Paper variant="outlined" sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
                  Document envoyé
                </Typography>
                <ImageZoomViewer
                  src={documentActuel.url}
                  loading={documentActuel.loading}
                  error={documentActuel.error}
                  alt="Votre pièce d'identité"
                  height={260}
                />
              </Paper>
            )}
            <Paper variant="outlined" sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <LockOutlinedIcon sx={{ color: 'primary.main', mt: 0.25 }} />
                <Box>
                  <Typography variant="subtitle2">Confidentialité</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Votre document n'est visible que par l'administration de la plateforme. Il n'est
                    jamais montré aux clients : seul le badge « Vérifié » apparaît sur votre profil.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </>
  )
}
