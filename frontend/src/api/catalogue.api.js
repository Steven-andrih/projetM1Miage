import axiosClient from './axiosClient'

/** GET /api/categories/ */
export function getCategories() {
  return axiosClient.get('/categories/').then((res) => res.data)
}

/** GET /api/services/ */
export function getServices() {
  return axiosClient.get('/services/').then((res) => res.data)
}

/** GET /api/prestataire-services/ */
export function getPrestataireServices() {
  return axiosClient.get('/prestataire-services/').then((res) => res.data)
}

/** POST /api/prestataire-services/ */
export function createPrestataireService(payload) {
  return axiosClient.post('/prestataire-services/', payload).then((res) => res.data)
}

/** PATCH /api/prestataire-services/{id}/ */
export function updatePrestataireService(id, payload) {
  return axiosClient.patch(`/prestataire-services/${id}/`, payload).then((res) => res.data)
}

/** DELETE /api/prestataire-services/{id}/ */
export function deletePrestataireService(id) {
  return axiosClient.delete(`/prestataire-services/${id}/`)
}