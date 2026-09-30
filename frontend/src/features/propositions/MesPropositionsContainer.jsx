import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as propositionsApi from '../../api/propositions.api';
import * as demandesApi from '../../api/demandes.api';
import { unwrapList } from '../../utils/api';
import { useAuth } from '../../auth/useAuth';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import MesPropositionsView from './MesPropositionsView';

export default function MesPropositionsContainer() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [propositions, setPropositions] = useState([]);
  const [demandesById, setDemandesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([propositionsApi.getPropositions(), demandesApi.getDemandes()])
      .then(([propositionsData, demandesData]) => {
        const allPropositions = unwrapList(propositionsData);
        const mine = user?.profileId
          ? allPropositions.filter((p) => p.prestataire === user.profileId)
          : allPropositions;
        setPropositions(mine);

        const map = {};
        unwrapList(demandesData).forEach((d) => {
          map[d.id] = d;
        });
        setDemandesById(map);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading)
    return <LoadingSpinner label="Chargement de vos propositions…" />;

  return (
    <>
      <PageHeader
        title="Mes propositions"
        subtitle="Suivez le statut de vos propositions envoyées"
        showBack
        backTo="/prestataire/dashboard"
      />
      {error && (
        <ErrorMessage message="Impossible de charger vos propositions." />
      )}
      <MesPropositionsView
        propositions={propositions}
        demandesById={demandesById}
        onOpenDemande={(demandeId) =>
          navigate(`/prestataire/demandes/${demandeId}`)
        }
      />
    </>
  );
}
