import { useState } from 'react';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import AiImproveButton from '../../components/AiImproveButton';

const EMPTY_FORM = { message: '', tarif_propose: '' };

export default function PropositionForm({ onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImproved = (texteAmeliore) => {
    setForm((prev) => ({ ...prev, message: texteAmeliore }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Envoyer une proposition
      </Typography>
      <Stack component="form" onSubmit={handleSubmit} spacing={2} noValidate>
        <TextField
          label="Votre message au client"
          name="message"
          value={form.message}
          onChange={handleChange}
          multiline
          minRows={4}
          required
          fullWidth
        />
        <AiImproveButton
          value={form.message}
          contexte="service"
          onImproved={handleImproved}
        />

        <TextField
          label="Tarif proposé (€)"
          name="tarif_propose"
          type="number"
          value={form.tarif_propose}
          onChange={handleChange}
          sx={{ maxWidth: 240 }}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={submitting}
          sx={{ alignSelf: 'flex-start' }}
        >
          {submitting ? 'Envoi…' : 'Envoyer ma proposition'}
        </Button>
      </Stack>
    </Paper>
  );
}
