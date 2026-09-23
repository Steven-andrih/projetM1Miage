/**
 * Décode le payload d'un JWT côté client (aucune vérification de signature :
 * uniquement pour lire des informations non sensibles comme le username).
 */
export function decodeJwt(token) {
  if (!token) return null
  try {
    const base64Payload = token.split('.')[1]
    const normalized = base64Payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(normalized))
  } catch {
    return null
  }
}