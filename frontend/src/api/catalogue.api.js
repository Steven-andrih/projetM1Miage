import axiosClient from './axiosClient'

/** GET /api/categories/ */
export function getCategories() {
  return axiosClient.get('/categories/').then((res) => res.data)
}

/** POST /api/categories/ */
export function createCategorie(payload) {
  return axiosClient.post('/categories/', payload).then((res) => res.data)
}

/** PATCH /api/categories/{id}/ */
export function updateCategorie(id, payload) {
  return axiosClient.patch(`/categories/${id}/`, payload).then((res) => res.data)
}

/** DELETE /api/categories/{id}/ */
export function deleteCategorie(id) {
  return axiosClient.delete(`/categories/${id}/`)
}

/** GET /api/services/ */
export function getServices() {
  return axiosClient.get('/services/').then((res) => res.data)
}

/** POST /api/services/ */
export function createService(payload) {
  return axiosClient.post('/services/', payload).then((res) => res.data)
}

/** PATCH /api/services/{id}/ */
export function updateService(id, payload) {
  return axiosClient.patch(`/services/${id}/`, payload).then((res) => res.data)
}

/** DELETE /api/services/{id}/ */
export function deleteService(id) {
  return axiosClient.delete(`/services/${id}/`)
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
