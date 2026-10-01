import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined'
import EventIcon from '@mui/icons-material/EventOutlined'
import PaidIcon from '@mui/icons-material/PaidOutlined'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'
import StatusChip from '../../components/StatusChip'
import DemandeFormFields from './DemandeFormFields'

function InfoRow({ icon, label, value }) {
  if (!value) return null
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: '1 1 220px' }}>
      {icon}
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={500}>
          {value}
        </Typography>
      </Box>
    </Stack>
  )
}

export default function DemandeDetailView({
  demande,
  isOwner,
  editMode,
  form,
  categories,
  services,
  categorieFilter,
  submitting,
  onEdit,
  onCancelEdit,
  onDeleteRequest,
  onChange,
  onCategoryFilterChange,
  onLocate,
  onDescriptionImproved,
  onSubmit,
}) {
  if (editMode) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <form onSubmit={onSubmit} noValidate>
          <DemandeFormFields
            form={form}
            categories={categories}
            services={services}
            categorieFilter={categorieFilter}
            onChange={onChange}
            onCategoryFilterChange={onCategoryFilterChange}
            onLocate={onLocate}
            onDescriptionImproved={onDescriptionImproved}
            showStatut
          />
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
            <Button onClick={onCancelEdit} disabled={submitting}>
              Annuler
            </Button>
          </Stack>
        </form>
      </Paper>
    )
  }

  const budget =
    demande.budget_min || demande.budget_max
      ? `${demande.budget_min ? Number(demande.budget_min).toLocaleString('fr-FR') : '?'} € - ${
          demande.budget_max ? Number(demande.budget_max).toLocaleString('fr-FR') : '?'
        } €`
      : null

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
          <StatusChip status={demande.statut} />
          {isOwner && (
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<EditIcon />} variant="outlined" onClick={onEdit}>
                Modifier
              </Button>
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                color="error"
                variant="outlined"
                onClick={onDeleteRequest}
              >
                Supprimer
              </Button>
            </Stack>
          )}
        </Stack>

        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {demande.description}
        </Typography>

        <Divider />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5 }}>
          <InfoRow icon={<PaidIcon sx={{ color: 'secondary.main' }} />} label="Budget" value={budget} />
          <InfoRow
            icon={<PriorityHighIcon sx={{ color: 'secondary.main' }} />}
            label="Urgence"
            value={demande.urgence}
          />
          <InfoRow
            icon={<EventIcon sx={{ color: 'secondary.main' }} />}
            label="Date souhaitée"
            value={demande.date_souhaitee ? new Date(demande.date_souhaitee).toLocaleDateString('fr-FR') : null}
          />
          <InfoRow
            icon={<LocationOnIcon sx={{ color: 'secondary.main' }} />}
            label="Adresse"
            value={demande.adresse}
          />
        </Box>
      </Stack>
    </Paper>
  )
}
