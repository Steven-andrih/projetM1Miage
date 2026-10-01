import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Snackbar, Stack } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import PublishIcon from '@mui/icons-material/Publish'
import * as demandesApi from '../../api/demandes.api'
import { useCatalogue } from '../catalogue/useCatalogue'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import DemandeFormFields from './DemandeFormFields'

const EMPTY_FORM = {
  titre: '',
  description: '',
  service: '',
  budget_min: '',
  budget_max: '',
  date_souhaitee: '',
  urgence: 'NORMALE',
  adresse: '',
  latitude: '',
  longitude: '',
}

export default function DemandeCreateContainer() {
  const navigate = useNavigate()
  const { categories, services, loading: catalogueLoading, error: catalogueError } = useCatalogue()

  const [form, setForm] = useState(EMPTY_FORM)
  const [categorieFilter, setCategorieFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryFilterChange = (event) => {
    setCategorieFilter(event.target.value)
    setForm((prev) => ({ ...prev, service: '' }))
  }

  const handleLocate = (latitude, longitude) => {
    setForm((prev) => ({ ...prev, latitude, longitude }))
  }

  const handleDescriptionImproved = (texteAmeliore) => {
    setForm((prev) => ({ ...prev, description: texteAmeliore }))
  }

  const submitWithStatut = async (statut) => {
    setSubmitting(true)
    setError(false)
    try {
      const payload = {
        ...form,
        statut,
        budget_min: form.budget_min === '' ? null : Number(form.budget_min),
        budget_max: form.budget_max === '' ? null : Number(form.budget_max),
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        date_souhaitee: form.date_souhaitee || null,
      }
      const created = await demandesApi.createDemande(payload)
      setSuccessOpen(true)
      navigate(`/client/demandes/${created.id}`, { replace: true })
    } catch {
      setError(true)
      setSubmitting(false)
    }
  }

  const handleSaveBrouillon = (event) => {
    event.preventDefault()
    submitWithStatut('BROUILLON')
  }

  const handlePublier = (event) => {
    event.preventDefault()
    submitWithStatut('PUBLIEE')
  }

  if (catalogueLoading) return <LoadingSpinner label="Chargement du catalogue…" />

  return (
    <>
      <PageHeader
        title="Nouvelle demande"
        subtitle="Décrivez le service dont vous avez besoin"
        showBack
        backTo="/client/demandes"
      />
      {(error || catalogueError) && (
        <ErrorMessage message="Impossible de créer la demande. Vérifiez les champs saisis." />
      )}
      <form noValidate>
        <DemandeFormFields
          form={form}
          categories={categories}
          services={services}
          categorieFilter={categorieFilter}
          onChange={handleChange}
          onCategoryFilterChange={handleCategoryFilterChange}
          onLocate={handleLocate}
          onDescriptionImproved={handleDescriptionImproved}
        />
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            type="button"
            variant="outlined"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSaveBrouillon}
            disabled={submitting}
          >
            Enregistrer en brouillon
          </Button>
          <Button
            type="button"
            variant="contained"
            size="large"
            startIcon={<PublishIcon />}
            onClick={handlePublier}
            disabled={submitting}
          >
            {submitting ? 'Publication…' : 'Publier la demande'}
          </Button>
        </Stack>
      </form>
      <Snackbar open={successOpen} autoHideDuration={3000}>
        <Alert severity="success">Demande créée avec succès.</Alert>
      </Snackbar>
    </>
  )
}
