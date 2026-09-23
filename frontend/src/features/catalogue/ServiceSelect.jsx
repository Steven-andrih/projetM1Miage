import { MenuItem, TextField } from '@mui/material';

export default function ServiceSelect({
  services,
  categorieId,
  value,
  onChange,
  name = 'service',
  label = 'Service',
  ...rest
}) {
  const filtered = categorieId
    ? services.filter((s) => s.categorie === categorieId)
    : services;

  return (
    <TextField
      select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      fullWidth
      {...rest}
    >
      {filtered.map((service) => (
        <MenuItem key={service.id} value={service.id}>
          {service.nom || service.libelle || service.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
