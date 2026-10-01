import { Card, CardContent, Stack, Typography } from '@mui/material'

export default function StatCard({ icon, label, value, color = 'primary.main' }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          {icon && (
            <Stack
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'background.default',
                color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </Stack>
          )}
          <Stack>
            <Typography variant="h5" fontWeight={700}>
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
