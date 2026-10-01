// Petit bus d'événements pour déclencher un toast depuis n'importe où,
// y compris en dehors de l'arbre React (ex. axiosClient.js).
const listeners = new Set()

export function subscribeToast(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function emitToast(message, severity = 'info') {
  listeners.forEach((listener) => listener({ message, severity }))
}
