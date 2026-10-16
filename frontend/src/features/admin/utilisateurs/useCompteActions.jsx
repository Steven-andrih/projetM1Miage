import { useState } from 'react'
import * as adminApi from '../../../api/admin.api'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { useToast } from '../../../components/ToastProvider'

/**
 * Actions d'administration sur un compte (désactiver, réactiver, supprimer),
 * avec leurs boîtes de confirmation. Renvoie les déclencheurs et les dialogues à afficher.
 */
export default function useCompteActions({ onDone }) {
  const { showToast } = useToast()
  const [cible, setCible] = useState(null) // { utilisateur, action }
  const [enCours, setEnCours] = useState(false)

  const demander = (utilisateur, action) => setCible({ utilisateur, action })

  const confirmer = async () => {
    const { utilisateur, action } = cible
    setEnCours(true)
    try {
      if (action === 'desactiver') {
        await adminApi.desactiverUtilisateur(utilisateur.id)
        showToast(`Le compte de ${utilisateur.nom} est désactivé.`, 'info')
      } else if (action === 'reactiver') {
        await adminApi.reactiverUtilisateur(utilisateur.id)
        showToast(`Le compte de ${utilisateur.nom} est réactivé.`, 'success')
      } else {
        await adminApi.supprimerUtilisateur(utilisateur.id)
        showToast('Compte supprimé. Son historique de missions est conservé.', 'info')
      }
      setCible(null)
      onDone?.(action, utilisateur)
    } catch (err) {
      showToast(err.response?.data?.detail || "L'action a échoué.", 'error')
    } finally {
      setEnCours(false)
    }
  }

  const textes = {
    desactiver: {
      title: 'Désactiver ce compte ?',
      message:
        "L'utilisateur ne pourra plus se connecter, et ses demandes et propositions seront masquées aux autres utilisateurs. Vous pourrez le réactiver à tout moment.",
      confirmLabel: 'Désactiver',
      confirmColor: 'warning',
    },
    reactiver: {
      title: 'Réactiver ce compte ?',
      message: "L'utilisateur pourra de nouveau se connecter et ses contenus redeviendront visibles.",
      confirmLabel: 'Réactiver',
      confirmColor: 'primary',
    },
    supprimer: {
      title: 'Supprimer ce compte ?',
      message:
        "Cette action est définitive. Les informations personnelles sont effacées et le compte ne pourra plus être utilisé. L'historique des missions et des avis est conservé de façon anonyme.",
      confirmLabel: 'Supprimer définitivement',
      confirmColor: 'error',
    },
  }

  const dialogue = (
    <ConfirmDialog
      open={Boolean(cible)}
      {...(cible ? textes[cible.action] : textes.desactiver)}
      loading={enCours}
      onCancel={() => setCible(null)}
      onConfirm={confirmer}
    />
  )

  return { demander, dialogue }
}
