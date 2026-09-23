import axiosClient from './axiosClient'

/** GET /api/users/client/me/ */
export function getClientProfile() {
  return axiosClient.get('/users/client/me/').then((res) => res.data)
}

/** PATCH /api/users/client/me/ */
export function updateClientProfile(data) {
  return axiosClient.patch('/users/client/me/', data).then((res) => res.data)
}

/** GET /api/users/prestataire/me/ */
export function getPrestataireProfile() {
  return axiosClient.get('/users/prestataire/me/').then((res) => res.data)
}

/** PATCH /api/users/prestataire/me/ */
export function updatePrestataireProfile(data) {
  return axiosClient.patch('/users/prestataire/me/', data).then((res) => res.data)
}