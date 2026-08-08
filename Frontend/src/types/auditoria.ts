export interface LogAccion {
  id: string;
  usuario_id: string | null;
  usuario_nombre: string | null;
  usuario_correo: string | null;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  ip: string | null;
  timestamp: string;
}
export interface LogAccionPage {
  items: LogAccion[];
  total: number;
  skip: number;
  limit: number;
}
