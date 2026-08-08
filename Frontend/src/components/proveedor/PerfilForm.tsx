/**
 * Componente: PerfilForm
 * 
 * Formulario editable para el perfil del proveedor.
 * Permite modificar:
 * - Nombre del negocio
 * - Descripción
 * - Declaratoria ICT (checkbox)
 * - Coordenadas geográficas (lat/lng)
 * 
 * Conecta con: PUT /proveedores/{id}
 * 
 * @param proveedor - Datos actuales del proveedor
 * @param onSave - Función callback para guardar los cambios
 */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Loader2 } from 'lucide-react';
import type { Proveedor } from '../../types/proveedor';

interface PerfilFormProps {
  proveedor: Proveedor;
  onSave: (data: Partial<Proveedor>) => Promise<{ success: boolean; error?: string }>;
}

export default function PerfilForm({ proveedor, onSave }: PerfilFormProps) {
  const { t } = useTranslation();
  
  // Estado local del formulario (se sincroniza con los props)
  const [formData, setFormData] = useState({
    nombre: proveedor.nombre || '',
    descripcion: proveedor.descripcion || '',
    declaratoria_ict: proveedor.declaratoria_ict || false,
    lat: proveedor.lat,
    lng: proveedor.lng,
  });
  
  // Estado para el botón de guardar y mensajes
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sincronizar formulario cuando cambian los datos del proveedor
  useEffect(() => {
    setFormData({
      nombre: proveedor.nombre || '',
      descripcion: proveedor.descripcion || '',
      declaratoria_ict: proveedor.declaratoria_ict || false,
      lat: proveedor.lat,
      lng: proveedor.lng,
    });
  }, [proveedor]);

  /**
   * Maneja cambios en los inputs del formulario
   * Detecta si es checkbox o input normal para obtener el valor correcto
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  /**
   * Envía el formulario al servidor
   * Muestra mensaje de éxito/error y lo oculta después de 3 segundos
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const result = await onSave(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: t('proveedor.perfil.guardado', 'Perfil actualizado exitosamente') });
    } else {
      setMessage({ type: 'error', text: result.error || t('proveedor.perfil.error', 'Error al actualizar el perfil') });
    }
    
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('proveedor.perfil.titulo', 'Mi Perfil')}
      </h2>

      <div className="space-y-4">
        {/* Campo: Nombre del negocio */}
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            {t('proveedor.perfil.nombre', 'Nombre del negocio')}
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green focus:border-transparent"
            required
          />
        </div>

        {/* Campo: Descripción del negocio */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            {t('proveedor.perfil.descripcion', 'Descripción')}
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green focus:border-transparent resize-none"
            placeholder={t('proveedor.perfil.descripcion_placeholder', 'Describe tu negocio...')}
          />
        </div>

        {/* Campo: Declaratoria ICT (checkbox) */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="declaratoria_ict"
            name="declaratoria_ict"
            checked={formData.declaratoria_ict}
            onChange={handleChange}
            className="w-4 h-4 text-pv-green border-gray-300 rounded focus:ring-pv-green"
          />
          <label htmlFor="declaratoria_ict" className="text-sm text-gray-700">
            {t('proveedor.perfil.declaratoria_ict', 'Posee declaratoria de Interés Cultural y Turístico (ICT)')}
          </label>
        </div>

        {/* Campos: Coordenadas geográficas (opcionales) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
              {t('proveedor.perfil.latitud', 'Latitud')}
            </label>
            <input
              type="number"
              id="lat"
              name="lat"
              value={formData.lat || ''}
              onChange={handleChange}
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green focus:border-transparent"
              placeholder="9.9281"
            />
          </div>
          <div>
            <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-1">
              {t('proveedor.perfil.longitud', 'Longitud')}
            </label>
            <input
              type="number"
              id="lng"
              name="lng"
              value={formData.lng || ''}
              onChange={handleChange}
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green focus:border-transparent"
              placeholder="-84.0907"
            />
          </div>
        </div>
      </div>

      {/* Mensaje de éxito/error (se muestra temporalmente) */}
      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

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
          {saving ? t('comun.guardando', 'Guardando...') : t('comun.guardar', 'Guardar cambios')}
        </button>
      </div>
    </form>
  );
}