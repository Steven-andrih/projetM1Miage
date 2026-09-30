import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Snackbar, Typography } from '@mui/material'
import * as demandesApi from '../../api/demandes.api'
import * as propositionsApi from '../../api/propositions.api'
import { unwrapList } from '../../utils/api'
import { useAuth } from '../../auth/useAuth'
import { useCatalogue } from '../catalogue/useCatalogue'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import ConfirmDialog from '../../components/ConfirmDialog'
import DemandeDetailView from './DemandeDetailView'
import PropositionsRecuesList from './PropositionsRecuesList'

export default function DemandeDetailContainer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { categories, services, loading: catalogueLoading } = useCatalogue()

  const [demande, setDemande] = useState(null)
  const [propositions, setPropositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(null)
  const [categorieFilter, setCategorieFilter] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [acceptTargetId, setAcceptTargetId] = useState(null)
  const [accepting, setAccepting] = useState(false)

  const loadAll = () => {
    setLoading(true)
    Promise.all([demandesApi.getDemande(id), propositionsApi.getPropositions()])
      .then(([demandeData, propositionsData]) => {
        setDemande(demandeData)
        setForm({
          titre: demandeData.titre ?? '',
          description: demandeData.description ?? '',
          service: demandeData.service ?? '',
          budget_min: demandeData.budget_min ?? '',
          budget_max: demandeData.budget_max ?? '',
          date_souhaitee: demandeData.date_souhaitee ?? '',
          urgence: demandeData.urgence ?? 'NORMALE',
          adresse: demandeData.adresse ?? '',
          latitude: demandeData.latitude ?? '',
          longitude: demandeData.longitude ?? '',
        })
        const allPropositions = unwrapList(propositionsData)
        setPropositions(allPropositions.filter((p) => p.demande === Number(id)))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const isOwner = demande && user?.profileId && demande.client === user.profileId

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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(false)
    try {
      const payload = {
        ...form,
        budget_min: form.budget_min === '' ? null : Number(form.budget_min),
        budget_max: form.budget_max === '' ? null : Number(form.budget_max),
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        date_souhaitee: form.date_souhaitee || null,
      }
      await demandesApi.updateDemande(id, payload)
      setSuccessOpen(true)
      setEditMode(false)
      loadAll()
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    try {
      await demandesApi.deleteDemande(id)
      navigate('/client/demandes', { replace: true })
    } catch {
      setError(true)
      setDeleting(false)
      setConfirmDeleteOpen(false)
    }
  }

  const handleConfirmAccept = async () => {
    setAccepting(true)
    try {
      await propositionsApi.acceptProposition(acceptTargetId)
      setAcceptTargetId(null)
      setSuccessOpen(true)
      loadAll()
    } catch {
      setError(true)
    } finally {
      setAccepting(false)
    }
  }

  if (loading || catalogueLoading) return <LoadingSpinner label="Chargement de la demande…" />
  if (!demande) return <ErrorMessage message="Cette demande est introuvable." />

  return (
    <>
      <PageHeader title={demande.titre} subtitle={`Demande #${demande.id}`} showBack backTo="/client/demandes" />
      {error && <ErrorMessage message="Une erreur est survenue." />}
      <DemandeDetailView
        demande={demande}
        isOwner={isOwner}
        editMode={editMode}
        form={form}
        categories={categories}
        services={services}
        categorieFilter={categorieFilter}
        submitting={submitting}
        onEdit={() => setEditMode(true)}
        onCancelEdit={() => setEditMode(false)}
        onDeleteRequest={() => setConfirmDeleteOpen(true)}
        onChange={handleChange}
        onCategoryFilterChange={handleCategoryFilterChange}
        onLocate={handleLocate}
        onDescriptionImproved={handleDescriptionImproved}
        onSubmit={handleSubmit}
      />

      {isOwner && !editMode && (
        <>
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Propositions reçues
          </Typography>
          <PropositionsRecuesList propositions={propositions} onAccept={(pid) => setAcceptTargetId(pid)} />
        </>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Supprimer cette demande ?"
        message="Cette action est irréversible. La demande sera définitivement supprimée."
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={deleting}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmDialog
        open={Boolean(acceptTargetId)}
        title="Accepter cette proposition ?"
        message="Les autres propositions seront automatiquement refusées et une mission sera créée."
        confirmLabel="Accepter"
        confirmColor="primary"
        loading={accepting}
        onCancel={() => setAcceptTargetId(null)}
        onConfirm={handleConfirmAccept}
      />

      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Opération effectuée avec succès.
        </Alert>
      </Snackbar>
    </>
  )
}
