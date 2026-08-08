import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-pv-green-dark text-pv-sand mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm">&copy; {new Date().getFullYear()} Pura Vida Conecta</p>
          <p className="text-xs opacity-70">{t('footer.hecho')}</p>
        </div>
      </div>
    </footer>
  );
}
