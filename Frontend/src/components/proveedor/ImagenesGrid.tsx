/**
 * Componente: ImagenesGrid
 * 
 * Galería de imágenes del proveedor con funcionalidades:
 * - Drag & drop para subir imágenes
 * - Visualización tipo grid responsive
 * - Reordenar imágenes arrastrando
 * - Eliminar imágenes individuales
 * 
 * Conecta con:
 * - POST /proveedores/{id}/imagenes (subir)
 * - DELETE /proveedores/{id}/imagenes/{imagenId} (eliminar)
 * - PUT /proveedores/{id}/imagenes/reorder (reordenar)
 * 
 * @param imagenes - Array de imágenes actuales del proveedor
 * @param onUpload - Callback para subir nueva imagen
 * @param onDelete - Callback para eliminar imagen
 * @param onReorder - Callback para reordenar imágenes
 */
import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, GripVertical, Loader2, Image as ImageIcon } from 'lucide-react';
import type { ImagenProveedor } from '../../types/proveedor';

interface ImagenesGridProps {
  imagenes: ImagenProveedor[];
  onUpload: (file: File, orden: number) => Promise<{ success: boolean; data?: ImagenProveedor; error?: string }>;
  onDelete: (imagenId: string) => Promise<{ success: boolean; error?: string }>;
  onReorder: (imagenes: ImagenProveedor[]) => Promise<{ success: boolean; error?: string }>;
}

export default function ImagenesGrid({ imagenes, onUpload, onDelete, onReorder }: ImagenesGridProps) {
  const { t } = useTranslation();
  
  // Estados para drag & drop de archivos
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Estado para drag & drop de reordenamiento
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  
  // Estado para mensajes de éxito/error
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Referencia al input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Muestra un mensaje temporal (se oculta después de 3 segundos)
   */
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  /**
   * Procesa los archivos seleccionados/subidos
   * Filtra solo imágenes y las sube una por una
   */
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const nextOrden = imagenes.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Solo procesar archivos de imagen
      if (!file.type.startsWith('image/')) continue;

      const result = await onUpload(file, nextOrden + i);
      if (!result.success) {
        showMessage('error', result.error || t('proveedor.imagenes.error_upload', 'Error al subir la imagen'));
      }
    }

    setUploading(false);
  }, [imagenes, onUpload, t]);

  /**
   * Maneja cuando se sueltan archivos en la zona de drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  /**
   * Activa el estado visual cuando se arrastra sobre la zona
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  /**
   * Desactiva el estado visual cuando sale de la zona
   */
  const handleDragLeave = () => {
    setDragOver(false);
  };

  /**
   * Maneja la selección de archivos desde el input
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Elimina una imagen con confirmación
   */
  const handleDelete = async (imagenId: string) => {
    if (!confirm(t('proveedor.imagenes.confirmar_eliminar', '¿Estás seguro de eliminar esta imagen?'))) return;

    const result = await onDelete(imagenId);
    if (result.success) {
      showMessage('success', t('proveedor.imagenes.eliminada', 'Imagen eliminada'));
    } else {
      showMessage('error', result.error || t('proveedor.imagenes.error_eliminar', 'Error al eliminar'));
    }
  };

  /**
   * Inicia el arrastre de una imagen para reordenar
   */
  const handleDragStart = (index: number) => {
    setDraggedItem(index);
  };

  /**
   * Finaliza el arrastre
   */
  const handleDragEnd = async () => {
    setDraggedItem(null);
  };

  /**
   * Maneja el movimiento sobre otra imagen durante el reordenamiento
   * Calcula el nuevo orden y lo envía al servidor
   */
  const handleDragOverItem = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === targetIndex) return;

    // Crear nuevo orden moviendo el elemento arrastrado
    const newOrder = [...imagenes];
    const [removed] = newOrder.splice(draggedItem, 1);
    newOrder.splice(targetIndex, 0, removed);

    // Actualizar valores de orden
    const reordered = newOrder.map((img, idx) => ({ ...img, orden: idx }));
    
    const result = await onReorder(reordered);
    if (!result.success) {
      showMessage('error', result.error || t('proveedor.imagenes.error_reorder', 'Error al reordenar'));
    }
    
    setDraggedItem(targetIndex);
  };

  // Ordenar imágenes por su campo "orden"
  const sortedImages = [...imagenes].sort((a, b) => a.orden - b.orden);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {t('proveedor.imagenes.titulo', 'Imágenes')}
      </h2>

      {/* Mensaje temporal de éxito/error */}
      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Zona de drop para subir imágenes */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-pv-green bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {/* Input oculto para selección de archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading ? (
          <Loader2 className="w-10 h-10 mx-auto text-pv-green animate-spin" />
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {t('proveedor.imagenes.drag_drop', 'Arrastra imágenes aquí o haz clic para seleccionar')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {t('proveedor.imagenes.formatos', 'JPG, PNG, WebP (máx. 5MB cada una)')}
            </p>
          </>
        )}
      </div>

      {/* Grid de imágenes (solo si hay imágenes) */}
      {sortedImages.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {sortedImages.map((imagen, index) => (
            <div
              key={imagen.id || index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOverItem(e, index)}
              className={`relative group aspect-square rounded-lg overflow-hidden border ${
                draggedItem === index ? 'opacity-50' : ''
              }`}
            >
              {/* Imagen */}
              <img
                src={imagen.url_webp}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay con botón eliminar (visible al hover) */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (imagen.id) handleDelete(imagen.id);
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title={t('comun.eliminar', 'Eliminar')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Icono de arrastre (visible al hover) */}
              <div className="absolute top-2 left-2 p-1 bg-white/80 rounded cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-gray-600" />
              </div>

              {/* Número de orden */}
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vacío cuando no hay imágenes */}
      {sortedImages.length === 0 && !uploading && (
        <div className="mt-6 text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{t('proveedor.imagenes.sin_imagenes', 'No hay imágenes aún')}</p>
        </div>
      )}
    </div>
  );
}