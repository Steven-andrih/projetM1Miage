import { useEffect, useState } from 'react'
import * as usersApi from '../../api/users.api'
import { unwrapList } from '../../utils/api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import CartePrestatairesView from './CartePrestatairesView'

export default function CartePrestatairesContainer() {
  const [prestataires, setPrestataires] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    usersApi
      .getPrestatairesCarte()
      .then((data) => setPrestataires(unwrapList(data)))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner label="Chargement de la carte…" />

  return (
    <>
      <PageHeader title="Carte des prestataires" subtitle="Localisez les prestataires validés autour de vous" />
      {error && <ErrorMessage message="Impossible de charger les prestataires." />}
      <CartePrestatairesView prestataires={prestataires} />
    </>
  )
}
