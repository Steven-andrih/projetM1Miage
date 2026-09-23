import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import ProtectedRoute from '../routes/ProtectedRoute';
import LoginPage from '../auth/LoginPage';
import RegisterPage from '../auth/RegisterPage';
import PlaceholderPage from '../components/PlaceholderPage';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../auth/useAuth';
import { ROLES } from '../auth/AuthContext';

function HomeRedirect() {
  const { role, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!role) return <Navigate to="/login" replace />;

  return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Routes publiques --- */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* --- Routes protégées (authentification requise) --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route
              path="/carte-prestataires"
              element={<PlaceholderPage title="Carte des prestataires" />}
            />

            {/* --- Espace Client --- */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.CLIENT]} />}>
              <Route
                path="/client/dashboard"
                element={<PlaceholderPage title="Tableau de bord client" />}
              />
              <Route
                path="/client/profil"
                element={<PlaceholderPage title="Mon profil" />}
              />
              <Route
                path="/client/demandes"
                element={<PlaceholderPage title="Mes demandes" />}
              />
              <Route
                path="/client/demandes/nouvelle"
                element={<PlaceholderPage title="Nouvelle demande" />}
              />
              <Route
                path="/client/demandes/:id"
                element={<PlaceholderPage title="Détail de la demande" />}
              />
              <Route
                path="/client/missions"
                element={<PlaceholderPage title="Mes missions" />}
              />
              <Route
                path="/client/missions/:id"
                element={<PlaceholderPage title="Détail de la mission" />}
              />
            </Route>

            {/* --- Espace Prestataire --- */}
            <Route
              element={<ProtectedRoute allowedRoles={[ROLES.PRESTATAIRE]} />}
            >
              <Route
                path="/prestataire/dashboard"
                element={
                  <PlaceholderPage title="Tableau de bord prestataire" />
                }
              />
              <Route
                path="/prestataire/profil"
                element={<PlaceholderPage title="Mon profil" />}
              />
              <Route
                path="/prestataire/services"
                element={<PlaceholderPage title="Mes services" />}
              />
              <Route
                path="/prestataire/demandes"
                element={<PlaceholderPage title="Demandes ouvertes" />}
              />
              <Route
                path="/prestataire/demandes/:id"
                element={<PlaceholderPage title="Détail de la demande" />}
              />
              <Route
                path="/prestataire/propositions"
                element={<PlaceholderPage title="Mes propositions" />}
              />
              <Route
                path="/prestataire/missions"
                element={<PlaceholderPage title="Mes missions" />}
              />
              <Route
                path="/prestataire/missions/:id"
                element={<PlaceholderPage title="Détail de la mission" />}
              />
            </Route>

            {/* --- Espace Admin --- */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route
                path="/admin/dashboard"
                element={<PlaceholderPage title="Tableau de bord admin" />}
              />
              <Route
                path="/admin/categories"
                element={<PlaceholderPage title="Gestion des catégories" />}
              />
              <Route
                path="/admin/services"
                element={<PlaceholderPage title="Gestion des services" />}
              />
            </Route>
          </Route>
        </Route>

        <Route
          path="*"
          element={<PlaceholderPage title="Page introuvable (404)" />}
        />
      </Routes>
    </BrowserRouter>
  );
}
