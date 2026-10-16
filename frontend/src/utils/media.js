import { API_BASE_URL } from '../api/axiosClient'

// Origine du backend (ex. http://127.0.0.1:8000), qui sert les fichiers publics /media/...
const ORIGINE_BACKEND = new URL(API_BASE_URL).origin

/** Transforme un chemin renvoyé par l'API (/media/photos/x.jpg) en URL complète. */
export function mediaUrl(chemin) {
  if (!chemin) return null
  if (/^https?:\/\//.test(chemin)) return chemin
  return `${ORIGINE_BACKEND}${chemin.startsWith('/') ? '' : '/'}${chemin}`
}
