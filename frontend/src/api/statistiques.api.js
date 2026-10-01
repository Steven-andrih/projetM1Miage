import axiosClient from './axiosClient'

export function getDashboardClient() {
  return axiosClient.get('/statistiques/dashboard/client/').then((res) => res.data)
}

export function getDashboardPrestataire() {
  return axiosClient.get('/statistiques/dashboard/prestataire/').then((res) => res.data)
}

export function getDashboardAdmin() {
  return axiosClient.get('/statistiques/dashboard/').then((res) => res.data)
}
