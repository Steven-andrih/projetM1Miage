// Formats d'affichage partagés (montants en Ariary, dates en français).

const nombre = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

/** 75000 -> "75 000 Ar" ; valeur vide -> "—" */
export function formatAriary(value) {
  if (value === null || value === undefined || value === '') return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return `${nombre.format(n)} Ar`
}

/** Fourchette de montants : "40 000 – 60 000 Ar", ou une seule borne. */
export function formatAriaryRange(min, max) {
  const hasMin = min !== null && min !== undefined && min !== ''
  const hasMax = max !== null && max !== undefined && max !== ''
  if (!hasMin && !hasMax) return null
  if (hasMin && hasMax) return `${nombre.format(Number(min))} – ${formatAriary(max)}`
  return formatAriary(hasMin ? min : max)
}

export function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export function formatHeure(value) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

/** "aujourd'hui", "hier" ou date courte, pour les listes de conversations. */
export function formatJourRelatif(value) {
  if (!value) return ''
  const date = new Date(value)
  const aujourdhui = new Date()
  const hier = new Date()
  hier.setDate(aujourdhui.getDate() - 1)
  if (date.toDateString() === aujourdhui.toDateString()) return formatHeure(value)
  if (date.toDateString() === hier.toDateString()) return 'Hier'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

/** Position d'un tarif par rapport au budget d'une demande. */
export function comparerAuBudget(tarif, budgetMin, budgetMax) {
  const t = Number(tarif)
  if (!tarif || Number.isNaN(t)) return null
  const min = budgetMin ? Number(budgetMin) : null
  const max = budgetMax ? Number(budgetMax) : null
  if (min === null && max === null) return null
  if (max !== null && t > max) return { niveau: 'au-dessus', ecart: t - max }
  if (min !== null && t < min) return { niveau: 'en-dessous', ecart: min - t }
  return { niveau: 'dans', ecart: 0 }
}
