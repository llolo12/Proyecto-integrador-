import { useTranslation } from 'react-i18next';

export default function MiPerfil() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-pv-green-dark mb-4">{t('proveedor.panel')}</h1>
      <p className="text-pv-gray">{t('proveedor.descripcion')}</p>
    </div>
  );
}
