import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Snackbar } from '@mui/material';
import * as demandesApi from '../../api/demandes.api';
import * as propositionsApi from '../../api/propositions.api';
import { unwrapList } from '../../utils/api';
import { useAuth } from '../../auth/useAuth';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DemandeReadOnlyInfo from './DemandeReadOnlyInfo';
import PropositionForm from '../propositions/PropositionForm';
import PropositionSummary from '../propositions/PropositionSummary';

export default function DemandeOuverteDetailContainer() {
  const { id } = useParams();
  const { user } = useAuth();

  const [demande, setDemande] = useState(null);
  const [myProposition, setMyProposition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([demandesApi.getDemande(id), propositionsApi.getPropositions()])
      .then(([demandeData, propositionsData]) => {
        setDemande(demandeData);
        const all = unwrapList(propositionsData);
        const mine = all.find(
          (p) => p.demande === Number(id) && p.prestataire === user?.profileId,
        );
        setMyProposition(mine || null);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (form) => {
    setSubmitting(true);
    setError(false);
    try {
      await propositionsApi.createProposition({
        demande: Number(id),
        message: form.message,
        tarif_propose:
          form.tarif_propose === '' ? null : Number(form.tarif_propose),
      });
      setSuccessOpen(true);
      load();
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Chargement de la demande…" />;
  if (!demande)
    return <ErrorMessage message="Cette demande est introuvable." />;

  return (
    <>
      <PageHeader
        title={demande.titre}
        subtitle={`Demande #${demande.id}`}
        showBack
        backTo="/prestataire/demandes"
      />
      {error && <ErrorMessage message="Une erreur est survenue." />}

      <DemandeReadOnlyInfo demande={demande} />

      {myProposition ? (
        <PropositionSummary proposition={myProposition} />
      ) : (
        <PropositionForm onSubmit={handleSubmit} submitting={submitting} />
      )}

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert severity="success" onClose={() => setSuccessOpen(false)}>
          Proposition envoyée avec succès.
        </Alert>
      </Snackbar>
    </>
  );
}
