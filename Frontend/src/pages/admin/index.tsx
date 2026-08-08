import { useTranslation } from 'react-i18next';

export default function DashboardAdmin() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-pv-green-dark mb-4">{t('admin.panel')}</h1>
      <p className="text-pv-gray">{t('admin.descripcion')}</p>
    </div>
  );
}
