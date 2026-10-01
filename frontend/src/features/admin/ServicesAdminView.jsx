import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

export default function ServicesAdminView({
  services,
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
  onToggleActive,
  onSubmit,
}) {
  const getCategorieNom = (id) => categories.find((c) => c.id === id)?.nom || `#${id}`

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onOpenCreate}>
          Nouveau service
        </Button>
      </Stack>

      {services.length === 0 ? (
        <Typography color="text.secondary">Aucun service pour le moment.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2 }}>
          {services.map((service) => (
            <Card variant="outlined" key={service.id}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {service.nom}
                  </Typography>
                  <Chip
                    label={service.active ? 'Actif' : 'Inactif'}
                    size="small"
                    color={service.active ? 'success' : 'default'}
                  />
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {getCategorieNom(service.categorie)}
                </Typography>
                {service.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {service.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={() => onOpenEdit(service)} aria-label="modifier">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDeleteRequest(service.id)} aria-label="supprimer">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? 'Modifier le service' : 'Nouveau service'}</DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Nom" name="nom" value={form.nom} onChange={onChange} required fullWidth />
              <TextField
                select
                label="Catégorie"
                name="categorie"
                value={form.categorie}
                onChange={onChange}
                required
                fullWidth
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nom}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Description"
                name="description"
                value={form.description}
                onChange={onChange}
                multiline
                minRows={2}
                fullWidth
              />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip
                  label={form.active ? 'Actif' : 'Inactif'}
                  color={form.active ? 'success' : 'default'}
                  onClick={onToggleActive}
                  clickable
                />
                <Typography variant="caption" color="text.secondary">
                  Cliquez pour activer/désactiver
                </Typography>
              </Stack>
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
