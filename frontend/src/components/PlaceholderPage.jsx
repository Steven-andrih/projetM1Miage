import { Paper, Typography, Box } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

/**
 * Composant temporaire affiché pour les routes dont la page métier
 * n'a pas encore été développée (voir roadmap frontend).
 */
export default function PlaceholderPage({ title }) {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }} variant="outlined">
      <Box sx={{ color: 'secondary.main', mb: 2 }}>
        <ConstructionIcon sx={{ fontSize: 48 }} />
      </Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Cette page sera développée lors d'une prochaine étape.
      </Typography>
    </Paper>
  );
}
