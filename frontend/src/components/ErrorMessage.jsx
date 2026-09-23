import { Alert, AlertTitle } from '@mui/material';

export default function ErrorMessage({
  title = 'Une erreur est survenue',
  message,
}) {
  return (
    <Alert severity="error">
      <AlertTitle>{title}</AlertTitle>
      {message || 'Veuillez réessayer ultérieurement.'}
    </Alert>
  );
}
