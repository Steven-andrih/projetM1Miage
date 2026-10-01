import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AuthLayout from '../layouts/AuthLayout'
import AppLayout from '../layouts/AppLayout'
import ProtectedRoute from '../routes/ProtectedRoute'
import LoginPage from '../auth/LoginPage'
import RegisterPage from '../auth/RegisterPage'
import PlaceholderPage from '../components/PlaceholderPage'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../auth/useAuth'
import { ROLES } from '../auth/AuthContext'

import ClientProfileContainer from '../features/profil/ClientProfileContainer'
import PrestataireProfileContainer from '../features/profil/PrestataireProfileContainer'
import MesServicesContainer from '../features/services/MesServicesContainer'

import DemandeListContainer from '../features/demandes/DemandeListContainer'
import DemandeCreateContainer from '../features/demandes/DemandeCreateContainer'
import DemandeDetailContainer from '../features/demandes/DemandeDetailContainer'

import DemandesOuvertesContainer from '../features/demandes-ouvertes/DemandesOuvertesContainer'
import DemandeOuverteDetailContainer from '../features/demandes-ouvertes/DemandeOuverteDetailContainer'
import MesPropositionsContainer from '../features/propositions/MesPropositionsContainer'

import MissionListContainer from '../features/missions/MissionListContainer'
import MissionDetailContainer from '../features/missions/MissionDetailContainer'

import ClientDashboardContainer from '../features/dashboard/ClientDashboardContainer'
import PrestataireDashboardContainer from '../features/dashboard/PrestataireDashboardContainer'
import AdminDashboardContainer from '../features/dashboard/AdminDashboardContainer'

function HomeRedirect() {
  const { role, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!role) return <Navigate to="/login" replace />

  return <Navigate to={`/${role.toLowerCase()}/dashboard`} replace />
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
              <Route path="/client/dashboard" element={<ClientDashboardContainer />} />
              <Route path="/client/profil" element={<ClientProfileContainer />} />
              <Route path="/client/demandes" element={<DemandeListContainer />} />
              <Route path="/client/demandes/nouvelle" element={<DemandeCreateContainer />} />
              <Route path="/client/demandes/:id" element={<DemandeDetailContainer />} />
              <Route path="/client/missions" element={<MissionListContainer />} />
              <Route path="/client/missions/:id" element={<MissionDetailContainer />} />
            </Route>

            {/* --- Espace Prestataire --- */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.PRESTATAIRE]} />}>
              <Route path="/prestataire/dashboard" element={<PrestataireDashboardContainer />} />
              <Route path="/prestataire/profil" element={<PrestataireProfileContainer />} />
              <Route path="/prestataire/services" element={<MesServicesContainer />} />
              <Route path="/prestataire/demandes" element={<DemandesOuvertesContainer />} />
              <Route path="/prestataire/demandes/:id" element={<DemandeOuverteDetailContainer />} />
              <Route path="/prestataire/propositions" element={<MesPropositionsContainer />} />
              <Route path="/prestataire/missions" element={<MissionListContainer />} />
              <Route path="/prestataire/missions/:id" element={<MissionDetailContainer />} />
            </Route>

            {/* --- Espace Admin --- */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardContainer />} />
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

        <Route path="*" element={<PlaceholderPage title="Page introuvable (404)" />} />
      </Routes>
    </BrowserRouter>
  )
}
