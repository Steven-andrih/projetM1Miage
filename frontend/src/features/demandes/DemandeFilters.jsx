import { Box, Button, InputAdornment, MenuItem, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import RestartAltIcon from '@mui/icons-material/RestartAlt'

const STATUT_OPTIONS = [
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'PUBLIEE', label: 'Publiée' },
  { value: 'EN_COURS', label: 'En cours' },
  { value: 'TERMINEE', label: 'Terminée' },
  { value: 'ANNULEE', label: 'Annulée' },
]

const URGENCE_OPTIONS = [
  { value: 'FAIBLE', label: 'Faible' },
  { value: 'NORMALE', label: 'Normale' },
  { value: 'URGENTE', label: 'Urgente' },
]

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Plus récentes' },
  { value: 'date_asc', label: 'Plus anciennes' },
  { value: 'budget_desc', label: 'Budget décroissant' },
  { value: 'budget_asc', label: 'Budget croissant' },
]

function getLabel(item) {
  return item.nom || item.libelle || item.name || `#${item.id}`
}

export default function DemandeFilters({ filters, categories, services, onChange, onReset }) {
  const filteredServices = filters.categorieId
    ? services.filter((s) => s.categorie === filters.categorieId)
    : services

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'flex-end',
      }}
    >
      <TextField
        label="Rechercher"
        name="search"
        value={filters.search}
        onChange={onChange}
        size="small"
        sx={{ flex: '1 1 220px' }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        select
        label="Statut"
        name="statut"
        value={filters.statut}
        onChange={onChange}
        size="small"
        sx={{ flex: '1 1 140px' }}
      >
        <MenuItem value="">Tous</MenuItem>
        {STATUT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Urgence"
        name="urgence"
        value={filters.urgence}
        onChange={onChange}
        size="small"
        sx={{ flex: '1 1 140px' }}
      >
        <MenuItem value="">Toutes</MenuItem>
        {URGENCE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Catégorie"
        name="categorieId"
        value={filters.categorieId}
        onChange={onChange}
        size="small"
        sx={{ flex: '1 1 160px' }}
      >
        <MenuItem value="">Toutes</MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {getLabel(cat)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Service"
        name="serviceId"
        value={filters.serviceId}
        onChange={onChange}
        size="small"
        sx={{ flex: '1 1 160px' }}
      >
        <MenuItem value="">Tous</MenuItem>
        {filteredServices.map((service) => (
          <MenuItem key={service.id} value={service.id}>
            {getLabel(service)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Trier par"
        name="sort"
        value={filters.sort}
        onChange={onChange}
        size="small"
        sx={{ flex: '1 1 180px' }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>

      <Button type="button" onClick={onReset} startIcon={<RestartAltIcon />} size="small">
        Réinitialiser
      </Button>
    </Box>
  )
}
