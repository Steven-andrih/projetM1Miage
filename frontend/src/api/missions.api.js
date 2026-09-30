import axiosClient from './axiosClient'

export function getMissions() {
  return axiosClient.get('/missions/').then((res) => res.data)
}

export function getMission(id) {
  return axiosClient.get(`/missions/${id}/`).then((res) => res.data)
}

export function updateMission(id, payload) {
  return axiosClient.patch(`/missions/${id}/`, payload).then((res) => res.data)
}
