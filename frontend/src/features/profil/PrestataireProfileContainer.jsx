import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import * as usersApi from '../../api/users.api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import PrestataireProfileView from './PrestataireProfileView';

const EMPTY_FORM = {
  description: '',
  adresse: '',
  latitude: '',
  longitude: '',
  annee_experience: '',
  disponible: false,
};

export default function PrestataireProfileContainer() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [statutValidation, setStatutValidation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    usersApi
      .getPrestataireProfile()
      .then((data) => {
        setForm({
          description: data.description ?? '',
          adresse: data.adresse ?? '',
          latitude: data.latitude ?? '',
          longitude: data.longitude ?? '',
          annee_experience: data.annee_experience ?? '',
          disponible: Boolean(data.disponible),
        });
        setStatutValidation(data.statut_validation ?? '');
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (event) => {
    const { name, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleLocate = (latitude, longitude) => {
    setForm((prev) => ({ ...prev, latitude, longitude }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const payload = {
        ...form,
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        annee_experience:
          form.annee_experience === '' ? null : Number(form.annee_experience),
      };
      // statut_validation est en lecture seule : jamais envoyé dans le payload
      await usersApi.updatePrestataireProfile(payload);
      setSuccessOpen(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Chargement du profil…" />;

  return (
    <>
      <PageHeader
        title="Mon profil"
        subtitle="Gérez vos informations professionnelles"
      />
      {error && (
        <ErrorMessage message="Impossible de charger ou enregistrer votre profil." />
      )}
      <PrestataireProfileView
        form={form}
        statutValidation={statutValidation}
        onChange={handleChange}
        onToggle={handleToggle}
        onLocate={handleLocate}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Profil mis à jour avec succès.
        </Alert>
      </Snackbar>
    </>
  );
}
