export type EstadoUnidad =
  | "OPERATIVA"
  | "FUERA_DE_SERVICIO"
  | "MANTENIMIENTO";

export interface Unidad {
  id: number;
  nombre: string;
  indicativo: string;
  estado: EstadoUnidad;
  activo: boolean;
}