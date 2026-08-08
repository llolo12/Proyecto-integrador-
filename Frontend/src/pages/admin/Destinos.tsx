import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Search, MapPin } from 'lucide-react';
import api from '../../api/axios';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import MapPicker from '../../components/admin/MapPicker';
import type { Destino } from '../../types/destino';
const PAGE_SIZE = 10;
interface FormState {
  nombre: string;
  descripcion: string;
  lat: number | null;
  lng: number | null;
}
const EMPTY_FORM: FormState = { nombre: '', descripcion: '', lat: null, lng: null };
export default function AdminDestinos() {
  const [destinos, setDestinos] = useState<Destino[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState<Destino | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [eliminarTarget, setEliminarTarget] = useState<Destino | null>(null);
  const cargar = useCallback(() => {
    setLoading(true);
    api
      .get<Destino[]>('/admin/destinos', {
        params: { skip: page * PAGE_SIZE, limit: PAGE_SIZE, busqueda: busqueda || undefined },
      })
      .then((res) => {
        setDestinos(res.data);
        setTotal(Number(res.headers['x-total-count'] ?? res.data.length));
      })
      .catch(() => setDestinos([]))
      .finally(() => setLoading(false));
  }, [page, busqueda]);
  useEffect(() => {
    cargar();
  }, [cargar]);
  const abrirNuevo = () => {
    setEditando(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  };
  const abrirEditar = (d: Destino) => {
    setEditando(d);
    setForm({ nombre: d.nombre, descripcion: d.descripcion ?? '', lat: d.lat ?? null, lng: d.lng ?? null });
    setFormError('');
    setFormOpen(true);
  };
  const guardar = async () => {
    if (!form.nombre.trim()) {
      setFormError('El nombre es obligatorio');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        lat: form.lat,
        lng: form.lng,
      };
      if (editando) {
        await api.put(`/admin/destinos/${editando.id}`, payload);
      } else {
        await api.post('/admin/destinos', payload);
      }
      setFormOpen(false);
      cargar();
    } catch {
      setFormError('No se pudo guardar el destino. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };
  const eliminar = async () => {
    if (!eliminarTarget) return;
    await api.delete(`/admin/destinos/${eliminarTarget.id}`);
    setEliminarTarget(null);
    cargar();
  };
  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-pv-gray" />
          <Input
            placeholder="Buscar destino..."
            value={busqueda}
            onChange={(e) => {
              setPage(0);
              setBusqueda(e.target.value);
            }}
            className="pl-9"
          />
        </div>
        <Button onClick={abrirNuevo}>
          <Plus size={16} className="mr-1 inline" /> Nuevo destino
        </Button>
      </div>
      <Card className="overflow-x-auto" noPadding>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-pv-sand bg-pv-sand/30 text-xs uppercase text-pv-gray">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Descripcion</th>
              <th className="px-4 py-3 font-semibold">Ubicacion</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pv-sand/60">
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-pv-gray">Cargando...</td>
              </tr>
            )}
            {!loading && destinos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-pv-gray">No hay destinos registrados todavia.</td>
              </tr>
            )}
            {!loading &&
              destinos.map((d) => (
                <tr key={d.id} className="hover:bg-pv-sand/20">
                  <td className="px-4 py-3 font-medium text-pv-green-dark">{d.nombre}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-pv-gray">{d.descripcion ?? '-'}</td>
                  <td className="px-4 py-3 text-pv-gray">
                    {d.lat != null && d.lng != null ? (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <MapPin size={12} /> {d.lat.toFixed(4)}, {d.lng.toFixed(4)}
                      </span>
                    ) : (
                      'Sin ubicar'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => abrirEditar(d)} title="Editar">
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setEliminarTarget(d)} title="Eliminar">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
      </Card>
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editando ? 'Editar destino' : 'Nuevo destino'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" onClick={guardar} disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nombre del destino"
            placeholder="Ej: Playa Blanca, Isla San Lucas..."
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            error={formError && !form.nombre.trim() ? formError : undefined}
          />
          <Textarea
            label="Descripcion (opcional)"
            placeholder="Breve descripcion del destino..."
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
          />
          <div>
            <label className="mb-1 block text-sm font-medium text-pv-gray">Ubicacion</label>
            <MapPicker
              lat={form.lat}
              lng={form.lng}
              onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))}
              otherPoints={destinos.filter((d) => d.id !== editando?.id)}
            />
          </div>
          {formError && form.nombre.trim() && <p className="text-xs text-pv-danger">{formError}</p>}
        </div>
      </Modal>
      <ConfirmDialog
        open={!!eliminarTarget}
        onClose={() => setEliminarTarget(null)}
        onConfirm={eliminar}
        variant="danger"
        title="Eliminar destino"
        description={`Confirmas que queres eliminar "${eliminarTarget?.nombre}"? Esta accion no se puede deshacer y tambien quitara su asociacion con los proveedores.`}
        confirmLabel="Eliminar"
      />
    </div>
  );
}
