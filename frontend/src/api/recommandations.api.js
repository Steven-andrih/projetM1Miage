import axiosClient from './axiosClient'

/** GET /api/demandes/{id}/recommandations/ */
export function getRecommandations(demandeId) {
  return axiosClient.get(`/demandes/${demandeId}/recommandations/`).then((res) => res.data)
}
