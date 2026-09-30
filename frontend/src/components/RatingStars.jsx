import { Rating, Stack, Typography } from '@mui/material'

export default function RatingStars({ value, onChange, readOnly = false, label }) {
  return (
    <Stack spacing={0.5}>
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
      <Rating
        value={Number(value) || 0}
        onChange={(_, newValue) => onChange && onChange(newValue)}
        readOnly={readOnly}
        precision={1}
      />
    </Stack>
  )
}
