import { useCallback, useEffect, useState } from 'react'
import { NotificationsContext } from '../hooks/notificationsContext'
import { useAuth } from '../auth/useAuth'
import * as messagerieApi from '../api/messagerie.api'
import * as adminApi from '../api/admin.api'

const INTERVALLE_MS = 15000

/** Interroge périodiquement le serveur (polling) pour les pastilles du menu. */
export default function NotificationsProvider({ children }) {
  const { role } = useAuth()
  const [compteurs, setCompteurs] = useState({ messagesNonLus: 0, verificationsEnAttente: 0 })

  const refresh = useCallback(() => {
    if (role === 'CLIENT' || role === 'PRESTATAIRE') {
      messagerieApi
        .getNonLus()
        .then((n) => setCompteurs((prev) => (prev.messagesNonLus === n ? prev : { ...prev, messagesNonLus: n })))
        .catch(() => {})
    } else if (role === 'ADMIN') {
      adminApi
        .getVerifications('EN_ATTENTE')
        .then((liste) =>
          setCompteurs((prev) =>
            prev.verificationsEnAttente === liste.length ? prev : { ...prev, verificationsEnAttente: liste.length },
          ),
        )
        .catch(() => {})
    }
  }, [role])

  useEffect(() => {
    const premier = setTimeout(refresh, 0)
    const intervalle = setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, INTERVALLE_MS)
    return () => {
      clearTimeout(premier)
      clearInterval(intervalle)
    }
  }, [refresh])

  return (
    <NotificationsContext.Provider value={{ ...compteurs, refresh }}>
      {children}
    </NotificationsContext.Provider>
  )
}
