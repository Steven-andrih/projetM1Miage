import axiosClient from './axiosClient'

export function getDemandes() {
  return axiosClient.get('/demandes/').then((res) => res.data)
}

export function getDemande(id) {
  return axiosClient.get(`/demandes/${id}/`).then((res) => res.data)
}

export function createDemande(payload) {
  return axiosClient.post('/demandes/', payload).then((res) => res.data)
}

export function updateDemande(id, payload) {
  return axiosClient.patch(`/demandes/${id}/`, payload).then((res) => res.data)
}

export function deleteDemande(id) {
  return axiosClient.delete(`/demandes/${id}/`)
}