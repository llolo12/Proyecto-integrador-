export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  tipo_auth: 'local' | 'oauth';
  rol_id: string;
  estado: 'activo' | 'suspendido' | 'pendiente';
  idioma: string;
  created_at: string;
}

export interface Rol {
  id: string;
  nombre: string;
  permisos: Record<string, string[]>;
  created_at: string;
}
