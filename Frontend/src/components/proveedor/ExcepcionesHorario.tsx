import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import type { ExcepcionHorario } from '../../types/proveedor';

interface ExcepcionesHorarioProps {
  excepciones: ExcepcionHorario[];
  onAdd: (excepcion: Omit<ExcepcionHorario, 'id' | 'proveedor_id'>) => Promise<{ success: boolean; data?: ExcepcionHorario; error?: string }>;
  onDelete: (excepcionId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ExcepcionesHorario({ excepciones, onAdd, onDelete }: ExcepcionesHorarioProps) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [nuevaExcepcion, setNuevaExcepcion] = useState({
    fecha: '',
    motivo: '',
    hora_apertura: '',
    hora_cierre: '',
    cerrado: false,
    alerta: true,
  });

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaExcepcion.fecha) return;

    setSaving(true);
    const result = await onAdd(nuevaExcepcion);
    
    if (result.success) {
      showMessage('success', t('proveedor.excepciones.agregada', 'Excepción agregada'));
      setNuevaExcepcion({
        fecha: '',
        motivo: '',
        hora_apertura: '',
        hora_cierre: '',
        cerrado: false,
        alerta: true,
      });
      setShowForm(false);
    } else {
      showMessage('error', result.error || t('proveedor.excepciones.error_agregar', 'Error al agregar'));
    }
    
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('proveedor.excepciones.confirmar_eliminar', '¿Eliminar esta excepción?'))) return;

    setDeletingId(id);
    const result = await onDelete(id);
    
    if (result.success) {
      showMessage('success', t('proveedor.excepciones.eliminada', 'Excepción eliminada'));
    } else {
      showMessage('error', result.error || t('proveedor.excepciones.error_eliminar', 'Error al eliminar'));
    }
    
    setDeletingId(null);
  };

  const sortedExcepciones = [...excepciones].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  const formatDate = (fecha: string) => {
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {t('proveedor.excepciones.titulo', 'Excepciones de Horario')}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-pv-green text-white rounded-md hover:bg-pv-green-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('proveedor.excepciones.agregar', 'Agregar')}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Formulario para agregar */}
      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('proveedor.excepciones.fecha', 'Fecha')} *
              </label>
              <input
                type="date"
                value={nuevaExcepcion.fecha}
                onChange={(e) => setNuevaExcepcion(prev => ({ ...prev, fecha: e.target.value }))}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green"
              />
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('proveedor.excepciones.motivo', 'Motivo')}
              </label>
              <input
                type="text"
                value={nuevaExcepcion.motivo}
                onChange={(e) => setNuevaExcepcion(prev => ({ ...prev, motivo: e.target.value }))}
                placeholder={t('proveedor.excepciones.motivo_placeholder', 'Ej: Feriado, Mantenimiento...')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green"
              />
            </div>

            {/* Horarios (solo si no está cerrado) */}
            {!nuevaExcepcion.cerrado && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('proveedor.excepciones.hora_apertura', 'Hora apertura')}
                  </label>
                  <input
                    type="time"
                    value={nuevaExcepcion.hora_apertura}
                    onChange={(e) => setNuevaExcepcion(prev => ({ ...prev, hora_apertura: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('proveedor.excepciones.hora_cierre', 'Hora cierre')}
                  </label>
                  <input
                    type="time"
                    value={nuevaExcepcion.hora_cierre}
                    onChange={(e) => setNuevaExcepcion(prev => ({ ...prev, hora_cierre: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green"
                  />
                </div>
              </>
            )}
          </div>

          {/* Opciones */}
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevaExcepcion.cerrado}
                onChange={(e) => setNuevaExcepcion(prev => ({ ...prev, cerrado: e.target.checked }))}
                className="w-4 h-4 text-pv-green border-gray-300 rounded focus:ring-pv-green"
              />
              <span className="text-sm text-gray-700">
                {t('proveedor.excepciones.cerrado', 'Cerrado todo el día')}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={nuevaExcepcion.alerta}
                onChange={(e) => setNuevaExcepcion(prev => ({ ...prev, alerta: e.target.checked }))}
                className="w-4 h-4 text-pv-green border-gray-300 rounded focus:ring-pv-green"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                {t('proveedor.excepciones.mostrar_alerta', 'Mostrar alerta a usuarios')}
              </span>
            </label>
          </div>

          {/* Botones */}
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-pv-green text-white rounded-md hover:bg-pv-green-dark disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t('comun.agregar', 'Agregar')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {t('comun.cancelar', 'Cancelar')}
            </button>
          </div>
        </form>
      )}

      {/* Lista de excepciones */}
      {sortedExcepciones.length > 0 ? (
        <div className="space-y-3">
          {sortedExcepciones.map((excepcion) => (
            <div
              key={excepcion.id}
              className={`p-4 rounded-lg border ${
                excepcion.alerta ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 capitalize">
                      {formatDate(excepcion.fecha)}
                    </span>
                    {excepcion.alerta && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  {excepcion.motivo && (
                    <p className="text-sm text-gray-600 mt-1">{excepcion.motivo}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {excepcion.cerrado 
                      ? t('proveedor.excepciones.cerrado_label', 'Cerrado')
                      : excepcion.hora_apertura && excepcion.hora_cierre
                        ? `${excepcion.hora_apertura} - ${excepcion.hora_cierre}`
                        : t('proveedor.excepciones.horario_especial', 'Horario especial')
                    }
                  </p>
                </div>
                <button
                  onClick={() => excepcion.id && handleDelete(excepcion.id)}
                  disabled={deletingId === excepcion.id}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                  title={t('comun.eliminar', 'Eliminar')}
                >
                  {deletingId === excepcion.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('proveedor.excepciones.sin_excepciones', 'No hay excepciones programadas')}</p>
        </div>
      )}
    </div>
  );
}