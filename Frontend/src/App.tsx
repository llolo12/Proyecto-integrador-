import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/protected/PrivateRoute';
import Landing from './pages/landing/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ListadoProveedores from './pages/explorar/Listado';
import DetalleProveedor from './pages/explorar/Detalle';
import PerfilProveedor from './pages/proveedor/index';
import AdminDashboard from './pages/admin/index';

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-pv-gray text-lg">404 — {t('common.404')}</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/explorar" element={<ListadoProveedores />} />
            <Route path="/explorar/:id" element={<DetalleProveedor />} />

            <Route element={<PrivateRoute />}>
              <Route path="/proveedor/*" element={<PerfilProveedor />} />
            </Route>

            <Route element={<PrivateRoute adminOnly />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
