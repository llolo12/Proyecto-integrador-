import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import type { Proveedor } from '../../types/proveedor';

export default function DetalleProveedor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Proveedor>(`/proveedores/${id}`)
      .then((res) => setProveedor(res.data))
      .catch(() => {});
  }, [id]);

  if (!proveedor) {
    return <div className="text-center py-20 text-pv-gray">{t('common.cargando')}</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-pv-green-dark">{proveedor.nombre}</h1>
        <Badge
          variant={proveedor.estado_verificacion === 'aprobado' ? 'success' : proveedor.estado_verificacion === 'rechazado' ? 'error' : 'warning'}
        >
          {proveedor.estado_verificacion}
        </Badge>
      </div>

      {proveedor.descripcion && (
        <Card className="mb-6">
          <p className="text-pv-gray">{proveedor.descripcion}</p>
        </Card>
      )}

      {proveedor.horarios && proveedor.horarios.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-pv-green-dark mb-3">{t('explorar.horarios')}</h2>
          <table className="w-full text-sm">
            <tbody>
              {proveedor.horarios.map((h) => (
                <tr key={h.id} className="border-b border-pv-sand/50">
                  <td className="py-2 capitalize">{h.dia_semana}</td>
                  <td className="py-2">
                    {h.abierto ? `${h.hora_apertura} - ${h.hora_cierre}` : t('explorar.cerrado')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {proveedor.contactos && proveedor.contactos.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-semibold text-pv-green-dark mb-3">{t('explorar.contacto')}</h2>
          <div className="flex flex-wrap gap-3">
            {proveedor.contactos.map((c) => (
              <span key={c.id} className="rounded-full bg-pv-sand/50 px-3 py-1 text-sm text-pv-gray">
                {c.tipo}: {c.valor}
              </span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
