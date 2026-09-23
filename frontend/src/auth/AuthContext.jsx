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

async function resolveRole(claimRole) {
  if (claimRole) return claimRole;

  try {
    await usersApi.getClientProfile();
    return ROLES.CLIENT;
  } catch {
    // pas un client
  }

  try {
    await usersApi.getPrestataireProfile();
    return ROLES.PRESTATAIRE;
  } catch {
    // pas un prestataire
  }

  return ROLES.ADMIN;
}

function buildUser(payload, role, fallbackUsername) {
  return {
    username: payload?.username ?? fallbackUsername,
    userId: payload?.user_id ?? null, // claim par défaut de djangorestframework-simplejwt
    role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
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
    resolveRole(payload?.role)
      .then((role) => {
        const rebuiltUser = buildUser(payload, role);
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
    const role = await resolveRole(payload?.role);
    const nextUser = buildUser(payload, role, username);

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
