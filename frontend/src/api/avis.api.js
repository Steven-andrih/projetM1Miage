import axiosClient from './axiosClient'

export function getAvis() {
  return axiosClient.get('/avis/').then((res) => res.data)
}

export function createAvis(payload) {
  return axiosClient.post('/avis/', payload).then((res) => res.data)
}
