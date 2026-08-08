import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProveedor } from '../../hooks/useProveedor';
import EstadoVerificacion from '../../components/proveedor/EstadoVerificacion';
import PerfilForm from '../../components/proveedor/PerfilForm';
import ImagenesGrid from '../../components/proveedor/ImagenesGrid';
import HorariosSemanales from '../../components/proveedor/HorariosSemanales';
import ExcepcionesHorario from '../../components/proveedor/ExcepcionesHorario';
import ContactoForm from '../../components/proveedor/ContactoForm';
import api from '../../api/axios';

type TabId = 'perfil' | 'imagenes' | 'horarios' | 'excepciones' | 'contacto';

interface Tab {
  id: TabId;
  label: string;
}

export default function PanelProveedor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [proveedorId, setProveedorId] = useState<string | null>(null);
  const [loadingProveedorId, setLoadingProveedorId] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('perfil');

  // Obtener el ID del proveedor del usuario actual
  useEffect(() => {
    const fetchProveedorId = async () => {
      if (!user?.id) return;
      
      try {
        // Buscar el proveedor asociado al usuario
        const res = await api.get(`/proveedores?usuario_id=${user.id}`);
        if (res.data && res.data.length > 0) {
          setProveedorId(res.data[0].id);
        }
      } catch (error) {
        console.error('Error al obtener proveedor:', error);
      } finally {
        setLoadingProveedorId(false);
      }
    };

    fetchProveedorId();
  }, [user?.id]);

  const {
    proveedor,
    horarios,
    excepciones,
    contactos,
    imagenes,
    loading,
    error,
    updatePerfil,
    updateHorarios,
    addExcepcion,
    deleteExcepcion,
    updateContactos,
    uploadImagen,
    deleteImagen,
    reorderImagenes,
  } = useProveedor(proveedorId);

  const tabs: Tab[] = [
    { id: 'perfil', label: t('proveedor.tabs.perfil', 'Mi Perfil') },
    { id: 'imagenes', label: t('proveedor.tabs.imagenes', 'Imágenes') },
    { id: 'horarios', label: t('proveedor.tabs.horarios', 'Horarios') },
    { id: 'excepciones', label: t('proveedor.tabs.excepciones', 'Excepciones') },
    { id: 'contacto', label: t('proveedor.tabs.contacto', 'Contacto') },
  ];

  if (loadingProveedorId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pv-green" />
      </div>
    );
  }

  if (!proveedorId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">
            {t('proveedor.sin_perfil.titulo', 'No tienes un perfil de proveedor')}
          </h2>
          <p className="text-yellow-700">
            {t('proveedor.sin_perfil.descripcion', 'Para acceder al panel de proveedor, primero debes crear un perfil de negocio.')}
          </p>
        </div>
      </div>
    );
  }

  if (loading || !proveedor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-pv-green" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            {t('proveedor.error.titulo', 'Error al cargar el perfil')}
          </h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {t('proveedor.panel.titulo', 'Panel del Proveedor')}
        </h1>
        <p className="text-gray-600 mt-1">
          {proveedor.nombre}
        </p>
      </div>

      {/* Estado de verificación */}
      <div className="mb-6">
        <EstadoVerificacion estado={proveedor.estado_verificacion} />
      </div>

      {/* Tabs */}
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

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'perfil' && (
          <PerfilForm proveedor={proveedor} onSave={updatePerfil} />
        )}

        {activeTab === 'imagenes' && (
          <ImagenesGrid
            imagenes={imagenes}
            onUpload={uploadImagen}
            onDelete={deleteImagen}
            onReorder={reorderImagenes}
          />
        )}

        {activeTab === 'horarios' && (
          <HorariosSemanales horarios={horarios} onSave={updateHorarios} />
        )}

        {activeTab === 'excepciones' && (
          <ExcepcionesHorario
            excepciones={excepciones}
            onAdd={addExcepcion}
            onDelete={deleteExcepcion}
          />
        )}

        {activeTab === 'contacto' && (
          <ContactoForm contactos={contactos} onSave={updateContactos} />
        )}
      </div>
    </div>
  );
}