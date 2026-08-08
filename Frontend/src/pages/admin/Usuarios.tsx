import { useEffect, useState, useCallback } from 'react';
import { Search, Ban, RotateCcw } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { UsuarioAdmin } from '../../types/usuario';
const PAGE_SIZE = 10;
const estadoVariant = {
  activo: 'success',
  suspendido: 'error',
  pendiente: 'warning',
} as const;
export default function AdminUsuarios() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [target, setTarget] = useState<{ usuario: UsuarioAdmin; nuevoEstado: 'activo' | 'suspendido' } | null>(null);
  const cargar = useCallback(() => {
    setLoading(true);
    api
      .get<UsuarioAdmin[]>('/admin/usuarios', {
        params: {
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          estado: estado || undefined,
          busqueda: busqueda || undefined,
        },
      })
      .then((res) => {
        setUsuarios(res.data);
        setTotal(Number(res.headers['x-total-count'] ?? res.data.length));
      })
      .catch(() => setUsuarios([]))
      .finally(() => setLoading(false));
  }, [page, estado, busqueda]);
  useEffect(() => {
    cargar();
  }, [cargar]);
  const confirmarCambio = async () => {
    if (!target) return;
    await api.put(`/admin/usuarios/${target.usuario.id}/estado`, { estado: target.nuevoEstado });
    setTarget(null);
    cargar();
  };
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pv-gray" />
            <Input
              placeholder="Buscar por nombre o correo..."
              value={busqueda}
              onChange={(e) => {
                setPage(0);
                setBusqueda(e.target.value);
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={estado}
            onChange={(e) => {
              setPage(0);
              setEstado(e.target.value);
            }}
            className="sm:w-48"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="pendiente">Pendiente</option>
          </Select>
        </div>
      </div>
      <Card className="overflow-x-auto" noPadding>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-pv-sand bg-pv-sand/30 text-xs uppercase text-pv-gray">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">Rol</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Registrado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pv-sand/60">
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-pv-gray">Cargando...</td>
              </tr>
            )}
            {!loading && usuarios.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-pv-gray">No hay usuarios para mostrar.</td>
              </tr>
            )}
            {!loading &&
              usuarios.map((u) => {
                const esUnoMismo = u.id === user?.id;
                return (
                  <tr key={u.id} className="hover:bg-pv-sand/20">
                    <td className="px-4 py-3 font-medium text-pv-green-dark">
                      {u.nombre} {esUnoMismo && <span className="text-xs text-pv-gray">(vos)</span>}
                    </td>
                    <td className="px-4 py-3 text-pv-gray">{u.correo}</td>
                    <td className="px-4 py-3 text-pv-gray capitalize">{u.rol_nombre ?? '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={estadoVariant[u.estado]}>{u.estado}</Badge>
                    </td>
                    <td className="px-4 py-3 text-pv-gray">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {u.estado === 'suspendido' ? (
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={esUnoMismo}
                            onClick={() => setTarget({ usuario: u, nuevoEstado: 'activo' })}
                          >
                            <RotateCcw size={14} className="mr-1" /> Reactivar
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={esUnoMismo}
                            onClick={() => setTarget({ usuario: u, nuevoEstado: 'suspendido' })}
                          >
                            <Ban size={14} className="mr-1" /> Suspender
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </Card>
      <ConfirmDialog
        open={!!target}
        onClose={() => setTarget(null)}
        onConfirm={confirmarCambio}
        variant={target?.nuevoEstado === 'suspendido' ? 'danger' : 'primary'}
        title={target?.nuevoEstado === 'suspendido' ? 'Suspender usuario' : 'Reactivar usuario'}
        description={
          target?.nuevoEstado === 'suspendido'
            ? `Confirmas que queres suspender a "${target?.usuario.nombre}"? No va a poder iniciar sesion hasta que lo reactives.`
            : `Confirmas que queres reactivar a "${target?.usuario.nombre}"? Va a poder iniciar sesion nuevamente.`
        }
        confirmLabel={target?.nuevoEstado === 'suspendido' ? 'Suspender' : 'Reactivar'}
      />
    </div>
  );
}
