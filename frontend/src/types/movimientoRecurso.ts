export interface MovimientoRecurso {
  id: number;

  idRecurso: number;
  codigoRecurso: string;
  nombreRecurso: string;

  idUbicacionAnterior: number | null;
  nombreUbicacionAnterior: string | null;
  nombreUnidadAnterior: string | null;

  idUbicacionNueva: number;
  nombreUbicacionNueva: string;
  nombreUnidadNueva: string | null;

  codigoUsuario: string;
  nombreUsuario: string;

  fechaHora: string;
}