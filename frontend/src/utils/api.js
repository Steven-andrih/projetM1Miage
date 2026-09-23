/**
 * Normalise une réponse de liste DRF, qu'elle soit paginée
 * ({ count, next, previous, results }) ou brute (tableau simple).
 */
export function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.results)) return data.results
  return []
}