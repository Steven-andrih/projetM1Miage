import { Card, CardContent, Stack, Typography, alpha, useTheme } from '@mui/material'

export default function StatCard({ icon, label, value, color = 'primary.main' }) {
  const theme = useTheme()
  const [paletteKey, shade = 'main'] = String(color).split('.')
  const resolved = theme.palette[paletteKey]?.[shade] || theme.palette.primary.main

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack spacing={2}>
          {icon && (
            <Stack
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: alpha(resolved, 0.12),
                color: resolved,
                alignItems: 'center',
                justifyContent: 'center',
                '& svg': { fontSize: 20 },
              }}
            >
              {icon}
            </Stack>
          )}
          <Stack spacing={0.25}>
            <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
