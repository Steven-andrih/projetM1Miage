import { Box, MenuItem, Stack, TextField } from '@mui/material';
import CategorySelect from '../catalogue/CategorySelect';
import ServiceSelect from '../catalogue/ServiceSelect';
import GeolocationButton from '../../components/GeolocationButton';
import AiImproveButton from '../../components/AiImproveButton';

const URGENCE_OPTIONS = [
  { value: 'FAIBLE', label: 'Faible' },
  { value: 'NORMALE', label: 'Normale' },
  { value: 'URGENTE', label: 'Urgente' },
];

export default function DemandeFormFields({
  form,
  categories,
  services,
  categorieFilter,
  onChange,
  onCategoryFilterChange,
  onLocate,
  onDescriptionImproved,
}) {
  return (
    <Stack spacing={2}>
      <TextField
        label="Titre"
        name="titre"
        value={form.titre}
        onChange={onChange}
        required
        fullWidth
      />

      <TextField
        label="Description"
        name="description"
        value={form.description}
        onChange={onChange}
        multiline
        minRows={4}
        required
        fullWidth
      />
      <AiImproveButton
        value={form.description}
        contexte="annonce"
        onImproved={onDescriptionImproved}
      />

      <CategorySelect
        categories={categories}
        value={categorieFilter}
        onChange={onCategoryFilterChange}
        label="Catégorie (filtre)"
      />
      <ServiceSelect
        services={services}
        categorieId={categorieFilter || null}
        value={form.service}
        onChange={onChange}
        required
      />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Budget min (€)"
          name="budget_min"
          type="number"
          value={form.budget_min}
          onChange={onChange}
          sx={{ flex: '1 1 160px' }}
        />
        <TextField
          label="Budget max (€)"
          name="budget_max"
          type="number"
          value={form.budget_max}
          onChange={onChange}
          sx={{ flex: '1 1 160px' }}
        />
      </Box>

      <TextField
        label="Date souhaitée"
        name="date_souhaitee"
        type="date"
        value={form.date_souhaitee}
        onChange={onChange}
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      <TextField
        select
        label="Urgence"
        name="urgence"
        value={form.urgence}
        onChange={onChange}
        fullWidth
      >
        {URGENCE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

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
    </Stack>
  );
}
