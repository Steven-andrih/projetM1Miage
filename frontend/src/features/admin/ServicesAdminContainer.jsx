import { useEffect, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import * as catalogueApi from '../../api/catalogue.api'
import { unwrapList } from '../../utils/api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import ConfirmDialog from '../../components/ConfirmDialog'
import ServicesAdminView from './ServicesAdminView'

const EMPTY_FORM = { nom: '', categorie: '', description: '', active: true }

export default function ServicesAdminContainer() {
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [successOpen, setSuccessOpen] = useState(false)

  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([catalogueApi.getServices(), catalogueApi.getCategories()])
      .then(([servicesData, categoriesData]) => {
        setServices(unwrapList(servicesData))
        setCategories(unwrapList(categoriesData))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggleActive = () => {
    setForm((prev) => ({ ...prev, active: !prev.active }))
  }

  const openCreateDialog = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEditDialog = (service) => {
    setEditingId(service.id)
    setForm({
      nom: service.nom ?? '',
      categorie: service.categorie ?? '',
      description: service.description ?? '',
      active: Boolean(service.active),
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(false)
    try {
      if (editingId) {
        await catalogueApi.updateService(editingId, form)
      } else {
        await catalogueApi.createService(form)
      }
      setDialogOpen(false)
      setSuccessOpen(true)
      load()
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    setDeleting(true)
    try {
      await catalogueApi.deleteService(deleteTargetId)
      setDeleteTargetId(null)
      load()
    } catch {
      setError(true)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Chargement des services…" />

  return (
    <>
      <PageHeader
        title="Gestion des services"
        subtitle="Créez, modifiez ou supprimez les services proposés"
        showBack
        backTo="/admin/dashboard"
      />
      {error && <ErrorMessage message="Impossible de charger ou d'enregistrer les services." />}
      <ServicesAdminView
        services={services}
        categories={categories}
        dialogOpen={dialogOpen}
        editingId={editingId}
        form={form}
        submitting={submitting}
        onOpenCreate={openCreateDialog}
        onOpenEdit={openEditDialog}
        onDeleteRequest={(id) => setDeleteTargetId(id)}
        onClose={() => setDialogOpen(false)}
        onChange={handleChange}
        onToggleActive={handleToggleActive}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Supprimer ce service ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={deleting}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Service enregistré avec succès.
        </Alert>
      </Snackbar>
    </>
  )
}
