import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import GeolocationButton from '../../components/GeolocationButton';

const STATUT_COLORS = {
  VALIDE: 'success',
  EN_ATTENTE: 'warning',
  REFUSE: 'error',
};

export default function PrestataireProfileView({
  form,
  statutValidation,
  onChange,
  onToggle,
  onLocate,
  onSubmit,
  submitting,
}) {
  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 560 }}>
        {statutValidation && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Statut de validation
            </Typography>
            <Chip
              label={statutValidation}
              color={STATUT_COLORS[statutValidation] || 'default'}
              size="small"
            />
          </Box>
        )}

        <TextField
          label="Description"
          name="description"
          value={form.description}
          onChange={onChange}
          multiline
          minRows={3}
          fullWidth
        />
        <TextField
          label="Adresse"
          name="adresse"
          value={form.adresse}
          onChange={onChange}
          fullWidth
        />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Latitude"
              name="latitude"
              type="number"
              value={form.latitude}
              onChange={onChange}
              fullWidth
              inputProps={{ step: 'any' }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Longitude"
              name="longitude"
              type="number"
              value={form.longitude}
              onChange={onChange}
              fullWidth
              inputProps={{ step: 'any' }}
            />
          </Grid>
        </Grid>

        <GeolocationButton onLocate={onLocate} />

        <TextField
          label="Années d'expérience"
          name="annee_experience"
          type="number"
          value={form.annee_experience}
          onChange={onChange}
          fullWidth
          inputProps={{ min: 0 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={form.disponible}
              onChange={onToggle}
              name="disponible"
            />
          }
          label="Disponible pour de nouvelles missions"
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
        >
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </Stack>
    </Box>
  );
}
