import axiosClient from './axiosClient'

/** POST /api/ia/ameliorer-description/ -> { texte_original, texte_ameliore } */
export function improveText({ texte, contexte }) {
  return axiosClient.post('/ia/ameliorer-description/', { texte, contexte }).then((res) => res.data)
}