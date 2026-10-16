import { useEffect, useState } from 'react'

/**
 * Charge un fichier protégé (Blob via axios authentifié) et expose une URL locale.
 * `fetcher` doit être stable (useCallback) ; `cle` permet de forcer un rechargement.
 */
export default function useBlobUrl(fetcher, cle) {
  const [state, setState] = useState({ url: null, loading: Boolean(fetcher), error: false })

  useEffect(() => {
    if (!fetcher) return undefined
    let annule = false
    let url = null
    Promise.resolve()
      .then(() => {
        if (!annule) setState((prev) => ({ ...prev, loading: true, error: false }))
        return fetcher()
      })
      .then((blob) => {
        if (annule) return
        url = URL.createObjectURL(blob)
        setState({ url, loading: false, error: false })
      })
      .catch(() => {
        if (!annule) setState({ url: null, loading: false, error: true })
      })
    return () => {
      annule = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [fetcher, cle])

  return state
}
