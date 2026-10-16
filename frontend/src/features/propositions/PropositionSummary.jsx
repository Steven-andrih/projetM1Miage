import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Box, Button, Paper, Stack, Typography } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import StatusChip from '../../components/StatusChip';
import { useToast } from '../../components/ToastProvider';
import * as messagerieApi from '../../api/messagerie.api';
import TarifDialog from '../messagerie/TarifDialog';
import { formatAriary } from '../../utils/format';

export default function PropositionSummary({ proposition, onUpdated }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [tarifOpen, setTarifOpen] = useState(false);
  const enAttente = proposition.statut === 'EN_ATTENTE';
  const nonLus = proposition.conversation?.non_lus || 0;

  const discuter = async () => {
    try {
      const conversation = await messagerieApi.ouvrirConversation(proposition.id);
      navigate(`/prestataire/messages/${conversation.id}`);
    } catch {
      showToast("Impossible d'ouvrir la conversation.", 'error');
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={1.5}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Votre proposition</Typography>
          <StatusChip status={proposition.statut} />
        </Stack>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {proposition.message}
        </Typography>
        <Box>
          <Typography variant="caption" color="text.secondary" component="div">
            Tarif proposé
          </Typography>
          <Typography variant="h6">{formatAriary(proposition.tarif_propose)}</Typography>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ pt: 1 }}>
          <Badge color="error" badgeContent={nonLus} invisible={nonLus === 0}>
            <Button
              variant="outlined"
              startIcon={<ChatBubbleOutlineIcon />}
              onClick={discuter}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Discuter avec le client
            </Button>
          </Badge>
          {enAttente && (
            <Button startIcon={<EditOutlinedIcon />} onClick={() => setTarifOpen(true)}>
              Modifier le tarif
            </Button>
          )}
        </Stack>
      </Stack>
      {tarifOpen && (
        <TarifDialog
          open
          proposition={proposition}
          onClose={() => setTarifOpen(false)}
          onSaved={() => {
            showToast('Tarif mis à jour, le client est informé.', 'success');
            onUpdated?.();
          }}
        />
      )}
    </Paper>
  );
}
