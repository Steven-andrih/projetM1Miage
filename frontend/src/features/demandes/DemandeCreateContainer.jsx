import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Snackbar } from '@mui/material';
import * as demandesApi from '../../api/demandes.api';
import { useCatalogue } from '../catalogue/useCatalogue';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DemandeFormFields from './DemandeFormFields';

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
};

export default function DemandeCreateContainer() {
  const navigate = useNavigate();
  const {
    categories,
    services,
    loading: catalogueLoading,
    error: catalogueError,
  } = useCatalogue();

  const [form, setForm] = useState(EMPTY_FORM);
  const [categorieFilter, setCategorieFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

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
      const created = await demandesApi.createDemande(payload);
      setSuccessOpen(true);
      navigate(`/client/demandes/${created.id}`, { replace: true });
    } catch {
      setError(true);
      setSubmitting(false);
    }
  };

  if (catalogueLoading)
    return <LoadingSpinner label="Chargement du catalogue…" />;

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
      <form onSubmit={handleSubmit} noValidate>
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
          disabled={submitting}
        >
          {submitting ? 'Publication…' : 'Publier la demande'}
        </Button>
      </form>
      <Snackbar open={successOpen} autoHideDuration={3000}>
        <Alert severity="success">Demande créée avec succès.</Alert>
      </Snackbar>
    </>
  );
}
