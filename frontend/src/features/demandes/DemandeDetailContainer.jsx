import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import * as demandesApi from '../../api/demandes.api';
import { useAuth } from '../../auth/useAuth';
import { useCatalogue } from '../catalogue/useCatalogue';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DemandeDetailView from './DemandeDetailView';

export default function DemandeDetailContainer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, services, loading: catalogueLoading } = useCatalogue();

  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [categorieFilter, setCategorieFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const loadDemande = () => {
    setLoading(true);
    demandesApi
      .getDemande(id)
      .then((data) => {
        setDemande(data);
        setForm({
          titre: data.titre ?? '',
          description: data.description ?? '',
          service: data.service ?? '',
          budget_min: data.budget_min ?? '',
          budget_max: data.budget_max ?? '',
          date_souhaitee: data.date_souhaitee ?? '',
          urgence: data.urgence ?? 'NORMALE',
          adresse: data.adresse ?? '',
          latitude: data.latitude ?? '',
          longitude: data.longitude ?? '',
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDemande();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner =
    demande && user?.profileId && demande.client === user.profileId;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryFilterChange = (event) => {
    setCategorieFilter(event.target.value);
    setForm((prev) => ({ ...prev, service: '' }));
  };

  const handleLocate = (latitude, longitude) => {
    setForm((prev) => ({ ...prev, latitude, longitude }));
  };

  const handleDescriptionImproved = (texteAmeliore) => {
    setForm((prev) => ({ ...prev, description: texteAmeliore }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const payload = {
        ...form,
        budget_min: form.budget_min === '' ? null : Number(form.budget_min),
        budget_max: form.budget_max === '' ? null : Number(form.budget_max),
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        date_souhaitee: form.date_souhaitee || null,
      };
      await demandesApi.updateDemande(id, payload);
      setSuccessOpen(true);
      setEditMode(false);
      loadDemande();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await demandesApi.deleteDemande(id);
      navigate('/client/demandes', { replace: true });
    } catch {
      setError(true);
    }
  };

  if (loading || catalogueLoading)
    return <LoadingSpinner label="Chargement de la demande…" />;
  if (!demande)
    return <ErrorMessage message="Cette demande est introuvable." />;

  return (
    <>
      <PageHeader title={demande.titre} subtitle={`Demande #${demande.id}`} />
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
        onDelete={handleDelete}
        onChange={handleChange}
        onCategoryFilterChange={handleCategoryFilterChange}
        onLocate={handleLocate}
        onDescriptionImproved={handleDescriptionImproved}
        onSubmit={handleSubmit}
      />
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Demande mise à jour avec succès.
        </Alert>
      </Snackbar>
    </>
  );
}
