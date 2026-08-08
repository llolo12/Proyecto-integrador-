import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const toggleLang = () => {
    const next = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(next);
  };

  return (
    <nav className="sticky top-0 z-50 bg-pv-white border-b border-pv-sand">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-pv-green">Pura Vida Conecta</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/explorar" className="text-sm text-pv-gray hover:text-pv-green transition-colors">
            {t('nav.explorar')}
          </Link>

          <button onClick={toggleLang} className="text-xs text-pv-gray hover:text-pv-green border border-pv-sand rounded px-2 py-1 transition-colors cursor-pointer">
            {i18n.language === 'es' ? 'EN' : 'ES'}
          </button>

          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">{t('nav.iniciar_sesion')}</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">{t('nav.registrarse')}</Button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-pv-gray hidden sm:inline">{user?.nombre}</span>
              {isAdmin && (
                <Link to="/admin" className="text-sm text-pv-blue hover:text-pv-blue-dark transition-colors">
                  {t('nav.admin')}
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={logout}>
                {t('nav.cerrar_sesion')}
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
