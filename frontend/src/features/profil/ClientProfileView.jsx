import { Box, Button, Stack, TextField } from '@mui/material'
import GeolocationButton from '../../components/GeolocationButton'

export default function ClientProfileView({ form, onChange, onLocate, onSubmit, submitting }) {
  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <TextField label="Adresse" name="adresse" value={form.adresse} onChange={onChange} fullWidth />
        <TextField label="Ville" name="ville" value={form.ville} onChange={onChange} fullWidth />

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

        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </Stack>
    </Box>
  )
}
