import { Box, Stack, Typography } from '@mui/material'

export default function MiniBarList({ items, labelKey, valueKey, emptyLabel = '—' }) {
  if (!items || items.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {emptyLabel}
      </Typography>
    )
  }

  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1)

  return (
    <Stack spacing={1.5}>
      {items.map((item, idx) => {
        const value = Number(item[valueKey]) || 0
        const label = item[labelKey] || 'Non renseigné'
        return (
          <Box key={idx}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="body2">{label}</Typography>
              <Typography variant="body2" fontWeight={600}>
                {value}
              </Typography>
            </Stack>
            <Box sx={{ height: 8, borderRadius: 1, bgcolor: 'background.default', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${(value / max) * 100}%`,
                  bgcolor: 'primary.main',
                  borderRadius: 1,
                  transition: 'width 0.3s',
                }}
              />
            </Box>
          </Box>
        )
      })}
    </Stack>
  )
}
