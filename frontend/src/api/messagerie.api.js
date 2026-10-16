import axiosClient from './axiosClient'

export function getConversations() {
  return axiosClient.get('/conversations/').then((res) => res.data)
}

export function getConversation(id) {
  return axiosClient.get(`/conversations/${id}/`).then((res) => res.data)
}

/** Messages d'une conversation ; `apres` = id du dernier message déjà chargé. */
export function getMessages(id, apres) {
  const params = apres ? { apres } : {}
  return axiosClient.get(`/conversations/${id}/messages/`, { params }).then((res) => res.data)
}

export function envoyerMessage(id, contenu) {
  return axiosClient.post(`/conversations/${id}/messages/`, { contenu }).then((res) => res.data)
}

export function marquerLu(id) {
  return axiosClient.post(`/conversations/${id}/lire/`).then((res) => res.data)
}

export function getNonLus() {
  return axiosClient.get('/conversations/non-lus/').then((res) => res.data.non_lus)
}

/** Ouvre (ou crée) la conversation d'une proposition. */
export function ouvrirConversation(propositionId) {
  return axiosClient.get(`/propositions/${propositionId}/conversation/`).then((res) => res.data)
}
