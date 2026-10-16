// Statut de vérification d'identité d'un prestataire, tel qu'affiché dans l'interface.
// Le backend ne distingue que EN_ATTENTE / VALIDE / REFUSE : « non vérifié »
// correspond à EN_ATTENTE sans document envoyé.

export const TYPES_DOCUMENT = [
  { value: 'CIN', label: "Carte d'identité (CIN)" },
  { value: 'PASSEPORT', label: 'Passeport' },
  { value: 'PERMIS', label: 'Permis de conduire' },
]

export function libelleTypeDocument(value) {
  return TYPES_DOCUMENT.find((t) => t.value === value)?.label || value || '—'
}

export const VERIFICATION = {
  VERIFIE: { label: 'Vérifié', palette: 'success', description: 'Votre identité a été vérifiée. Le badge « Vérifié » est visible par les clients.' },
  EN_COURS: { label: 'En cours de vérification', palette: 'warning', description: "Votre document a bien été reçu. L'administration le vérifie sous peu." },
  REFUSE: { label: 'Refusé', palette: 'error', description: 'Votre document a été refusé. Vous pouvez en envoyer un nouveau.' },
  NON_VERIFIE: { label: 'Non vérifié', palette: 'info', description: "Envoyez une pièce d'identité pour gagner la confiance des clients." },
}

/** Calcule la clé de VERIFICATION à partir du statut de validation et de la présence d'un document. */
export function statutVerification(statutValidation, aDocument) {
  if (statutValidation === 'VALIDE') return 'VERIFIE'
  if (statutValidation === 'REFUSE') return 'REFUSE'
  return aDocument ? 'EN_COURS' : 'NON_VERIFIE'
}
