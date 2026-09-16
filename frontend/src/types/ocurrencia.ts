export type TipoOcurrencia =
  | "GENERAL"
  | "UNIDAD"
  | "RECURSO";

export interface Ocurrencia {
  id: number;
  fechaHora: string;
  tipo: TipoOcurrencia;
  descripcion: string;

  codigoInformante: string;
  nombreInformante: string;

  codigoDestinatario: string;
  nombreDestinatario: string;

  idUnidad: number | null;
  nombreUnidad: string | null;

  idRecurso: number | null;
  codigoRecurso: string | null;

  leida: boolean;
}