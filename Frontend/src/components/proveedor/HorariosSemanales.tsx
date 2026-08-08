/**
 * Componente: HorariosSemanales
 * 
 * Tabla editable para los horarios de atención del proveedor.
 * Funcionalidades:
 * - Toggle abierto/cerrado por día
 * - Selector de hora de apertura y cierre
 * - Botón "Aplicar a todos" para copiar horario del primer día abierto
 * 
 * Conecta con: PUT /proveedores/{id}/horarios
 * 
 * @param horarios - Array de horarios actuales (7 días)
 * @param onSave - Callback para guardar los cambios
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Loader2, Clock } from 'lucide-react';
import type { HorarioSemanal } from '../../types/proveedor';

interface HorariosSemanalesProps {
  horarios: HorarioSemanal[];
  onSave: (horarios: HorarioSemanal[]) => Promise<{ success: boolean; error?: string }>;
}

// Días de la semana en orden (lunes a domingo)
const DIAS_SEMANA: HorarioSemanal['dia_semana'][] = [
  'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'
];

// Traducciones de los días (español)
const DIAS_TRADUCCION: Record<string, string> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

export default function HorariosSemanales({ horarios, onSave }: HorariosSemanalesProps) {
  const { t } = useTranslation();
  
  /**
   * Inicializar horarios editados:
   * - Si existe horario para el día, usarlo
   * - Si no existe, crear uno con valores por defecto (cerrado, 8:00-17:00)
   */
  const [horariosEditados, setHorariosEditados] = useState<HorarioSemanal[]>(() => {
    const iniciales: HorarioSemanal[] = DIAS_SEMANA.map(dia => {
      const existente = horarios.find(h => h.dia_semana === dia);
      return existente || {
        dia_semana: dia,
        hora_apertura: '08:00',
        hora_cierre: '17:00',
        abierto: false,
      };
    });
    return iniciales;
  });
  
  // Estado para el botón de guardar y mensajes
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Alterna el estado abierto/cerrado de un día
   */
  const handleToggleDia = (index: number) => {
    setHorariosEditados(prev => prev.map((h, i) => 
      i === index ? { ...h, abierto: !h.abierto } : h
    ));
  };

  /**
   * Actualiza la hora de apertura o cierre de un día
   */
  const handleHoraChange = (index: number, campo: 'hora_apertura' | 'hora_cierre', valor: string) => {
    setHorariosEditados(prev => prev.map((h, i) => 
      i === index ? { ...h, [campo]: valor } : h
    ));
  };

  /**
   * Copia el horario del primer día abierto a todos los demás días
   * Útil para establecer horarios uniformes rápidamente
   */
  const handleAplicarATodos = () => {
    const primerAbierto = horariosEditados.find(h => h.abierto);
    if (!primerAbierto) return;

    setHorariosEditados(prev => prev.map(h => ({
      ...h,
      hora_apertura: primerAbierto.hora_apertura,
      hora_cierre: primerAbierto.hora_cierre,
    })));
  };

  /**
   * Envía los horarios al servidor
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await onSave(horariosEditados);
    
    if (result.success) {
      setMessage({ type: 'success', text: t('proveedor.horarios.guardado', 'Horarios actualizados exitosamente') });
    } else {
      setMessage({ type: 'error', text: result.error || t('proveedor.horarios.error', 'Error al actualizar los horarios') });
    }
    
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header con título y botón "Aplicar a todos" */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {t('proveedor.horarios.titulo', 'Horarios de Atención')}
        </h2>
        <button
          type="button"
          onClick={handleAplicarATodos}
          className="text-sm text-pv-green hover:text-pv-green-dark transition-colors"
          title={t('proveedor.horarios.aplicar_todos', 'Aplicar horario del primer día abierto a todos')}
        >
          {t('proveedor.horarios.aplicar_todos_btn', 'Aplicar a todos')}
        </button>
      </div>

      {/* Mensaje temporal de éxito/error */}
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Lista de días con sus horarios */}
      <div className="space-y-3">
        {horariosEditados.map((horario, index) => (
          <div
            key={horario.dia_semana}
            className={`flex items-center gap-4 p-3 rounded-lg border ${
              horario.abierto ? 'border-pv-green bg-green-50/50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            {/* Toggle abierto/cerrado con nombre del día */}
            <label className="flex items-center gap-2 w-32 cursor-pointer">
              <input
                type="checkbox"
                checked={horario.abierto}
                onChange={() => handleToggleDia(index)}
                className="w-4 h-4 text-pv-green border-gray-300 rounded focus:ring-pv-green"
              />
              <span className={`text-sm font-medium ${horario.abierto ? 'text-gray-800' : 'text-gray-500'}`}>
                {DIAS_TRADUCCION[horario.dia_semana]}
              </span>
            </label>

            {/* Selectores de hora (solo si está abierto) */}
            {horario.abierto ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="time"
                  value={horario.hora_apertura}
                  onChange={(e) => handleHoraChange(index, 'hora_apertura', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pv-green"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="time"
                  value={horario.hora_cierre}
                  onChange={(e) => handleHoraChange(index, 'hora_cierre', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pv-green"
                />
              </div>
            ) : (
              <span className="text-sm text-gray-400 flex-1">
                {t('proveedor.horarios.cerrado', 'Cerrado')}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Botón de guardar con estado de carga */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-pv-green text-white rounded-md hover:bg-pv-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? t('comun.guardando', 'Guardando...') : t('comun.guardar', 'Guardar horarios')}
        </button>
      </div>
    </form>
  );
}