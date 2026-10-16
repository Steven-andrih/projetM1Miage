import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GeolocationButton from '../../components/GeolocationButton';
import VerifiedBadge from '../../components/VerifiedBadge';
import { VERIFICATION, statutVerification } from '../../utils/verification';

export default function PrestataireProfileView({
  form,
  statutValidation,
  aDocument,
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
              Vérification d'identité
            </Typography>
            {statutValidation === 'VALIDE' ? (
              <VerifiedBadge />
            ) : (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Chip
                  label={VERIFICATION[statutVerification(statutValidation, aDocument)].label}
                  color={VERIFICATION[statutVerification(statutValidation, aDocument)].palette}
                  variant="outlined"
                  size="small"
                />
                <Button component={RouterLink} to="/prestataire/verification" size="small">
                  Gérer ma vérification
                </Button>
              </Stack>
            )}
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

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Latitude"
            name="latitude"
            type="number"
            value={form.latitude}
            onChange={onChange}
            sx={{ flex: '1 1 160px' }}
            inputProps={{ step: 'any' }}
          />
          <TextField
            label="Longitude"
            name="longitude"
            type="number"
            value={form.longitude}
            onChange={onChange}
            sx={{ flex: '1 1 160px' }}
            inputProps={{ step: 'any' }}
          />
        </Box>

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
