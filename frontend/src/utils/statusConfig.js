// Libellés et couleurs des statuts de toutes les ressources
// (demandes, propositions, missions). Partagé entre les puces et les graphiques.
export const STATUS_CONFIG = {
  BROUILLON: { label: 'Brouillon', palette: null },
  PUBLIEE: { label: 'Publiée', palette: 'info' },
  EN_COURS: { label: 'En cours', palette: 'warning' },
  TERMINEE: { label: 'Terminée', palette: 'success' },
  ANNULEE: { label: 'Annulée', palette: 'error' },
  EN_ATTENTE: { label: 'En attente', palette: 'warning' },
  ACCEPTEE: { label: 'Acceptée', palette: 'success' },
  REFUSEE: { label: 'Refusée', palette: 'error' },
}

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] || { label: status, palette: null }
}

/** Couleur d'un statut à partir du thème MUI. */
export function getStatusColor(theme, status) {
  const { palette } = getStatusConfig(status)
  return palette ? theme.palette[palette].main : theme.palette.text.secondary
}
