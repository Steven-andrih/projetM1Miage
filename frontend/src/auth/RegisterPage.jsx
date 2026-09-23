import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useAuth } from './useAuth';

const ROLE_OPTIONS = [
  { value: 'CLIENT', label: 'Client' },
  { value: 'PRESTATAIRE', label: 'Prestataire' },
];

const INITIAL_FORM = {
  username: '',
  email: '',
  password: '',
  role: 'CLIENT',
  telephone: '',
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const connectedUser = await register(form);
      navigate(`/${connectedUser.role.toLowerCase()}/dashboard`, {
        replace: true,
      });
    } catch {
      setError(
        'Impossible de créer le compte. Vérifiez les informations saisies.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Nom d'utilisateur"
          name="username"
          value={form.username}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          label="Téléphone"
          name="telephone"
          value={form.telephone}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          label="Mot de passe"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          fullWidth
        />
        <TextField
          select
          label="Je suis"
          name="role"
          value={form.role}
          onChange={handleChange}
          fullWidth
        >
          {ROLE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
          fullWidth
        >
          {submitting ? 'Création…' : 'Créer mon compte'}
        </Button>

        <Link
          component={RouterLink}
          to="/login"
          variant="body2"
          sx={{ textAlign: 'center' }}
        >
          Déjà un compte ? Se connecter
        </Link>
      </Stack>
    </Box>
  );
}
