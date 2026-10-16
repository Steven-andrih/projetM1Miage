import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
} from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import StatusChip from '../../components/StatusChip';
import { formatAriary } from '../../utils/format';

export default function MesPropositionsView({
  propositions,
  demandesById,
  onOpenDemande,
}) {
  if (propositions.length === 0) {
    return (
      <Stack
        spacing={1.5}
        sx={{ alignItems: 'center', py: 10, color: 'text.secondary' }}
      >
        <InboxIcon sx={{ fontSize: 48, color: 'secondary.main' }} />
        <Typography variant="body1">
          Vous n'avez pas encore envoyé de proposition.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 2.5,
      }}
    >
      {propositions.map((proposition) => {
        const demande = demandesById[proposition.demande];
        return (
          <Card key={proposition.id} variant="outlined">
            <CardActionArea
              onClick={() => onOpenDemande(proposition.demande)}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {demande?.titre || `Demande #${proposition.demande}`}
                  </Typography>
                  <StatusChip status={proposition.statut} />
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {proposition.message}
                </Typography>
                {proposition.tarif_propose && (
                  <Typography variant="body2" sx={{ mt: 1.5 }}>
                    Tarif proposé : {formatAriary(proposition.tarif_propose)}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        );
      })}
    </Box>
  );
}
