export type EstadoRecurso =
  | "OPERATIVO"
  | "DANADO"
  | "EN_MANTENIMIENTO";

export interface Recurso {
  id: number;
  codigo: string;
  nombre: string;
  marca: string;
  modelo: string | null;
  numeroSerie: string | null;
  longitud: string | null;
  estado: EstadoRecurso;
  idTipoRecurso: number;
  nombreTipoRecurso: string;
  idUbicacion: number;
  nombreUbicacion: string;
  activo: boolean;
}