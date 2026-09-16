export interface DetalleInventario {
  id: number;
  idInventario: number;
  idRecurso: number;
  codigoRecurso: string;
  nombreRecurso: string;
  codigoVerificadoPor: string;
  nombreVerificadoPor: string;
  verificado: boolean;
  fechaVerificacion: string;
  observacion: string | null;
}