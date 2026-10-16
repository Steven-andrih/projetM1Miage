import { useState } from 'react'
import { Alert, InputAdornment, TextField } from '@mui/material'
import ConfirmDialog from '../../components/ConfirmDialog'
import * as propositionsApi from '../../api/propositions.api'
import { formatAriary } from '../../utils/format'

/**
 * Modification du tarif d'une proposition en attente (prestataire).
 * Le backend publie un message système « Tarif modifié » dans la conversation.
 */
export default function TarifDialog({ open, proposition, onClose, onSaved }) {
  const [tarif, setTarif] = useState(proposition ? String(Math.round(Number(proposition.tarif_propose))) : '')
  const [enCours, setEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  const valeur = Number(tarif)
  const invalide = !tarif || Number.isNaN(valeur) || valeur <= 0
  const inchange = proposition && valeur === Math.round(Number(proposition.tarif_propose))

  const enregistrer = async () => {
    setEnCours(true)
    setErreur('')
    try {
      const misAJour = await propositionsApi.updateProposition(proposition.id, { tarif_propose: valeur })
      onSaved?.(misAJour)
      onClose()
    } catch (err) {
      const data = err.response?.data
      setErreur(data?.tarif_propose?.[0] || data?.non_field_errors?.[0] || data?.detail || 'La modification a échoué.')
    } finally {
      setEnCours(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      title="Modifier le tarif proposé"
      message={`Tarif actuel : ${formatAriary(proposition?.tarif_propose)}. Le client sera informé dans la conversation.`}
      confirmLabel="Enregistrer"
      loading={enCours}
      loadingLabel="Enregistrement…"
      confirmDisabled={invalide || inchange}
      onCancel={onClose}
      onConfirm={enregistrer}
    >
      <TextField
        autoFocus
        label="Nouveau tarif"
        type="number"
        value={tarif}
        onChange={(event) => setTarif(event.target.value)}
        fullWidth
        sx={{ mt: 2 }}
        slotProps={{
          input: { endAdornment: <InputAdornment position="end">Ar</InputAdornment> },
          htmlInput: { min: 0, step: 1000 },
        }}
      />
      {erreur && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {erreur}
        </Alert>
      )}
    </ConfirmDialog>
  )
}
