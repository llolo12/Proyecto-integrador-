import { useEffect, useState, useCallback } from 'react';
import { Check, X, Search } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import type { ProveedorAdmin } from '../../types/proveedor';
const PAGE_SIZE = 10;
const estadoVariant = {
  pendiente: 'warning',
  aprobado: 'success',
  rechazado: 'error',
} as const;
export default function AdminProveedores() {
  const [proveedores, setProveedores] = useState<ProveedorAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [aprobarTarget, setAprobarTarget] = useState<ProveedorAdmin | null>(null);
  const [rechazarTarget, setRechazarTarget] = useState<ProveedorAdmin | null>(null);
  const [motivo, setMotivo] = useState('');
  const [motivoError, setMotivoError] = useState('');
  const [detalle, setDetalle] = useState<ProveedorAdmin | null>(null);
  const cargar = useCallback(() => {
    setLoading(true);
    api
      .get<ProveedorAdmin[]>('/admin/proveedores', {
        params: {
          skip: page * PAGE_SIZE,
          limit: PAGE_SIZE,
          estado: estado || undefined,
          busqueda: busqueda || undefined,
        },
      })
      .then((res) => {
        setProveedores(res.data);
        setTotal(Number(res.headers['x-total-count'] ?? res.data.length));
      })
      .catch(() => setProveedores([]))
      .finally(() => setLoading(false));
  }, [page, estado, busqueda]);
  useEffect(() => {
    cargar();
  }, [cargar]);
  const aprobar = async () => {
    if (!aprobarTarget) return;
    await api.put(`/admin/proveedores/${aprobarTarget.id}/estado`, { estado: 'aprobado' });
    setAprobarTarget(null);
    cargar();
  };
  const rechazar = async () => {
    if (!rechazarTarget) return;
    if (!motivo.trim()) {
      setMotivoError('El motivo es obligatorio para rechazar un proveedor');
      return;
    }
    await api.put(`/admin/proveedores/${rechazarTarget.id}/estado`, {
      estado: 'rechazado',
      motivo,
    });
    setRechazarTarget(null);
    setMotivo('');
    setMotivoError('');
    cargar();
  };
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pv-gray" />
            <Input
              placeholder="Buscar por nombre..."
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
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </Select>
        </div>
      </div>
      <Card className="overflow-x-auto" noPadding>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-pv-sand bg-pv-sand/30 text-xs uppercase text-pv-gray">
            <tr>
              <th className="px-4 py-3 font-semibold">Proveedor</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pv-sand/60">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-pv-gray">Cargando...</td>
              </tr>
            )}
            {!loading && proveedores.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-pv-gray">No hay proveedores para mostrar.</td>
              </tr>
            )}
            {!loading &&
              proveedores.map((p) => (
                <tr key={p.id} className="hover:bg-pv-sand/20">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDetalle(p)}
                      className="font-medium text-pv-green hover:underline cursor-pointer text-left"
                    >
                      {p.nombre}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-pv-gray">{p.categoria_nombre ?? '-'}</td>
                  <td className="px-4 py-3 text-pv-gray">
                    <div>{p.usuario_nombre ?? '-'}</div>
                    <div className="text-xs text-pv-gray/70">{p.usuario_correo}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={estadoVariant[p.estado_verificacion]}>{p.estado_verificacion}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={p.estado_verificacion === 'aprobado'}
                        onClick={() => setAprobarTarget(p)}
                        title="Aprobar proveedor"
                      >
                        <Check size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={p.estado_verificacion === 'rechazado'}
                        onClick={() => setRechazarTarget(p)}
                        title="Rechazar proveedor"
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </Card>
      <ConfirmDialog
        open={!!aprobarTarget}
        onClose={() => setAprobarTarget(null)}
        onConfirm={aprobar}
        title="Aprobar proveedor"
        description={`Confirmas que queres aprobar a "${aprobarTarget?.nombre}"? Va a aparecer publicamente en el directorio.`}
        confirmLabel="Aprobar"
      />
      <Modal
        open={!!rechazarTarget}
        onClose={() => {
          setRechazarTarget(null);
          setMotivo('');
          setMotivoError('');
        }}
        title="Rechazar proveedor"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setRechazarTarget(null);
                setMotivo('');
                setMotivoError('');
              }}
            >
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={rechazar}>
              Rechazar
            </Button>
          </>
        }
      >
        <p className="mb-3 text-sm text-pv-gray">
          Estas rechazando a <strong>{rechazarTarget?.nombre}</strong>. Este motivo sera visible para el proveedor.
        </p>
        <Textarea
          label="Motivo del rechazo"
          placeholder="Ej: La declaratoria del ICT no coincide con los documentos aportados..."
          value={motivo}
          onChange={(e) => {
            setMotivo(e.target.value);
            if (e.target.value.trim()) setMotivoError('');
          }}
          error={motivoError}
          rows={4}
        />
      </Modal>
      <Modal open={!!detalle} onClose={() => setDetalle(null)} title={detalle?.nombre ?? ''} size="md">
        {detalle && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant={estadoVariant[detalle.estado_verificacion]}>{detalle.estado_verificacion}</Badge>
              {detalle.declaratoria_ict && <Badge variant="info">Declaratoria ICT</Badge>}
            </div>
            {detalle.descripcion && <p className="text-pv-gray">{detalle.descripcion}</p>}
            <div className="grid grid-cols-2 gap-2 text-pv-gray">
              <div><span className="font-medium text-pv-green-dark">Categoria:</span> {detalle.categoria_nombre ?? '-'}</div>
              <div><span className="font-medium text-pv-green-dark">Usuario:</span> {detalle.usuario_nombre ?? '-'}</div>
              <div><span className="font-medium text-pv-green-dark">Correo:</span> {detalle.usuario_correo ?? '-'}</div>
              <div><span className="font-medium text-pv-green-dark">Creado:</span> {new Date(detalle.created_at).toLocaleDateString()}</div>
            </div>
            {detalle.motivo_rechazo && (
              <div className="rounded-lg bg-red-50 p-3 text-pv-danger">
                <span className="font-medium">Motivo de rechazo:</span> {detalle.motivo_rechazo}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
