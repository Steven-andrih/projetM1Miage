import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import * as catalogueApi from '../../api/catalogue.api';
import { unwrapList } from '../../utils/api';
import { useAuth } from '../../auth/useAuth';
import { useCatalogue } from '../catalogue/useCatalogue';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import MesServicesView from './MesServicesView';

const EMPTY_FORM = { service: '', tarif_min: '', tarif_max: '' };

export default function MesServicesContainer() {
  const { user } = useAuth();
  const {
    services,
    loading: catalogueLoading,
    error: catalogueError,
  } = useCatalogue();

  const [myServices, setMyServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const loadMyServices = () => {
    setLoading(true);
    catalogueApi
      .getPrestataireServices()
      .then((data) => {
        // Le backend filtre déjà par prestataire propriétaire (cf. README) :
        // pas de filtrage supplémentaire côté front.
        setMyServices(unwrapList(data));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMyServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setEditingId(item.id);
    setForm({
      service: item.service,
      tarif_min: item.tarif_min ?? '',
      tarif_max: item.tarif_max ?? '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await catalogueApi.deletePrestataireService(id);
      loadMyServices();
    } catch {
      setError(true);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const payload = {
        service: form.service,
        tarif_min: form.tarif_min === '' ? null : Number(form.tarif_min),
        tarif_max: form.tarif_max === '' ? null : Number(form.tarif_max),
      };
      if (editingId) {
        await catalogueApi.updatePrestataireService(editingId, payload);
      } else {
        await catalogueApi.createPrestataireService(payload);
      }
      setDialogOpen(false);
      setSuccessOpen(true);
      loadMyServices();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || catalogueLoading)
    return <LoadingSpinner label="Chargement de vos services…" />;

  return (
    <>
      <PageHeader
        title="Mes services"
        subtitle="Gérez les services que vous proposez et vos tarifs"
      />
      {(error || catalogueError) && (
        <ErrorMessage message="Impossible de charger ou d'enregistrer vos services." />
      )}
      <MesServicesView
        myServices={myServices}
        services={services}
        dialogOpen={dialogOpen}
        editingId={editingId}
        form={form}
        submitting={submitting}
        onOpenCreate={openCreateDialog}
        onOpenEdit={openEditDialog}
        onDelete={handleDelete}
        onClose={() => setDialogOpen(false)}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Service enregistré avec succès.
        </Alert>
      </Snackbar>
    </>
  );
}
