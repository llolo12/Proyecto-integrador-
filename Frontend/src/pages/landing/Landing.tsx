import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import type { Proveedor } from '../../types/proveedor';

export default function Landing() {
  const { t } = useTranslation();
  const [destacados, setDestacados] = useState<Proveedor[]>([]);

  const categorias = [
    { key: 'hoteles', icon: '🏨' },
    { key: 'restaurantes', icon: '🍽️' },
    { key: 'guias', icon: '🗺️' },
    { key: 'actividades', icon: '🏄' },
  ];

  useEffect(() => {
    api.get<Proveedor[]>('/proveedores?limit=4')
      .then((res) => setDestacados(res.data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative bg-gradient-to-br from-pv-green-dark via-pv-green to-pv-green-light px-4 py-24 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold md:text-6xl">
            {t('landing.hero_title')}
          </h1>
          <p className="mt-4 text-lg text-pv-sand/90">
            {t('landing.hero_subtitle')}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/explorar">
              <Button variant="secondary" size="lg">{t('landing.explorar')}</Button>
            </Link>
            <Link to="/register/provider">
              <Button variant="ghost" size="lg" className="text-white border border-white/30 hover:bg-white/10">
                {t('landing.soy_proveedor')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-pv-green-dark mb-8 text-center">
          {t('landing.categorias')}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categorias.map((cat) => (
            <Link key={cat.key} to={`/explorar?categoria=${cat.key}`}>
              <Card className="flex flex-col items-center gap-3 p-6 text-center hover:shadow-lg transition-shadow">
                <span className="text-4xl">{cat.icon}</span>
                <span className="font-medium text-pv-gray">{t(`categorias.${cat.key}`)}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {destacados.length > 0 && (
        <section className="bg-pv-sand/30 px-4 py-16">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-pv-green-dark mb-8 text-center">
              {t('landing.destacados')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {destacados.map((p) => (
                <Link key={p.id} to={`/explorar/${p.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <h3 className="font-semibold text-pv-green">{p.nombre}</h3>
                    {p.descripcion && (
                      <p className="mt-2 text-sm text-pv-gray line-clamp-3">{p.descripcion}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-pv-green-dark mb-4">
          {t('landing.cta_title')}
        </h2>
        <p className="text-pv-gray mb-6 max-w-lg mx-auto">
          {t('landing.cta_subtitle')}
        </p>
        <Link to="/register/provider">
          <Button size="lg">{t('landing.cta_button')}</Button>
        </Link>
      </section>
    </div>
  );
}
