import { Box, Button, Grid, Stack, TextField } from '@mui/material';
import GeolocationButton from '../../components/GeolocationButton';

export default function ClientProfileView({
  form,
  onChange,
  onLocate,
  onSubmit,
  submitting,
}) {
  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField
          label="Adresse"
          name="adresse"
          value={form.adresse}
          onChange={onChange}
          fullWidth
        />
        <TextField
          label="Ville"
          name="ville"
          value={form.ville}
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
