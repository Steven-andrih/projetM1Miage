import { Paper, Stack, Typography } from '@mui/material'
import RatingStars from '../../components/RatingStars'

export default function AvisSummary({ avis }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={1.5}>
        <Typography variant="h6">Avis laissé</Typography>
        <RatingStars value={avis.note} readOnly />
        {avis.commentaire && (
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {avis.commentaire}
          </Typography>
        )}
      </Stack>
    </Paper>
  )
}
