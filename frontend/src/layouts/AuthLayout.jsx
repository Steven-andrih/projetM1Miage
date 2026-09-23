import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Container maxWidth="xs" disableGutters>
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography
            variant="h5"
            align="center"
            fontWeight={700}
            color="primary.main"
            sx={{ mb: 3 }}
          >
            Jobbing Local
          </Typography>
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
}
