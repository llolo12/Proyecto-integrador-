import { useEffect, useState, useCallback } from 'react';
import { ScrollText } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import type { LogAccion, LogAccionPage } from '../../types/auditoria';
const PAGE_SIZE = 15;
const entidadLabel: Record<string, string> = {
  proveedor: 'Proveedor',
  usuario: 'Usuario',
  destino: 'Destino',
};
const accionVariant = (accion: string): 'success' | 'warning' | 'error' | 'info' => {
  if (accion.startsWith('aprobar') || accion.startsWith('reactivar') || accion.startsWith('crear')) return 'success';
  if (accion.startsWith('rechazar') || accion.startsWith('suspender') || accion.startsWith('eliminar')) return 'error';
  if (accion.startsWith('actualizar')) return 'info';
  return 'warning';
};
export default function AdminAuditoria() {
  const [logs, setLogs] = useState<LogAccion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [entidad, setEntidad] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const cargar = useCallback(() => {
    setLoading(true);
    api
      .get<LogAccionPage>('/admin/logs', {
        params: {
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          entidad: entidad || undefined,
          fecha_desde: fechaDesde || undefined,
          fecha_hasta: fechaHasta || undefined,
        },
      })
      .then((res) => {
        setLogs(res.data.items);
        setTotal(res.data.total);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [page, entidad, fechaDesde, fechaHasta]);
  useEffect(() => {
    cargar();
  }, [cargar]);
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        <Select
          label="Entidad"
          value={entidad}
          onChange={(e) => {
            setPage(0);
            setEntidad(e.target.value);
          }}
          className="sm:w-44"
        >
          <option value="">Todas</option>
          <option value="proveedor">Proveedor</option>
          <option value="usuario">Usuario</option>
          <option value="destino">Destino</option>
        </Select>
        <Input
          label="Desde"
          type="date"
          value={fechaDesde}
          onChange={(e) => {
            setPage(0);
            setFechaDesde(e.target.value);
          }}
          className="sm:w-44"
        />
        <Input
          label="Hasta"
          type="date"
          value={fechaHasta}
          onChange={(e) => {
            setPage(0);
            setFechaHasta(e.target.value);
          }}
          className="sm:w-44"
        />
        {(entidad || fechaDesde || fechaHasta) && (
          <button
            onClick={() => {
              setEntidad('');
              setFechaDesde('');
              setFechaHasta('');
              setPage(0);
            }}
            className="h-fit text-sm text-pv-blue hover:underline cursor-pointer pb-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>
      <Card className="overflow-x-auto" noPadding>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-pv-sand bg-pv-sand/30 text-xs uppercase text-pv-gray">
            <tr>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold">Administrador</th>
              <th className="px-4 py-3 font-semibold">Accion</th>
              <th className="px-4 py-3 font-semibold">Entidad</th>
              <th className="px-4 py-3 font-semibold">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pv-sand/60">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-pv-gray">Cargando...</td>
              </tr>
            )}
            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-pv-gray">
                  <div className="flex flex-col items-center gap-2">
                    <ScrollText size={24} className="text-pv-sand" />
                    No hay registros de auditoria para estos filtros.
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-pv-sand/20">
                  <td className="px-4 py-3 whitespace-nowrap text-pv-gray">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-pv-gray">
                    {log.usuario_nombre ? (
                      <>
                        <div>{log.usuario_nombre}</div>
                        <div className="text-xs text-pv-gray/70">{log.usuario_correo}</div>
                      </>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={accionVariant(log.accion)}>{log.accion.replaceAll('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-3 text-pv-gray">{entidadLabel[log.entidad] ?? log.entidad}</td>
                  <td className="px-4 py-3 text-pv-gray">{log.ip ?? '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
