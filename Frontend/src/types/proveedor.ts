export interface Categoria {
  id: string;
  nombre: string;
}
export interface ImagenProveedor {
  id?: string;
  url_webp: string;
  orden: number;
}
export interface ContactoProveedor {
  id?: string;
  tipo: 'telefono' | 'web' | 'instagram' | 'whatsapp';
  valor: string;
}
export interface HorarioSemanal {
  id?: string;
  proveedor_id?: string;
  dia_semana: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  hora_apertura: string;
  hora_cierre: string;
  abierto: boolean;
}
export interface ExcepcionHorario {
  id?: string;
  proveedor_id?: string;
  fecha: string;
  motivo?: string;
  hora_apertura?: string;
  hora_cierre?: string;
  cerrado: boolean;
  alerta: boolean;
  created_at?: string;
}
export interface Proveedor {
  id: string;
  usuario_id: string;
  categoria_id: string;
  nombre: string;
  descripcion?: string;
  declaratoria_ict: boolean;
  estado_verificacion: 'pendiente' | 'aprobado' | 'rechazado';
  motivo_rechazo?: string | null;
  lat?: number;
  lng?: number;
  created_at: string;
  imagenes?: ImagenProveedor[];
  contactos?: ContactoProveedor[];
  horarios?: HorarioSemanal[];
  categoria?: Categoria;
}
export interface ProveedorAdmin extends Proveedor {
  categoria_nombre: string | null;
  usuario_nombre: string | null;
  usuario_correo: string | null;
}
