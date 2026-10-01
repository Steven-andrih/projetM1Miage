import { Box, Button, Stack, Typography } from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import { unwrapList } from '../../utils/api'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import RecommendationCard from './RecommendationCard'

export default function RecommendationsSection({ recommandations, loading, error, loaded, onLoad }) {
  if (!loaded) {
    return (
      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<AutoAwesomeIcon />}
          onClick={onLoad}
          disabled={loading}
        >
          {loading ? 'Calcul en cours…' : 'Voir les prestataires recommandés (IA)'}
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Prestataires recommandés
      </Typography>
      {loading ? (
        <LoadingSpinner label="Calcul des recommandations…" />
      ) : error ? (
        <ErrorMessage message="Impossible de calculer les recommandations pour cette demande." />
      ) : recommandations.length === 0 ? (
        <Typography color="text.secondary">Aucun prestataire recommandé pour le moment.</Typography>
      ) : (
        <Stack spacing={2}>
          {recommandations.map((reco) => (
            <RecommendationCard key={reco.id ?? reco.prestataire} recommandation={reco} />
          ))}
        </Stack>
      )}
    </Box>
  )
}
