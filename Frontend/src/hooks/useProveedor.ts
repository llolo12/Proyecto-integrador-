/**
 * Hook personalizado para manejar los datos y operaciones del proveedor
 * 
 * Este hook centraliza toda la lógica de negocio relacionada con el proveedor:
 * - Obtener datos del proveedor desde la API
 * - Actualizar perfil, horarios, contactos e imágenes
 * - Manejar excepciones de horario
 * 
 * @param proveedorId - ID del proveedor (null si no hay proveedor seleccionado)
 * @returns Objeto con datos del proveedor y funciones para manipularlos
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import type { Proveedor, HorarioSemanal, ExcepcionHorario, ContactoProveedor, ImagenProveedor } from '../types/proveedor';

export function useProveedor(proveedorId: string | null) {
  // Estado para almacenar los datos del proveedor
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [horarios, setHorarios] = useState<HorarioSemanal[]>([]);
  const [excepciones, setExcepciones] = useState<ExcepcionHorario[]>([]);
  const [contactos, setContactos] = useState<ContactoProveedor[]>([]);
  const [imagenes, setImagenes] = useState<ImagenProveedor[]>([]);
  
  // Estado de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene los datos completos del proveedor desde la API
   * Incluye: perfil, horarios, excepciones, contactos e imágenes
   */
  const fetchProveedor = useCallback(async () => {
    if (!proveedorId) return;
    try {
      setLoading(true);
      const res = await api.get<Proveedor & { 
        horarios?: HorarioSemanal[];
        excepciones?: ExcepcionHorario[];
        contactos?: ContactoProveedor[];
        imagenes?: ImagenProveedor[];
      }>(`/proveedores/${proveedorId}`);
      
      // Actualizar todos los estados con los datos recibidos
      setProveedor(res.data);
      setHorarios(res.data.horarios || []);
      setExcepciones(res.data.excepciones || []);
      setContactos(res.data.contactos || []);
      setImagenes(res.data.imagenes || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos del proveedor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [proveedorId]);

  // Cargar datos cuando cambia el proveedorId
  useEffect(() => {
    fetchProveedor();
  }, [fetchProveedor]);

  /**
   * Actualiza el perfil del proveedor
   * Conecta con: PUT /proveedores/{id}
   * 
   * @param data - Datos parciales del proveedor a actualizar
   * @returns Resultado de la operación (success/error)
   */
  const updatePerfil = async (data: Partial<Proveedor>): Promise<{ success: boolean; error?: string }> => {
    if (!proveedorId) return { success: false, error: 'No hay proveedor seleccionado' };
    try {
      const res = await api.put(`/proveedores/${proveedorId}`, data);
      setProveedor(prev => prev ? { ...prev, ...res.data } : null);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al actualizar el perfil' };
    }
  };

  /**
   * Actualiza los horarios semanales del proveedor
   * Conecta con: PUT /proveedores/{id}/horarios
   * 
   * @param nuevosHorarios - Array con los 7 días de la semana
   * @returns Resultado de la operación
   */
  const updateHorarios = async (nuevosHorarios: HorarioSemanal[]): Promise<{ success: boolean; error?: string }> => {
    if (!proveedorId) return { success: false, error: 'No hay proveedor seleccionado' };
    try {
      await api.put(`/proveedores/${proveedorId}/horarios`, nuevosHorarios);
      setHorarios(nuevosHorarios);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al actualizar los horarios' };
    }
  };

  /**
   * Agrega una excepción de horario (feriado, mantenimiento, etc.)
   * Conecta con: POST /proveedores/{id}/excepciones
   * 
   * @param excepcion - Datos de la excepción sin id ni proveedor_id
   * @returns Resultado con la excepción creada
   */
  const addExcepcion = async (excepcion: Omit<ExcepcionHorario, 'id' | 'proveedor_id'>): Promise<{ success: boolean; data?: ExcepcionHorario; error?: string }> => {
    if (!proveedorId) return { success: false, error: 'No hay proveedor seleccionado' };
    try {
      const res = await api.post(`/proveedores/${proveedorId}/excepciones`, excepcion);
      setExcepciones(prev => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: 'Error al agregar la excepción' };
    }
  };

  /**
   * Elimina una excepción de horario
   * Conecta con: DELETE /proveedores/{id}/excepciones/{excepcionId}
   * 
   * @param excepcionId - ID de la excepción a eliminar
   * @returns Resultado de la operación
   */
  const deleteExcepcion = async (excepcionId: string): Promise<{ success: boolean; error?: string }> => {
    if (!proveedorId) return { success: false, error: 'No hay proveedor seleccionado' };
    try {
      await api.delete(`/proveedores/${proveedorId}/excepciones/${excepcionId}`);
      setExcepciones(prev => prev.filter(e => e.id !== excepcionId));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al eliminar la excepción' };
    }
  };

  /**
   * Actualiza la información de contacto del proveedor
   * Conecta con: PUT /proveedores/{id}/contactos
   * 
   * @param nuevosContactos - Array de contactos (teléfono, web, instagram, whatsapp)
   * @returns Resultado de la operación
   */
  const updateContactos = async (nuevosContactos: ContactoProveedor[]): Promise<{ success: boolean; error?: string }> => {
    if (!proveedorId) return { success: false, error: 'No hay proveedor seleccionado' };
    try {
      await api.put(`/proveedores/${proveedorId}/contactos`, nuevosContactos);
      setContactos(nuevosContactos);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al actualizar los contactos' };
    }
  };

  /**
   * Sube una imagen al servidor
   * Conecta con: POST /proveedores/{id}/imagenes (multipart/form-data)
   * 
   * @param file - Archivo de imagen a subir
   * @param orden - Posición de la imagen en la galería
   * @returns Resultado con la imagen creada
   */
  const uploadImagen = async (file: File, orden: number): Promise<{ success: boolean; data?: ImagenProveedor; error?: string }> => {
    if (!proveedorId) return { success: false, error: 'No hay proveedor seleccionado' };
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orden', orden.toString());
      
      const res = await api.post(`/proveedores/${proveedorId}/imagenes`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImagenes(prev => [...prev, res.data]);
      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: 'Error al subir la imagen' };
    }
  };

  /**
   * Elimina una imagen del servidor
   * Conecta con: DELETE /proveedores/{id}/imagenes/{imagenId}
   * 
   * @param imagenId - ID de la imagen a eliminar
   * @returns Resultado de la operación
   */
  const deleteImagen = async (imagenId: string): Promise<{ success: boolean; error?: string }> => {
    if (!proveedorId) return { success: false, error: 'No hay proveedor seleccionado' };
    try {
      await api.delete(`/proveedores/${proveedorId}/imagenes/${imagenId}`);
      setImagenes(prev => prev.filter(img => img.id !== imagenId));
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al eliminar la imagen' };
    }
  };

  /**
   * Reordena las imágenes de la galería
   * Conecta con: PUT /proveedores/{id}/imagenes/reorder
   * 
   * @param imagenesReordenadas - Array de imágenes con el nuevo orden
   * @returns Resultado de la operación
   */
  const reorderImagenes = async (imagenesReordenadas: ImagenProveedor[]): Promise<{ success: boolean; error?: string }> => {
    if (!proveedorId) return { success: false, error: 'No hay proveedor seleccionado' };
    try {
      await api.put(`/proveedores/${proveedorId}/imagenes/reorder`, imagenesReordenadas);
      setImagenes(imagenesReordenadas);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Error al reordenar las imágenes' };
    }
  };

  // Retornar todos los datos y funciones
  return {
    proveedor,
    horarios,
    excepciones,
    contactos,
    imagenes,
    loading,
    error,
    fetchProveedor,
    updatePerfil,
    updateHorarios,
    addExcepcion,
    deleteExcepcion,
    updateContactos,
    uploadImagen,
    deleteImagen,
    reorderImagenes,
  };
}