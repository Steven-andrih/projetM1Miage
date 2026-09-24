import { createContext, useCallback, useEffect, useState } from 'react';
import * as authApi from '../api/auth.api';
import * as usersApi from '../api/users.api';
import { decodeJwt } from '../utils/jwt';

export const ROLES = {
  CLIENT: 'CLIENT',
  PRESTATAIRE: 'PRESTATAIRE',
  ADMIN: 'ADMIN',
};

export const AuthContext = createContext(null);

/**
 * Résout à la fois le rôle ET l'id du profil métier (Client.id ou
 * Prestataire.id), qui est DIFFÉRENT de l'id Utilisateur (claim JWT
 * "user_id"). C'est ce profileId qui doit être comparé aux champs
 * "client" / "prestataire" renvoyés par les autres endpoints
 * (demandes, propositions, missions, avis, prestataire-services...).
 */
async function resolveRoleAndProfile(claimRole) {
  try {
    const clientProfile = await usersApi.getClientProfile();
    return { role: ROLES.CLIENT, profileId: clientProfile.id };
  } catch {
    // pas un client
  }

  try {
    const prestataireProfile = await usersApi.getPrestataireProfile();
    return { role: ROLES.PRESTATAIRE, profileId: prestataireProfile.id };
  } catch {
    // pas un prestataire
  }

  return { role: claimRole || ROLES.ADMIN, profileId: null };
}

function buildUser({ username, userId, role, profileId }) {
  return { username, userId, profileId, role };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    // Ancien format en cache (avant l'ajout de profileId) : on force
    // une re-résolution complète plutôt que d'utiliser des données incomplètes.
    if (parsed.profileId === undefined) return null;
    return parsed;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('access');

    if (!access) {
      setLoading(false);
      return;
    }

    if (user) {
      setLoading(false);
      return;
    }

    const payload = decodeJwt(access);
    const userId = payload?.user_id != null ? Number(payload.user_id) : null;

    resolveRoleAndProfile(payload?.role)
      .then(({ role, profileId }) => {
        const rebuiltUser = buildUser({
          username: payload?.username,
          userId,
          role,
          profileId,
        });
        localStorage.setItem('user', JSON.stringify(rebuiltUser));
        setUser(rebuiltUser);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (username, password) => {
    const { access, refresh } = await authApi.login(username, password);
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);

    const payload = decodeJwt(access);
    const userId = payload?.user_id != null ? Number(payload.user_id) : null;
    const { role, profileId } = await resolveRoleAndProfile(payload?.role);
    const nextUser = buildUser({
      username: payload?.username ?? username,
      userId,
      role,
      profileId,
    });

    localStorage.setItem('user', JSON.stringify(nextUser));
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(
    async (payload) => {
      await authApi.register(payload);
      return login(payload.username, payload.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
