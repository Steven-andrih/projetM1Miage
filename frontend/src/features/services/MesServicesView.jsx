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
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { formatAriary } from '../../utils/format'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ServiceSelect from '../catalogue/ServiceSelect'

function findServiceLabel(services, serviceId) {
  const found = services.find((s) => s.id === serviceId)
  return found ? found.nom || found.libelle || found.name : `Service #${serviceId}`
}

export default function MesServicesView({
  myServices,
  services,
  dialogOpen,
  editingId,
  form,
  submitting,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  onClose,
  onChange,
  onSubmit,
}) {
  return (
    <>
      <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onOpenCreate}>
          Ajouter un service
        </Button>
      </Stack>

      {myServices.length === 0 ? (
        <Typography color="text.secondary">
          Vous n'avez pas encore associé de service à votre profil.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 2,
          }}
        >
          {myServices.map((item) => (
            <Card variant="outlined" key={item.id}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {findServiceLabel(services, item.service)}
                </Typography>
                <Chip
                  size="small"
                  sx={{ mt: 1, bgcolor: 'secondary.main', color: '#fff' }}
                  label={`${formatAriary(item.tarif_min)} – ${formatAriary(item.tarif_max)}`}
                />
              </CardContent>
              <CardActions>
                <IconButton size="small" onClick={() => onOpenEdit(item)} aria-label="modifier">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(item.id)} aria-label="supprimer">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={onClose} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? 'Modifier le service' : 'Ajouter un service'}</DialogTitle>
        <form onSubmit={onSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <ServiceSelect
                services={services}
                value={form.service}
                onChange={onChange}
                disabled={Boolean(editingId)}
              />
              <TextField
                label="Tarif minimum (Ar)"
                name="tarif_min"
                type="number"
                value={form.tarif_min}
                onChange={onChange}
                fullWidth
              />
              <TextField
                label="Tarif maximum (Ar)"
                name="tarif_max"
                type="number"
                value={form.tarif_max}
                onChange={onChange}
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
