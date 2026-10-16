import { useContext } from 'react'
import { NotificationsContext } from './notificationsContext'

export default function useNotifications() {
  return useContext(NotificationsContext)
}
