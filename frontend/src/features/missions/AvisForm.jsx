import { useState } from 'react'
import { Button, Paper, Stack, TextField, Typography } from '@mui/material'
import RatingStars from '../../components/RatingStars'

export default function AvisForm({ onSubmit, submitting }) {
  const [note, setNote] = useState(5)
  const [commentaire, setCommentaire] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({ note, commentaire })
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Laisser un avis
      </Typography>
      <Stack component="form" onSubmit={handleSubmit} spacing={2} noValidate>
        <RatingStars value={note} onChange={setNote} label="Votre note" />
        <TextField
          label="Votre commentaire"
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
        <Button type="submit" variant="contained" disabled={submitting} sx={{ alignSelf: 'flex-start' }}>
          {submitting ? 'Envoi…' : "Envoyer l'avis"}
        </Button>
      </Stack>
    </Paper>
  )
}
