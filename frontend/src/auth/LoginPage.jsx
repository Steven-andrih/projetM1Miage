import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material';
import { useAuth } from './useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
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
      const connectedUser = await login(form.username, form.password);
      const redirectTo =
        location.state?.from?.pathname ||
        `/${connectedUser.role.toLowerCase()}/dashboard`;
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
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
          autoComplete="username"
          required
          fullWidth
        />
        <TextField
          label="Mot de passe"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
          fullWidth
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
          fullWidth
        >
          {submitting ? 'Connexion…' : 'Se connecter'}
        </Button>

        <Link
          component={RouterLink}
          to="/register"
          variant="body2"
          sx={{ textAlign: 'center' }}
        >
          Pas encore de compte ? Créer un compte
        </Link>
      </Stack>
    </Box>
  );
}
