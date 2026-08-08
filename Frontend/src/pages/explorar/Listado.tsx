import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import type { Proveedor } from '../../types/proveedor';

export default function ListadoProveedores() {
  const { t } = useTranslation();
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [searchParams] = useSearchParams();
  const categoriaFiltro = searchParams.get('categoria');

  useEffect(() => {
    api.get<Proveedor[]>('/proveedores')
      .then((res) => setProveedores(res.data))
      .catch(() => {});
  }, []);

  const filtrados = proveedores.filter((p) => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = categoriaFiltro ? p.categoria?.nombre === categoriaFiltro : true;
    return matchBusqueda && matchCategoria;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-pv-green-dark mb-6">{t('explorar.titulo')}</h1>
      <Input
        placeholder={t('explorar.buscar')}
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((p) => (
          <Link key={p.id} to={`/explorar/${p.id}`}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-pv-green">{p.nombre}</h3>
              {p.descripcion && <p className="mt-2 text-sm text-pv-gray line-clamp-2">{p.descripcion}</p>}
            </Card>
          </Link>
        ))}
      </div>
      {filtrados.length === 0 && (
        <p className="mt-8 text-center text-pv-gray">{t('explorar.sin_resultados')}</p>
      )}
    </div>
  );
}
