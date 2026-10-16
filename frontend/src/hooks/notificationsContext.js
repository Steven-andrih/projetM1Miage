import { createContext } from 'react'

/** Compteurs affichés en pastille dans le menu : messages non lus, vérifications à traiter. */
export const NotificationsContext = createContext({
  messagesNonLus: 0,
  verificationsEnAttente: 0,
  refresh: () => {},
})
