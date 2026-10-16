import axiosClient from './axiosClient'

/** GET /api/admin/utilisateurs/?role=&search=&actif=&statut_validation= */
export function getUtilisateurs(params = {}) {
  const query = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  return axiosClient.get('/admin/utilisateurs/', { params: query }).then((res) => res.data)
}

export function getUtilisateur(id) {
  return axiosClient.get(`/admin/utilisateurs/${id}/`).then((res) => res.data)
}

export function desactiverUtilisateur(id) {
  return axiosClient.post(`/admin/utilisateurs/${id}/desactiver/`).then((res) => res.data)
}

export function reactiverUtilisateur(id) {
  return axiosClient.post(`/admin/utilisateurs/${id}/reactiver/`).then((res) => res.data)
}

/** Suppression : le compte est anonymisé, l'historique des missions est conservé. */
export function supprimerUtilisateur(id) {
  return axiosClient.delete(`/admin/utilisateurs/${id}/`)
}

/** GET /api/admin/verifications/?statut=EN_ATTENTE|VALIDE|REFUSE|TOUS */
export function getVerifications(statut = 'EN_ATTENTE') {
  return axiosClient.get('/admin/verifications/', { params: { statut } }).then((res) => res.data)
}

/** Pièce d'identité d'un prestataire, en Blob (jamais exposée par une URL publique). */
export function getDocumentPrestataire(prestataireId) {
  return axiosClient
    .get(`/admin/prestataires/${prestataireId}/document/`, { responseType: 'blob' })
    .then((res) => res.data)
}

export function validerPrestataire(prestataireId) {
  return axiosClient.post(`/admin/prestataires/${prestataireId}/valider/`).then((res) => res.data)
}

export function refuserPrestataire(prestataireId, motif) {
  return axiosClient.post(`/admin/prestataires/${prestataireId}/refuser/`, { motif }).then((res) => res.data)
}
