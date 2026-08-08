import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import type { Proveedor, HorarioSemanal, ExcepcionHorario, ContactoProveedor, ImagenProveedor } from '../types/proveedor';

export function useProveedor(proveedorId: string | null) {
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [horarios, setHorarios] = useState<HorarioSemanal[]>([]);
  const [excepciones, setExcepciones] = useState<ExcepcionHorario[]>([]);
  const [contactos, setContactos] = useState<ContactoProveedor[]>([]);
  const [imagenes, setImagenes] = useState<ImagenProveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProveedor();
  }, [fetchProveedor]);

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