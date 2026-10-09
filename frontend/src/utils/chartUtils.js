const formatMois = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: '2-digit' })

/**
 * Fusionne plusieurs séries mensuelles ({ mois, total }[]) en un dataset
 * [{ key: 'YYYY-MM', mois: Date, label: 'janv. 26', <serie>: n, ... }] trié par mois.
 * Les mois absents d'une série valent 0.
 */
export function buildMonthlyDataset(series) {
  const parMois = new Map()
  Object.entries(series).forEach(([cle, items]) => {
    ;(items ?? []).forEach(({ mois, total }) => {
      const key = String(mois).slice(0, 7)
      if (!parMois.has(key)) parMois.set(key, { key, mois: new Date(mois) })
      parMois.get(key)[cle] = Number(total) || 0
    })
  })
  const cles = Object.keys(series)
  return [...parMois.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((row) => {
      cles.forEach((cle) => {
        if (row[cle] == null) row[cle] = 0
      })
      return { ...row, label: formatMois.format(row.mois) }
    })
}

/** Transforme un objet { STATUT: n } en tableau trié, sans les valeurs nulles. */
export function statusCountsToArray(counts) {
  return Object.entries(counts ?? {})
    .map(([status, total]) => ({ status, total: Number(total) || 0 }))
    .filter((item) => item.total > 0)
}
