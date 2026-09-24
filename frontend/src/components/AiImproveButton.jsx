import { useState } from 'react';
import { Alert, Button } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import * as iaApi from '../api/ia.api';

export default function AiImproveButton({ value, contexte, onImproved }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClick = async () => {
    if (!value?.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { texte_ameliore } = await iaApi.improveText({
        texte: value,
        contexte,
      });
      onImproved(texte_ameliore);
    } catch {
      setError("Impossible d'améliorer le texte pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outlined"
        size="small"
        startIcon={<AutoAwesomeIcon />}
        onClick={handleClick}
        disabled={loading || !value?.trim()}
        sx={{ alignSelf: 'flex-start' }}
      >
        {loading ? 'Amélioration…' : "Améliorer avec l'IA"}
      </Button>
      {error && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </>
  );
}
