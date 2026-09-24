import { Button, Divider, Stack, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StatusChip from '../../components/StatusChip';
import DemandeFormFields from './DemandeFormFields';

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
  onDelete,
  onChange,
  onCategoryFilterChange,
  onLocate,
  onDescriptionImproved,
  onSubmit,
}) {
  if (editMode) {
    return (
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
        />
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
          <Button onClick={onCancelEdit}>Annuler</Button>
        </Stack>
      </form>
    );
  }

  return (
    <Stack spacing={2}>
      <StatusChip status={demande.statut} />

      <Typography variant="body1">{demande.description}</Typography>

      <Divider />

      <Stack direction="row" spacing={4} flexWrap="wrap">
        <Typography variant="body2">
          Budget : {demande.budget_min ?? '?'} € - {demande.budget_max ?? '?'} €
        </Typography>
        <Typography variant="body2">
          Urgence : {demande.urgence ?? '—'}
        </Typography>
        <Typography variant="body2">
          Date souhaitée : {demande.date_souhaitee ?? '—'}
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        Adresse : {demande.adresse ?? '—'}
      </Typography>

      {isOwner && (
        <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
          <Button startIcon={<EditIcon />} variant="outlined" onClick={onEdit}>
            Modifier
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            color="error"
            variant="outlined"
            onClick={onDelete}
          >
            Supprimer
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
