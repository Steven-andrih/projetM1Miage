import { Box } from '@mui/material'

export default function DashboardGrid({ children }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fit, minmax(200px, 1fr))' },
        gap: 2.5,
        mb: 4,
      }}
    >
      {children}
    </Box>
  )
}
