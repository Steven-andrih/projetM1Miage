import { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import * as usersApi from '../../api/users.api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ClientProfileView from './ClientProfileView';

const EMPTY_FORM = { adresse: '', ville: '', latitude: '', longitude: '' };

export default function ClientProfileContainer() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    usersApi
      .getClientProfile()
      .then((data) => {
        setForm({
          adresse: data.adresse ?? '',
          ville: data.ville ?? '',
          latitude: data.latitude ?? '',
          longitude: data.longitude ?? '',
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      };
      await usersApi.updateClientProfile(payload);
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
        subtitle="Gérez vos informations personnelles"
      />
      {error && (
        <ErrorMessage message="Impossible de charger ou enregistrer votre profil." />
      )}
      <ClientProfileView
        form={form}
        onChange={handleChange}
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
