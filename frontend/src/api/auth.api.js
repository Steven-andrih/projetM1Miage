import axiosClient from './axiosClient'

/** POST /api/token/ -> { access, refresh } */
export function login(username, password) {
  return axiosClient.post('/token/', { username, password }).then((res) => res.data)
}

/** POST /api/users/register/ */
export function register(payload) {
  return axiosClient.post('/users/register/', payload).then((res) => res.data)
}