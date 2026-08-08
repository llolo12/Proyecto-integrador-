import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';
import type { Usuario } from '../types/usuario';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRole: string | null;
  login: (correo: string, password: string) => Promise<void>;
  register: (nombre: string, correo: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeTokenPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  const payload = token ? decodeTokenPayload(token) : {};
  const userRole = (payload?.rol as string) || null;
  const isAdmin = userRole === 'administrador';

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.get<Usuario>('/usuarios/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        sessionStorage.removeItem('access_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const fetchUser = async (accessToken: string) => {
    sessionStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    const me = await api.get<Usuario>('/usuarios/me');
    setUser(me.data);
  };

  const login = async (correo: string, password: string) => {
    const res = await api.post('/auth/login', { correo, password });
    await fetchUser(res.data.access_token);
  };

  const register = async (nombre: string, correo: string, password: string) => {
    const res = await api.post('/auth/register', { nombre, correo, password });
    await fetchUser(res.data.access_token);
  };

  const logout = () => {
    sessionStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, isAdmin, userRole, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
