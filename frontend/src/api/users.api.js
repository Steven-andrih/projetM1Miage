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

/** GET /api/users/prestataires/carte/ */
export function getPrestatairesCarte() {
  return axiosClient.get('/users/prestataires/carte/').then((res) => res.data)
}

/** GET /api/users/prestataires/{id}/ : profil public d'un prestataire */
export function getPrestatairePublic(id) {
  return axiosClient.get(`/users/prestataires/${id}/`).then((res) => res.data)
}

/** GET /api/users/prestataire/me/document/ : sa propre pièce d'identité, en Blob */
export function getMonDocument() {
  return axiosClient.get('/users/prestataire/me/document/', { responseType: 'blob' }).then((res) => res.data)
}

/** POST multipart /api/users/prestataire/me/document/ avec suivi de progression */
export function envoyerDocument({ typeDocument, fichier }, onProgress) {
  const formData = new FormData()
  formData.append('type_document', typeDocument)
  formData.append('document', fichier)
  return axiosClient
    .post('/users/prestataire/me/document/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
      },
    })
    .then((res) => res.data)
}

/** GET /api/users/me/ : compte de l'utilisateur connecté (nom, photo...) */
export function getMe() {
  return axiosClient.get('/users/me/').then((res) => res.data)
}

/** POST multipart /api/users/me/photo/ : envoie ou remplace sa photo de profil */
export function envoyerPhoto(fichier, onProgress) {
  const formData = new FormData()
  formData.append('photo', fichier)
  return axiosClient
    .post('/users/me/photo/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) onProgress(Math.round((event.loaded / event.total) * 100))
      },
    })
    .then((res) => res.data)
}

/** DELETE /api/users/me/photo/ */
export function supprimerPhoto() {
  return axiosClient.delete('/users/me/photo/').then((res) => res.data)
}
