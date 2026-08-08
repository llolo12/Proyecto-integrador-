import { Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  adminOnly?: boolean;
}

export default function PrivateRoute({ adminOnly = false }: PrivateRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pv-green border-t-transparent" />
        <span className="ml-3 text-pv-gray">{t('common.cargando')}</span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
