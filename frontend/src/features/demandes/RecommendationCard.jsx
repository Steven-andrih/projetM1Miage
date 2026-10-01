import { Box, Card, CardContent, Chip, LinearProgress, Stack, Typography } from '@mui/material'
import StarIcon from '@mui/icons-material/Star'

function getSubScores(reco) {
  return [
    { label: 'Proximité', value: reco.score_proximite },
    { label: 'Note', value: reco.score_note },
    { label: 'Disponibilité', value: reco.score_disponibilite },
    { label: 'Expérience', value: reco.score_experience },
    { label: 'Missions réalisées', value: reco.score_missions },
  ].filter((s) => s.value != null)
}

function getPrestataireLabel(reco) {
  if (reco.prestataire_username) return reco.prestataire_username
  if (reco.prestataire && typeof reco.prestataire === 'object') {
    return reco.prestataire.username || reco.prestataire.nom || `Prestataire #${reco.prestataire.id}`
  }
  return `Prestataire #${reco.prestataire}`
}

export default function RecommendationCard({ recommandation }) {
  const subScores = getSubScores(recommandation)
  const scoreGlobal = recommandation.score_global ?? recommandation.score ?? null

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight={700}>
            {getPrestataireLabel(recommandation)}
          </Typography>
          {scoreGlobal != null && (
            <Chip
              icon={<StarIcon fontSize="small" />}
              label={`${Math.round(scoreGlobal)} / 100`}
              sx={{ bgcolor: 'secondary.main', color: '#fff', fontWeight: 700 }}
            />
          )}
        </Stack>

        {recommandation.justification && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }}>
            {recommandation.justification}
          </Typography>
        )}

        {subScores.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Stack spacing={1}>
              {subScores.map((sub) => (
                <Box key={sub.label}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">
                      {sub.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(sub.value)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, sub.value))}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'background.default',
                      '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
