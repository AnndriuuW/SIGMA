export type TipoUbicacion =
  | "CASILLERO"
  | "CABINA"
  | "TECHO"
  | "SALA_DE_OPERACIONES";

export interface Ubicacion {
  id: number;
  nombre: string;
  tipo: TipoUbicacion;
  idUnidad: number | null;
  nombreUnidad: string | null;
  activo: boolean;
}