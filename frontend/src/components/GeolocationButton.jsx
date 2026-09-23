import { useState } from 'react';
import { Alert, Button } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

export default function GeolocationButton({ onLocate }) {
  const [error, setError] = useState('');

  const handleClick = () => {
    setError('');
    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur ce navigateur.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError(
          'Impossible de récupérer votre position. Autorisez la géolocalisation ou saisissez-la manuellement.',
        );
      },
    );
  };

  return (
    <>
      <Button
        type="button"
        variant="outlined"
        size="small"
        startIcon={<MyLocationIcon />}
        onClick={handleClick}
        sx={{ alignSelf: 'flex-start' }}
      >
        Utiliser ma position actuelle
      </Button>
      {error && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </>
  );
}
