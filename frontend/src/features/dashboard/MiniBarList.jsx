import { Box, Stack, Typography, alpha, useTheme } from '@mui/material'

export default function MiniBarList({ items, labelKey, valueKey, emptyLabel = '—' }) {
  const theme = useTheme()

  if (!items || items.length === 0) {
    return (
      <Typography color="text.secondary" variant="body2">
        {emptyLabel}
      </Typography>
    )
  }

  const max = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1)

  return (
    <Stack spacing={1.75}>
      {items.map((item, idx) => {
        const value = Number(item[valueKey]) || 0
        const label = item[labelKey] || 'Non renseigné'
        return (
          <Box key={idx}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
              <Typography variant="body2" noWrap sx={{ pr: 2 }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {value}
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${(value / max) * 100}%`,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  transition: 'width 0.4s ease',
                }}
              />
            </Box>
          </Box>
        )
      })}
    </Stack>
  )
}
