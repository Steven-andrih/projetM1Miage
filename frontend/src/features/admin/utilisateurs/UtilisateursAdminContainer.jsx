import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import BlockIcon from '@mui/icons-material/Block'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined'
import * as adminApi from '../../../api/admin.api'
import PageHeader from '../../../components/PageHeader'
import LoadingSpinner from '../../../components/LoadingSpinner'
import ErrorMessage from '../../../components/ErrorMessage'
import VerifiedBadge from '../../../components/VerifiedBadge'
import { formatDate } from '../../../utils/format'
import { VERIFICATION, statutVerification } from '../../../utils/verification'
import useCompteActions from './useCompteActions'
import UserAvatar from '../../../components/UserAvatar'

const ROLES = [
  { value: 'CLIENT', label: 'Clients' },
  { value: 'PRESTATAIRE', label: 'Prestataires' },
]

export function StatutCompteChip({ utilisateur }) {
  if (utilisateur.est_supprime) return <Chip size="small" label="Supprimé" variant="outlined" />
  return utilisateur.is_active ? (
    <Chip size="small" label="Actif" sx={{ bgcolor: 'rgba(47,158,110,0.12)', color: 'success.main' }} />
  ) : (
    <Chip size="small" label="Désactivé" sx={{ bgcolor: 'rgba(209,72,77,0.12)', color: 'error.main' }} />
  )
}

export function VerificationChip({ utilisateur }) {
  if (utilisateur.statut_validation === 'VALIDE') return <VerifiedBadge />
  const config = VERIFICATION[statutVerification(utilisateur.statut_validation, utilisateur.a_document)]
  return <Chip size="small" label={config.label} color={config.palette} variant="outlined" />
}

export default function UtilisateursAdminContainer() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const role = searchParams.get('role') === 'PRESTATAIRE' ? 'PRESTATAIRE' : 'CLIENT'

  const [recherche, setRecherche] = useState('')
  const [rechercheDiffusee, setRechercheDiffusee] = useState('')
  const [actif, setActif] = useState('')
  const [statutValidation, setStatutValidation] = useState('')
  const [utilisateurs, setUtilisateurs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)
  const [menu, setMenu] = useState(null) // { anchor, utilisateur }

  const { demander, dialogue } = useCompteActions({ onDone: () => setVersion((v) => v + 1) })

  useEffect(() => {
    const t = setTimeout(() => setRechercheDiffusee(recherche.trim()), 300)
    return () => clearTimeout(t)
  }, [recherche])

  const params = useMemo(
    () => ({
      role,
      search: rechercheDiffusee,
      actif,
      statut_validation: role === 'PRESTATAIRE' ? statutValidation : '',
    }),
    [role, rechercheDiffusee, actif, statutValidation],
  )

  useEffect(() => {
    let annule = false
    adminApi
      .getUtilisateurs(params)
      .then((data) => {
        if (annule) return
        setUtilisateurs(data)
        setError(false)
      })
      .catch(() => !annule && setError(true))
      .finally(() => !annule && setLoading(false))
    return () => {
      annule = true
    }
  }, [params, version])

  const fermerMenu = () => setMenu(null)
  const action = (nom) => {
    const utilisateur = menu.utilisateur
    fermerMenu()
    if (nom === 'voir') navigate(`/admin/utilisateurs/${utilisateur.id}`)
    else demander(utilisateur, nom)
  }

  return (
    <>
      <PageHeader title="Utilisateurs" subtitle="Consultez et gérez les comptes des clients et des prestataires" />

      <Tabs
        value={role}
        onChange={(_, value) => {
          setSearchParams({ role: value })
          setStatutValidation('')
          setLoading(true)
        }}
        sx={{ mb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {ROLES.map((r) => (
          <Tab key={r.value} value={r.value} label={r.label} sx={{ textTransform: 'none', fontWeight: 600 }} />
        ))}
      </Tabs>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2.5 }}>
        <TextField
          size="small"
          placeholder="Rechercher par nom, email, téléphone, ville…"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          sx={{ flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Compte"
          value={actif}
          onChange={(event) => setActif(event.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="true">Actifs</MenuItem>
          <MenuItem value="false">Désactivés</MenuItem>
        </TextField>
        {role === 'PRESTATAIRE' && (
          <TextField
            select
            size="small"
            label="Vérification"
            value={statutValidation}
            onChange={(event) => setStatutValidation(event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">Tous</MenuItem>
            <MenuItem value="VALIDE">Vérifiés</MenuItem>
            <MenuItem value="EN_ATTENTE">En attente</MenuItem>
            <MenuItem value="REFUSE">Refusés</MenuItem>
          </TextField>
        )}
      </Stack>

      {loading ? (
        <LoadingSpinner label="Chargement des utilisateurs…" />
      ) : error ? (
        <ErrorMessage message="Impossible de charger les utilisateurs." />
      ) : utilisateurs.length === 0 ? (
        <Stack spacing={1.5} sx={{ alignItems: 'center', py: 10, color: 'text.secondary' }}>
          <GroupOutlinedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
          <Typography>Aucun utilisateur ne correspond à ces critères.</Typography>
        </Stack>
      ) : (
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 2.5, pt: 2 }}>
            {utilisateurs.length} {role === 'CLIENT' ? 'client(s)' : 'prestataire(s)'}
          </Typography>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Ville</TableCell>
                  <TableCell align="right">Missions</TableCell>
                  <TableCell>Statut</TableCell>
                  {role === 'PRESTATAIRE' && <TableCell>Vérification</TableCell>}
                  <TableCell>Inscrit le</TableCell>
                  <TableCell align="right" />
                </TableRow>
              </TableHead>
              <TableBody>
                {utilisateurs.map((u) => (
                  <TableRow
                    key={u.id}
                    hover
                    onClick={() => navigate(`/admin/utilisateurs/${u.id}`)}
                    sx={{ cursor: 'pointer', opacity: u.is_active ? 1 : 0.65, '& td': { py: 1.25 } }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <UserAvatar photo={u.photo} nom={u.nom} size={34} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                            {u.nom}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{u.username}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {u.email || '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {u.telephone || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{u.ville || '—'}</TableCell>
                    <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {u.nb_missions ?? 0}
                    </TableCell>
                    <TableCell>
                      <StatutCompteChip utilisateur={u} />
                    </TableCell>
                    {role === 'PRESTATAIRE' && (
                      <TableCell>
                        <VerificationChip utilisateur={u} />
                      </TableCell>
                    )}
                    <TableCell>{formatDate(u.date_joined)}</TableCell>
                    <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                      <IconButton
                        size="small"
                        aria-label="actions"
                        onClick={(event) => setMenu({ anchor: event.currentTarget, utilisateur: u })}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={fermerMenu}>
        <MenuItem onClick={() => action('voir')}>
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Voir le profil</ListItemText>
        </MenuItem>
        {menu?.utilisateur.is_active ? (
          <MenuItem onClick={() => action('desactiver')}>
            <ListItemIcon>
              <BlockIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Désactiver</ListItemText>
          </MenuItem>
        ) : (
          <MenuItem onClick={() => action('reactiver')}>
            <ListItemIcon>
              <LockOpenIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Réactiver</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={() => action('supprimer')} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Supprimer</ListItemText>
        </MenuItem>
      </Menu>

      {dialogue}
    </>
  )
}
