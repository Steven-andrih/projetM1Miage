import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import * as demandesApi from '../../api/demandes.api'
import { unwrapList } from '../../utils/api'
import { useAuth } from '../../auth/useAuth'
import { useCatalogue } from '../catalogue/useCatalogue'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import DemandeFilters from './DemandeFilters'
import DemandeListView from './DemandeListView'

const INITIAL_FILTERS = {
  search: '',
  statut: '',
  urgence: '',
  categorieId: '',
  serviceId: '',
  sort: 'date_desc',
}

export default function DemandeListContainer() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { categories, services } = useCatalogue()

  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  useEffect(() => {
    demandesApi
      .getDemandes()
      .then((data) => {
        const all = unwrapList(data)
        const mine = user?.profileId ? all.filter((d) => d.client === user.profileId) : all
        setDemandes(mine)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [user])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'categorieId' ? { serviceId: '' } : {}),
    }))
  }

  const handleReset = () => setFilters(INITIAL_FILTERS)

  const filteredDemandes = useMemo(() => {
    const search = filters.search.trim().toLowerCase()

    let result = demandes.filter((d) => {
      if (search && !`${d.titre} ${d.description}`.toLowerCase().includes(search)) return false
      if (filters.statut && d.statut !== filters.statut) return false
      if (filters.urgence && d.urgence !== filters.urgence) return false
      if (filters.serviceId && d.service !== filters.serviceId) return false
      if (filters.categorieId && !filters.serviceId) {
        const service = services.find((s) => s.id === d.service)
        if (!service || service.categorie !== filters.categorieId) return false
      }
      return true
    })

    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case 'date_asc':
          return new Date(a.date_creation) - new Date(b.date_creation)
        case 'budget_desc':
          return Number(b.budget_max ?? b.budget_min ?? 0) - Number(a.budget_max ?? a.budget_min ?? 0)
        case 'budget_asc':
          return Number(a.budget_min ?? a.budget_max ?? 0) - Number(b.budget_min ?? b.budget_max ?? 0)
        case 'date_desc':
        default:
          return new Date(b.date_creation) - new Date(a.date_creation)
      }
    })

    return result
  }, [demandes, filters, services])

  if (loading) return <LoadingSpinner label="Chargement de vos demandes…" />

  return (
    <>
      <PageHeader
        title="Mes demandes"
        subtitle="Suivez vos demandes de service"
        showBack
        backTo="/client/dashboard"
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/client/demandes/nouvelle')}>
            Nouvelle demande
          </Button>
        }
      />
      {error && <ErrorMessage message="Impossible de charger vos demandes." />}
      <DemandeFilters
        filters={filters}
        categories={categories}
        services={services}
        onChange={handleFilterChange}
        onReset={handleReset}
      />
      <DemandeListView demandes={filteredDemandes} onOpen={(id) => navigate(`/client/demandes/${id}`)} />
    </>
  )
}
