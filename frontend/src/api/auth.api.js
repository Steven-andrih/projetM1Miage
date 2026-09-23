import axiosClient from './axiosClient'

/** POST /api/token/ -> { access, refresh } */
export function login(username, password) {
  return axiosClient.post('/token/', { username, password }).then((res) => res.data)
}

/** POST /api/users/register/ */
export function register(payload) {
  return axiosClient.post('/users/register/', payload).then((res) => res.data)
}

/** GET /api/users/client/me/ */
export function getClientProfile() {
  return axiosClient.get('/users/client/me/').then((res) => res.data)
}

/** GET /api/users/prestataire/me/ */
export function getPrestataireProfile() {
  return axiosClient.get('/users/prestataire/me/').then((res) => res.data)
}