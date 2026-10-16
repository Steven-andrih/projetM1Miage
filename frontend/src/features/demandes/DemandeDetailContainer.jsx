import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Snackbar, Typography } from '@mui/material'
import * as demandesApi from '../../api/demandes.api'
import * as propositionsApi from '../../api/propositions.api'
import * as recommandationsApi from '../../api/recommandations.api'
import * as messagerieApi from '../../api/messagerie.api'
import { useToast } from '../../components/ToastProvider'
import { unwrapList } from '../../utils/api'
import { useAuth } from '../../auth/useAuth'
import { useCatalogue } from '../catalogue/useCatalogue'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import ConfirmDialog from '../../components/ConfirmDialog'
import DemandeDetailView from './DemandeDetailView'
import PropositionsRecuesList from './PropositionsRecuesList'
import RecommendationsSection from './RecommendationsSection'

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
  const [refuseTargetId, setRefuseTargetId] = useState(null)
  const [refusing, setRefusing] = useState(false)
  const { showToast } = useToast()

  const [recommandations, setRecommandations] = useState([])
  const [recoLoaded, setRecoLoaded] = useState(false)
  const [recoLoading, setRecoLoading] = useState(false)
  const [recoError, setRecoError] = useState(false)

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
          statut: demandeData.statut ?? 'BROUILLON',
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
    setRecoLoaded(false)
    setRecommandations([])
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

  const handleConfirmRefuse = async () => {
    setRefusing(true)
    try {
      await propositionsApi.refuseProposition(refuseTargetId)
      setRefuseTargetId(null)
      showToast('Proposition refusée.', 'info')
      loadAll()
    } catch {
      setError(true)
    } finally {
      setRefusing(false)
    }
  }

  const handleDiscuss = async (propositionId) => {
    try {
      const conversation = await messagerieApi.ouvrirConversation(propositionId)
      navigate(`/client/messages/${conversation.id}`)
    } catch {
      showToast("Impossible d'ouvrir la conversation.", 'error')
    }
  }

  const handleLoadRecommandations = () => {
    setRecoLoaded(true)
    setRecoLoading(true)
    setRecoError(false)
    recommandationsApi
      .getRecommandations(id)
      .then((data) => setRecommandations(unwrapList(data)))
      .catch(() => setRecoError(true))
      .finally(() => setRecoLoading(false))
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
          <PropositionsRecuesList
            propositions={propositions}
            demande={demande}
            onAccept={(pid) => setAcceptTargetId(pid)}
            onRefuse={(pid) => setRefuseTargetId(pid)}
            onDiscuss={handleDiscuss}
          />

          <RecommendationsSection
            recommandations={recommandations}
            loading={recoLoading}
            error={recoError}
            loaded={recoLoaded}
            onLoad={handleLoadRecommandations}
          />
        </>
      )}

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Supprimer cette demande ?"
        message="Cette action est irréversible. La demande sera définitivement supprimée."
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={deleting}
        loadingLabel="Suppression…"
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

      <ConfirmDialog
        open={Boolean(refuseTargetId)}
        title="Refuser cette proposition ?"
        message="Le prestataire en sera informé. La conversation associée passera en lecture seule."
        confirmLabel="Refuser"
        confirmColor="error"
        loading={refusing}
        onCancel={() => setRefuseTargetId(null)}
        onConfirm={handleConfirmRefuse}
      />

      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Opération effectuée avec succès.
        </Alert>
      </Snackbar>
    </>
  )
}
