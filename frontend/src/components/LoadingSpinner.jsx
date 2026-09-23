import { Box, CircularProgress, Typography } from '@mui/material';

export default function LoadingSpinner({ label = 'Chargement…' }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 6,
      }}
    >
      <CircularProgress color="primary" />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}
