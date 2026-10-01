import { useEffect, useState } from 'react'
import { Alert, Snackbar } from '@mui/material'
import * as catalogueApi from '../../api/catalogue.api'
import { unwrapList } from '../../utils/api'
import PageHeader from '../../components/PageHeader'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorMessage from '../../components/ErrorMessage'
import ConfirmDialog from '../../components/ConfirmDialog'
import CategoriesAdminView from './CategoriesAdminView'

const EMPTY_FORM = { nom: '', description: '' }

export default function CategoriesAdminContainer() {
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
    catalogueApi
      .getCategories()
      .then((data) => setCategories(unwrapList(data)))
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

  const openCreateDialog = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEditDialog = (cat) => {
    setEditingId(cat.id)
    setForm({ nom: cat.nom ?? '', description: cat.description ?? '' })
    setDialogOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError(false)
    try {
      if (editingId) {
        await catalogueApi.updateCategorie(editingId, form)
      } else {
        await catalogueApi.createCategorie(form)
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
      await catalogueApi.deleteCategorie(deleteTargetId)
      setDeleteTargetId(null)
      load()
    } catch {
      setError(true)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Chargement des catégories…" />

  return (
    <>
      <PageHeader
        title="Gestion des catégories"
        subtitle="Créez, modifiez ou supprimez les catégories de services"
        showBack
        backTo="/admin/dashboard"
      />
      {error && <ErrorMessage message="Impossible de charger ou d'enregistrer les catégories." />}
      <CategoriesAdminView
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
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Supprimer cette catégorie ?"
        message="Cette action est irréversible. Les services associés pourraient être affectés."
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={deleting}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
      <Snackbar open={successOpen} autoHideDuration={3000} onClose={() => setSuccessOpen(false)}>
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Catégorie enregistrée avec succès.
        </Alert>
      </Snackbar>
    </>
  )
}
