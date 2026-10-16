import { Outlet } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import BrandMark from '../components/BrandMark';

const ARGUMENTS = [
  'Des prestataires validés, proches de chez vous',
  'Des recommandations personnalisées pour chaque demande',
  'Un suivi clair de vos missions, du devis à l’avis',
];

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
        bgcolor: 'background.default',
      }}
    >
      {/* Volet de marque */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: '#FFFFFF',
          background: 'linear-gradient(160deg, #3B5C8F 0%, #4A70A9 55%, #6E8FC2 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            right: -140,
            bottom: -160,
            background: 'rgba(255,255,255,0.08)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            left: -80,
            top: 120,
            background: 'rgba(255,255,255,0.06)',
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ position: 'relative' }}>
          <BrandMark size={40} light />
          <Typography variant="h6" fontWeight={700}>
            Jobbing Local
          </Typography>
        </Stack>

        <Box sx={{ position: 'relative', maxWidth: 420 }}>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{ mb: 2, lineHeight: 1.15, fontSize: { md: '1.9rem', lg: '2.4rem' } }}
          >
            La mise en relation locale, simple et fiable.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, mb: 4 }}>
            Publiez un besoin, recevez des propositions, choisissez le bon prestataire.
          </Typography>
          <Stack spacing={1.5}>
            {ARGUMENTS.map((texte) => (
              <Stack key={texte} direction="row" spacing={1.25} alignItems="center">
                <CheckCircleOutlineIcon sx={{ fontSize: 20, opacity: 0.9 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {texte}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ opacity: 0.6, position: 'relative' }}>
          Projet M1 MIAGE
        </Typography>
      </Box>

      {/* Volet formulaire */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            bgcolor: 'background.paper',
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 3, sm: 4 },
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ mb: 3, display: { xs: 'flex', md: 'none' } }}
          >
            <BrandMark size={32} />
            <Typography variant="subtitle1" fontWeight={700}>
              Jobbing Local
            </Typography>
          </Stack>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
