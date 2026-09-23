import { MenuItem, TextField } from '@mui/material';

export default function CategorySelect({
  categories,
  value,
  onChange,
  name = 'categorie',
  label = 'Catégorie',
  ...rest
}) {
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
      {categories.map((cat) => (
        <MenuItem key={cat.id} value={cat.id}>
          {cat.nom || cat.libelle || cat.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
