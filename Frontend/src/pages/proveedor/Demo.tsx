/**
 * Página: Demo del Panel del Proveedor
 * 
 * Página de demostración con datos mock para probar el panel sin autenticación.
 * Útil para:
 * - Visualizar el diseño y funcionalidades
 * - Pruebas rápidas sin backend
 * - Demostraciones a terceros
 * 
 * NOTA: Los cambios no se guardan en la base de datos.
 * 
 * Ruta: /demo/proveedor (pública, sin autenticación)
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import EstadoVerificacion from '../../components/proveedor/EstadoVerificacion';
import PerfilForm from '../../components/proveedor/PerfilForm';
import ImagenesGrid from '../../components/proveedor/ImagenesGrid';
import HorariosSemanales from '../../components/proveedor/HorariosSemanales';
import ExcepcionesHorario from '../../components/proveedor/ExcepcionesHorario';
import ContactoForm from '../../components/proveedor/ContactoForm';
import type { Proveedor, HorarioSemanal, ExcepcionHorario, ContactoProveedor, ImagenProveedor } from '../../types/proveedor';

// Tipos de tabs disponibles
type TabId = 'perfil' | 'imagenes' | 'horarios' | 'excepciones' | 'contacto';

/**
 * Datos mock para demostración
 * Simulan un proveedor real con información de ejemplo
 */
const MOCK_PROVEEDOR: Proveedor = {
  id: 'demo-001',
  usuario_id: 'user-001',
  categoria_id: 'cat-001',
  nombre: 'Restaurante Pura Vida',
  descripcion: 'Auténtica comida costarricense con ingredientes frescos y locales. Especializados en casados, gallo pinto y ceviche.',
  declaratoria_ict: true,
  estado_verificacion: 'pendiente',
  lat: 9.9281,
  lng: -84.0907,
  created_at: new Date().toISOString(),
  categoria: { id: 'cat-001', nombre: 'Restaurantes' },
};

// Horarios mock: lunes a domingo con horarios típicos
const MOCK_HORARIOS: HorarioSemanal[] = [
  { id: 'h1', dia_semana: 'lunes', hora_apertura: '08:00', hora_cierre: '17:00', abierto: true },
  { id: 'h2', dia_semana: 'martes', hora_apertura: '08:00', hora_cierre: '17:00', abierto: true },
  { id: 'h3', dia_semana: 'miercoles', hora_apertura: '08:00', hora_cierre: '17:00', abierto: true },
  { id: 'h4', dia_semana: 'jueves', hora_apertura: '08:00', hora_cierre: '20:00', abierto: true },
  { id: 'h5', dia_semana: 'viernes', hora_apertura: '08:00', hora_cierre: '22:00', abierto: true },
  { id: 'h6', dia_semana: 'sabado', hora_apertura: '09:00', hora_cierre: '22:00', abierto: true },
  { id: 'h7', dia_semana: 'domingo', hora_apertura: '09:00', hora_cierre: '15:00', abierto: true },
];

// Excepciones mock: feriado y mantenimiento
const MOCK_EXCEPCIONES: ExcepcionHorario[] = [
  {
    id: 'e1',
    fecha: '2026-08-15',
    motivo: 'Día de la Independencia',
    cerrado: true,
    alerta: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'e2',
    fecha: '2026-08-20',
    motivo: 'Mantenimiento',
    hora_apertura: '12:00',
    hora_cierre: '18:00',
    cerrado: false,
    alerta: true,
    created_at: new Date().toISOString(),
  },
];

// Contactos mock: teléfono, WhatsApp, web e Instagram
const MOCK_CONTACTOS: ContactoProveedor[] = [
  { id: 'c1', tipo: 'telefono', valor: '+506 2222-3333' },
  { id: 'c2', tipo: 'whatsapp', valor: '+506 8888-9999' },
  { id: 'c3', tipo: 'web', valor: 'https://www.puravida.cr' },
  { id: 'c4', tipo: 'instagram', valor: '@puravidarestaurante' },
];

// Imágenes mock: 4 imágenes de Unsplash
const MOCK_IMAGENES: ImagenProveedor[] = [
  { id: 'i1', url_webp: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', orden: 0 },
  { id: 'i2', url_webp: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', orden: 1 },
  { id: 'i3', url_webp: 'https://images.unsplash.com/photo-1504642723678-3a5c59e50f71?w=400', orden: 2 },
  { id: 'i4', url_webp: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400', orden: 3 },
];

export default function DemoProveedor() {
  const { t } = useTranslation();
  
  // Estado para la tab activa
  const [activeTab, setActiveTab] = useState<TabId>('perfil');
  
  // Estados locales con datos mock (simulan el estado del hook useProveedor)
  const [proveedor, setProveedor] = useState(MOCK_PROVEEDOR);
  const [horarios, setHorarios] = useState(MOCK_HORARIOS);
  const [excepciones, setExcepciones] = useState(MOCK_EXCEPCIONES);
  const [contactos, setContactos] = useState(MOCK_CONTACTOS);
  const [imagenes, setImagenes] = useState(MOCK_IMAGENES);

  // Configuración de las tabs
  const tabs: { id: TabId; label: string }[] = [
    { id: 'perfil', label: 'Mi Perfil' },
    { id: 'imagenes', label: 'Imágenes' },
    { id: 'horarios', label: 'Horarios' },
    { id: 'excepciones', label: 'Excepciones' },
    { id: 'contacto', label: 'Contacto' },
  ];

  // Handlers mock: simulan guardado exitoso con delay
  const handleSavePerfil = async (data: Partial<Proveedor>) => {
    setProveedor(prev => ({ ...prev, ...data }));
    console.log('Perfil guardado:', data);
    return { success: true };
  };

  const handleSaveHorarios = async (nuevosHorarios: HorarioSemanal[]) => {
    setHorarios(nuevosHorarios);
    console.log('Horarios guardados:', nuevosHorarios);
    return { success: true };
  };

  const handleAddExcepcion = async (excepcion: Omit<ExcepcionHorario, 'id' | 'proveedor_id'>) => {
    const nueva = { ...excepcion, id: `e${Date.now()}`, created_at: new Date().toISOString() };
    setExcepciones(prev => [...prev, nueva]);
    console.log('Excepción agregada:', nueva);
    return { success: true, data: nueva };
  };

  const handleDeleteExcepcion = async (id: string) => {
    setExcepciones(prev => prev.filter(e => e.id !== id));
    console.log('Excepción eliminada:', id);
    return { success: true };
  };

  const handleSaveContactos = async (nuevosContactos: ContactoProveedor[]) => {
    setContactos(nuevosContactos);
    console.log('Contactos guardados:', nuevosContactos);
    return { success: true };
  };

  const handleUploadImagen = async (file: File, orden: number) => {
    const nueva = {
      id: `i${Date.now()}`,
      url_webp: URL.createObjectURL(file),
      orden,
    };
    setImagenes(prev => [...prev, nueva]);
    console.log('Imagen subida:', nueva);
    return { success: true, data: nueva };
  };

  const handleDeleteImagen = async (id: string) => {
    setImagenes(prev => prev.filter(img => img.id !== id));
    console.log('Imagen eliminada:', id);
    return { success: true };
  };

  const handleReorderImagenes = async (reordenadas: ImagenProveedor[]) => {
    setImagenes(reordenadas);
    console.log('Imágenes reordenadas:', reordenadas);
    return { success: true };
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Banner informativo de modo demo */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 font-medium">
          🧪 Modo Demostración
        </p>
        <p className="text-blue-600 text-sm mt-1">
          Esta es una vista de prueba del Panel del Proveedor con datos ficticios.
          Los cambios no se guardan en la base de datos.
        </p>
      </div>

      {/* Header: Título y nombre del proveedor */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('proveedor.panel.titulo', 'Panel del Proveedor')}
        </h1>
        <p className="text-gray-600 mt-1">{proveedor.nombre}</p>
      </div>

      {/* Estado de verificación (siempre visible) */}
      <div className="mb-6">
        <EstadoVerificacion estado={proveedor.estado_verificacion} />
      </div>

      {/* Navegación por tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-pv-green text-pv-green'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de la tab activa */}
      <div className="space-y-6">
        {activeTab === 'perfil' && (
          <PerfilForm proveedor={proveedor} onSave={handleSavePerfil} />
        )}

        {activeTab === 'imagenes' && (
          <ImagenesGrid
            imagenes={imagenes}
            onUpload={handleUploadImagen}
            onDelete={handleDeleteImagen}
            onReorder={handleReorderImagenes}
          />
        )}

        {activeTab === 'horarios' && (
          <HorariosSemanales horarios={horarios} onSave={handleSaveHorarios} />
        )}

        {activeTab === 'excepciones' && (
          <ExcepcionesHorario
            excepciones={excepciones}
            onAdd={handleAddExcepcion}
            onDelete={handleDeleteExcepcion}
          />
        )}

        {activeTab === 'contacto' && (
          <ContactoForm contactos={contactos} onSave={handleSaveContactos} />
        )}
      </div>
    </div>
  );
}