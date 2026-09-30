import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as demandesApi from '../../api/demandes.api';
import { unwrapList } from '../../utils/api';
import { useCatalogue } from '../catalogue/useCatalogue';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import DemandeFilters from '../demandes/DemandeFilters';
import DemandeListView from '../demandes/DemandeListView';

const INITIAL_FILTERS = {
  search: '',
  statut: '',
  urgence: '',
  categorieId: '',
  serviceId: '',
  sort: 'date_desc',
};

export default function DemandesOuvertesContainer() {
  const navigate = useNavigate();
  const { categories, services } = useCatalogue();

  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  useEffect(() => {
    demandesApi
      .getDemandes()
      .then((data) => {
        const all = unwrapList(data);
        // Seules les demandes au statut "PUBLIEE" sont ouvertes aux propositions.
        setDemandes(all.filter((d) => d.statut === 'PUBLIEE'));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'categorieId' ? { serviceId: '' } : {}),
    }));
  };

  const handleReset = () => setFilters(INITIAL_FILTERS);

  const filteredDemandes = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    let result = demandes.filter((d) => {
      if (
        search &&
        !`${d.titre} ${d.description}`.toLowerCase().includes(search)
      )
        return false;
      if (filters.urgence && d.urgence !== filters.urgence) return false;
      if (filters.serviceId && d.service !== filters.serviceId) return false;
      if (filters.categorieId && !filters.serviceId) {
        const service = services.find((s) => s.id === d.service);
        if (!service || service.categorie !== filters.categorieId) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (filters.sort) {
        case 'date_asc':
          return new Date(a.date_creation) - new Date(b.date_creation);
        case 'budget_desc':
          return (
            Number(b.budget_max ?? b.budget_min ?? 0) -
            Number(a.budget_max ?? a.budget_min ?? 0)
          );
        case 'budget_asc':
          return (
            Number(a.budget_min ?? a.budget_max ?? 0) -
            Number(b.budget_min ?? b.budget_max ?? 0)
          );
        case 'date_desc':
        default:
          return new Date(b.date_creation) - new Date(a.date_creation);
      }
    });

    return result;
  }, [demandes, filters, services]);

  if (loading)
    return <LoadingSpinner label="Chargement des demandes ouvertes…" />;

  return (
    <>
      <PageHeader
        title="Demandes ouvertes"
        subtitle="Parcourez les demandes de service publiées par les clients"
        showBack
        backTo="/prestataire/dashboard"
      />
      {error && (
        <ErrorMessage message="Impossible de charger les demandes ouvertes." />
      )}
      <DemandeFilters
        filters={filters}
        categories={categories}
        services={services}
        onChange={handleFilterChange}
        onReset={handleReset}
      />
      <DemandeListView
        demandes={filteredDemandes}
        onOpen={(id) => navigate(`/prestataire/demandes/${id}`)}
      />
    </>
  );
}
