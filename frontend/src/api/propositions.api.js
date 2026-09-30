import axiosClient from './axiosClient'

export function getPropositions() {
  return axiosClient.get('/propositions/').then((res) => res.data)
}

export function getProposition(id) {
  return axiosClient.get(`/propositions/${id}/`).then((res) => res.data)
}

export function createProposition(payload) {
  return axiosClient.post('/propositions/', payload).then((res) => res.data)
}

export function updateProposition(id, payload) {
  return axiosClient.patch(`/propositions/${id}/`, payload).then((res) => res.data)
}

export function deleteProposition(id) {
  return axiosClient.delete(`/propositions/${id}/`)
}

/** POST /api/propositions/{id}/accepter/ — utilisé à l'étape 6 (acceptation côté client) */
export function acceptProposition(id) {
  return axiosClient.post(`/propositions/${id}/accepter/`).then((res) => res.data)
}