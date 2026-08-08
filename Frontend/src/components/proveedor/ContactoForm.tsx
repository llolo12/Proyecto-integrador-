/**
 * Componente: ContactoForm
 * 
 * Formulario para gestionar la información de contacto del proveedor.
 * Tipos de contacto soportados:
 * - Teléfono
 * - WhatsApp
 * - Sitio Web
 * - Instagram
 * 
 * Funcionalidades:
 * - Agregar/eliminar tipos de contacto dinámicamente
 * - Validación de campos vacíos (no se guardan)
 * - Iconos específicos para cada tipo
 * 
 * Conecta con: PUT /proveedores/{id}/contactos
 * 
 * @param contactos - Array de contactos actuales
 * @param onSave - Callback para guardar los cambios
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Loader2, Plus, Trash2, Phone, Globe, AtSign, MessageCircle } from 'lucide-react';
import type { ContactoProveedor } from '../../types/proveedor';

interface ContactoFormProps {
  contactos: ContactoProveedor[];
  onSave: (contactos: ContactoProveedor[]) => Promise<{ success: boolean; error?: string }>;
}

// Tipo de contacto disponible
type TipoContacto = ContactoProveedor['tipo'];

/**
 * Configuración de cada tipo de contacto:
 * - tipo: identificador del tipo
 * - label: nombre visible
 * - icon: componente de icono de lucide-react
 * - placeholder: texto de ejemplo para el input
 */
const TIPOS_CONTACTO: { tipo: TipoContacto; label: string; icon: React.ElementType; placeholder: string }[] = [
  { tipo: 'telefono', label: 'Teléfono', icon: Phone, placeholder: '+506 2222-3333' },
  { tipo: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: '+506 8888-9999' },
  { tipo: 'web', label: 'Sitio Web', icon: Globe, placeholder: 'https://www.ejemplo.com' },
  { tipo: 'instagram', label: 'Instagram', icon: AtSign, placeholder: '@usuario' },
];

export default function ContactoForm({ contactos, onSave }: ContactoFormProps) {
  const { t } = useTranslation();
  
  // Estado local con los contactos editados
  const [contactosEditados, setContactosEditados] = useState<ContactoProveedor[]>(contactos);
  
  // Estado para el botón de guardar y mensajes
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /**
   * Agrega un nuevo tipo de contacto (si no existe ya)
   */
  const handleAddContacto = (tipo: TipoContacto) => {
    const existe = contactosEditados.find(c => c.tipo === tipo);
    if (existe) return;

    setContactosEditados(prev => [...prev, { tipo, valor: '' }]);
  };

  /**
   * Elimina un tipo de contacto de la lista
   */
  const handleRemoveContacto = (tipo: TipoContacto) => {
    setContactosEditados(prev => prev.filter(c => c.tipo !== tipo));
  };

  /**
   * Actualiza el valor de un contacto específico
   */
  const handleValorChange = (tipo: TipoContacto, valor: string) => {
    setContactosEditados(prev => prev.map(c => 
      c.tipo === tipo ? { ...c, valor } : c
    ));
  };

  /**
   * Envía los contactos al servidor
   * Filtra los contactos vacíos antes de guardar
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Filtrar contactos vacíos (no guardar campos sin valor)
    const contactosValidos = contactosEditados.filter(c => c.valor.trim() !== '');
    
    const result = await onSave(contactosValidos);
    
    if (result.success) {
      setMessage({ type: 'success', text: t('proveedor.contacto.guardado', 'Contactos actualizados') });
    } else {
      setMessage({ type: 'error', text: result.error || t('proveedor.contacto.error', 'Error al actualizar') });
    }
    
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  // Calcular tipos disponibles (que no han sido agregados aún)
  const tiposDisponibles = TIPOS_CONTACTO.filter(
    tc => !contactosEditados.find(c => c.tipo === tc.tipo)
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('proveedor.contacto.titulo', 'Información de Contacto')}
      </h2>

      {/* Mensaje temporal de éxito/error */}
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Lista de contactos editables */}
      <div className="space-y-4">
        {contactosEditados.map((contacto) => {
          // Buscar configuración del tipo de contacto
          const tipoInfo = TIPOS_CONTACTO.find(tc => tc.tipo === contacto.tipo);
          if (!tipoInfo) return null;

          const Icon = tipoInfo.icon;

          return (
            <div key={contacto.tipo} className="flex items-center gap-3">
              {/* Icono y label del tipo */}
              <div className="flex items-center gap-2 w-32 text-gray-600">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tipoInfo.label}</span>
              </div>
              {/* Input para el valor */}
              <input
                type="text"
                value={contacto.valor}
                onChange={(e) => handleValorChange(contacto.tipo, e.target.value)}
                placeholder={tipoInfo.placeholder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pv-green"
              />
              {/* Botón eliminar */}
              <button
                type="button"
                onClick={() => handleRemoveContacto(contacto.tipo)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title={t('comun.eliminar', 'Eliminar')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Botones para agregar tipos de contacto disponibles */}
      {tiposDisponibles.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tiposDisponibles.map((tc) => {
            const Icon = tc.icon;
            return (
              <button
                key={tc.tipo}
                type="button"
                onClick={() => handleAddContacto(tc.tipo)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <Icon className="w-4 h-4" />
                {tc.label}
              </button>
            );
          })}
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
          {saving ? t('comun.guardando', 'Guardando...') : t('comun.guardar', 'Guardar contactos')}
        </button>
      </div>
    </form>
  );
}