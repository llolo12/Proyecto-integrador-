import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, Users, MapPinned, ScrollText } from 'lucide-react';
import AdminProveedores from './Proveedores';
import AdminUsuarios from './Usuarios';
import AdminDestinos from './Destinos';
import AdminAuditoria from './Auditoria';
const tabs = [
  { to: '/admin/proveedores', label: 'Proveedores', icon: Building2 },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/destinos', label: 'Destinos', icon: MapPinned },
  { to: '/admin/auditoria', label: 'Auditoria', icon: ScrollText },
];
export default function DashboardAdmin() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pv-green-dark">{t('admin.panel')}</h1>
        <p className="text-pv-gray">{t('admin.descripcion')}</p>
      </div>
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-pv-sand">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-pv-green text-pv-green'
                  : 'border-transparent text-pv-gray hover:text-pv-green-dark hover:border-pv-sand'
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </div>
      <Routes>
        <Route index element={<Navigate to="proveedores" replace />} />
        <Route path="proveedores" element={<AdminProveedores />} />
        <Route path="usuarios" element={<AdminUsuarios />} />
        <Route path="destinos" element={<AdminDestinos />} />
        <Route path="auditoria" element={<AdminAuditoria />} />
      </Routes>
    </div>
  );
}
