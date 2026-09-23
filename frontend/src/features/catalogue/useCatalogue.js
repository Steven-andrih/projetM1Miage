import { useEffect, useState } from 'react'
import * as catalogueApi from '../../api/catalogue.api'
import { unwrapList } from '../../utils/api'

export function useCatalogue() {
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([catalogueApi.getCategories(), catalogueApi.getServices()])
      .then(([categoriesData, servicesData]) => {
        setCategories(unwrapList(categoriesData))
        setServices(unwrapList(servicesData))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return { categories, services, loading, error }
}