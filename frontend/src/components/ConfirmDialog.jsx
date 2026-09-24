import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

export default function ConfirmDialog({
  open,
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = 'Confirmer',
  confirmColor = 'primary',
  loading = false,
}) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Suppression…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
