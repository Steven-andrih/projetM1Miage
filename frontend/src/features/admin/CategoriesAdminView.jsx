import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function CategoriesAdminView({
  categories,
  dialogOpen,
  editingId,
  form,
  submitting,
  onOpenCreate,
  onOpenEdit,
  onDeleteRequest,
  onClose,
  onChange,
  onSubmit,
}) {
  return (
    <>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onOpenCreate}>
          Nouvelle catégorie
        </Button>
      </Stack>

      {categories.length === 0 ? (
        <Typography color="text.secondary">Aucune catégorie pour le moment.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
          {categories.map((cat) => (
            <Card variant="outlined" key={cat.id}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  {cat.nom}
                </Typography>
                {cat.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {cat.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={() => onOpenEdit(cat)} aria-label="modifier">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDeleteRequest(cat.id)} aria-label="supprimer">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nom" name="nom" value={form.nom} onChange={onChange} required fullWidth />
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={onChange}
                multiline
                minRows={2}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
