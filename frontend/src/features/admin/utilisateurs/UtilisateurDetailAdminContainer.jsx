import { useEffect, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Paper,
  Rating,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import * as adminApi from '../../../api/admin.api'
import PageHeader from '../../../components/PageHeader'
import LoadingSpinner from '../../../components/LoadingSpinner'
import ErrorMessage from '../../../components/ErrorMessage'
import StatusDonutChart from '../../dashboard/StatusDonutChart'
import { formatAriary, formatDate, formatDateTime } from '../../../utils/format'
import { libelleTypeDocument } from '../../../utils/verification'
import { StatutCompteChip, VerificationChip } from './UtilisateursAdminContainer'
import useCompteActions from './useCompteActions'
import UserAvatar from '../../../components/UserAvatar'

function Section({ title, action, children }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 } }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {action}
      </Stack>
      {children}
    </Paper>
  )
}

function Champ({ label, value }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
        {value === null || value === undefined || value === '' ? '—' : value}
      </Typography>
    </Box>
  )
}

function Grille({ children }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2 }}>
      {children}
    </Box>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <Box sx={{ p: 1.75, borderRadius: 3, bgcolor: 'background.default' }}>
      <Typography variant="h5" sx={{ color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  )
}

export default function UtilisateurDetailAdminContainer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [utilisateur, setUtilisateur] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)

  const { demander, dialogue } = useCompteActions({
    onDone: (action) => {
      if (action === 'supprimer') navigate('/admin/utilisateurs', { replace: true })
      else setVersion((v) => v + 1)
    },
  })

  useEffect(() => {
    let annule = false
    adminApi
      .getUtilisateur(id)
      .then((data) => !annule && setUtilisateur(data))
      .catch(() => !annule && setError(true))
      .finally(() => !annule && setLoading(false))
    return () => {
      annule = true
    }
  }, [id, version])

  if (loading) return <LoadingSpinner label="Chargement du profil…" />
  if (error || !utilisateur) return <ErrorMessage message="Utilisateur introuvable." />

  const u = utilisateur
  const estPrestataire = u.role === 'PRESTATAIRE'
  const retour = `/admin/utilisateurs?role=${u.role}`

  return (
    <>
      <PageHeader
        title={u.nom}
        subtitle={estPrestataire ? 'Profil prestataire' : 'Profil client'}
        showBack
        backTo={retour}
      />

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 2.5 }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' } }}>
          <UserAvatar photo={u.photo} nom={u.nom} size={72} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h6">{u.nom}</Typography>
              <StatutCompteChip utilisateur={u} />
              {estPrestataire && <VerificationChip utilisateur={u} />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              @{u.username} · inscrit le {formatDate(u.date_joined)} · dernière connexion {formatDateTime(u.last_login)}
            </Typography>
            {!u.is_active && !u.est_supprime && (
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 1, color: 'warning.main' }}>
                <VisibilityOffOutlinedIcon fontSize="small" />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Compte désactivé : connexion bloquée, demandes et propositions masquées.
                </Typography>
              </Stack>
            )}
          </Box>
          {!u.est_supprime && (
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {u.is_active ? (
                <Button variant="outlined" color="warning" startIcon={<BlockIcon />} onClick={() => demander(u, 'desactiver')}>
                  Désactiver
                </Button>
              ) : (
                <Button variant="outlined" startIcon={<LockOpenIcon />} onClick={() => demander(u, 'reactiver')}>
                  Réactiver
                </Button>
              )}
              <Button variant="outlined" color="error" startIcon={<DeleteOutlineIcon />} onClick={() => demander(u, 'supprimer')}>
                Supprimer
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      <Stack spacing={2.5}>
        <Section title="Identité">
          <Grille>
            <Champ label="Prénom" value={u.first_name} />
            <Champ label="Nom" value={u.last_name} />
            <Champ label="Email" value={u.email} />
            <Champ label="Téléphone" value={u.telephone} />
            <Champ label="Adresse" value={u.adresse} />
            <Champ label="Ville" value={u.ville} />
            <Champ
              label="Position"
              value={u.latitude != null && u.longitude != null ? `${Number(u.latitude).toFixed(4)}, ${Number(u.longitude).toFixed(4)}` : null}
            />
          </Grille>
        </Section>

        <Section title="Missions">
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 1.5 }}>
            <MiniStat label="Au total" value={u.missions.total} />
            <MiniStat label="En cours" value={u.missions.en_cours} color="warning.main" />
            <MiniStat label="Terminées" value={u.missions.terminees} color="success.main" />
            <MiniStat label="Annulées" value={u.missions.annulees} color="error.main" />
          </Box>
        </Section>

        {!estPrestataire && u.demandes && (
          <Section title={`Demandes (${u.demandes.total})`}>
            <StatusDonutChart counts={u.demandes.par_statut} centerLabel="demandes" />
          </Section>
        )}

        {estPrestataire && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
              <Section title="Profil professionnel">
                <Grille>
                  <Champ label="Expérience" value={`${u.annee_experience} an(s)`} />
                  <Champ label="Disponibilité" value={u.disponible ? 'Disponible' : 'Indisponible'} />
                  <Champ
                    label="Note moyenne"
                    value={
                      u.note_moyenne != null ? (
                        <Stack direction="row" spacing={0.75} component="span" sx={{ alignItems: 'center' }}>
                          <Rating value={u.note_moyenne} precision={0.1} readOnly size="small" />
                          <span>
                            {u.note_moyenne.toFixed(1).replace('.', ',')} ({u.nb_avis})
                          </span>
                        </Stack>
                      ) : (
                        'Aucun avis'
                      )
                    }
                  />
                </Grille>
                {u.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                    {u.description}
                  </Typography>
                )}
              </Section>

              <Section
                title="Vérification d'identité"
                action={
                  u.a_document && (
                    <Button component={RouterLink} to="/admin/verifications" size="small" startIcon={<FactCheckOutlinedIcon />}>
                      Ouvrir les vérifications
                    </Button>
                  )
                }
              >
                <Grille>
                  <Champ label="Statut" value={<VerificationChip utilisateur={u} />} />
                  <Champ label="Document" value={u.a_document ? libelleTypeDocument(u.type_document) : 'Aucun document envoyé'} />
                  <Champ label="Soumis le" value={u.date_soumission ? formatDateTime(u.date_soumission) : null} />
                  <Champ label="Vérifié le" value={u.date_validation ? formatDateTime(u.date_validation) : null} />
                </Grille>
                {u.motif_refus && (
                  <Typography variant="body2" color="error.main" sx={{ mt: 2 }}>
                    Motif du refus : {u.motif_refus}
                  </Typography>
                )}
              </Section>
            </Box>

            <Section title={`Propositions (${u.propositions.total})`}>
              <StatusDonutChart counts={u.propositions.par_statut} centerLabel="propositions" />
            </Section>

            <Section title={`Services proposés (${u.services.length})`}>
              {u.services.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucun service renseigné.
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Service</TableCell>
                        <TableCell>Catégorie</TableCell>
                        <TableCell align="right">Tarif</TableCell>
                        <TableCell>État</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {u.services.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.service}</TableCell>
                          <TableCell>{s.categorie}</TableCell>
                          <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                            {formatAriary(s.tarif_min)} – {formatAriary(s.tarif_max)}
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={s.actif ? 'Actif' : 'Inactif'} variant="outlined" color={s.actif ? 'success' : 'default'} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Section>

            <Section title={`Avis reçus (${u.avis.length})`}>
              {u.avis.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucun avis reçu.
                </Typography>
              ) : (
                <Stack spacing={2} divider={<Box sx={{ borderTop: '1px solid', borderColor: 'divider' }} />}>
                  {u.avis.map((a) => (
                    <Box key={a.id}>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                        <UserAvatar photo={a.client_photo} nom={a.client} size={24} />
                        <Rating value={a.note} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary">
                          {a.client} · {a.demande} · {formatDate(a.date_creation)}
                        </Typography>
                        {!a.visible && <Chip size="small" label="Masqué" variant="outlined" />}
                      </Stack>
                      {a.commentaire && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          « {a.commentaire} »
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}
            </Section>
          </>
        )}
      </Stack>

      {dialogue}
    </>
  )
}
