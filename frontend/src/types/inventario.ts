export type EstadoInventario =
  | "EN_PROCESO"
  | "PAUSADO"
  | "FINALIZADO";

export type ResultadoInventario =
  | "CONFORME"
  | "CON_OBSERVACIONES"
  | "NO_CONFORME";

export interface Inventario {
  id: number;
  idUnidad: number;
  nombreUnidad: string;
  codigoResponsable: string;
  nombreResponsable: string;
  fechaInicio: string;
  fechaFin: string | null;
  estado: EstadoInventario;
  resultadoGeneral: ResultadoInventario | null;
}