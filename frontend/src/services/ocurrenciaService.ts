import api from "./api";
import type { Ocurrencia } from "../types/ocurrencia";

export const listarOcurrencias = async (): Promise<Ocurrencia[]> => {
  const response = await api.get<Ocurrencia[]>("/ocurrencias");
  return response.data;
};

export const obtenerOcurrencia = async (
  id: number,
): Promise<Ocurrencia> => {
  const response = await api.get<Ocurrencia>(
    `/ocurrencias/${id}`,
  );

  return response.data;
};

export interface CrearOcurrenciaRequest {
  tipo: "GENERAL" | "UNIDAD" | "RECURSO";
  descripcion: string;
  codigoDestinatario: string;
  idUnidad?: number;
  idRecurso?: number;
}

export const crearOcurrencia = async (
  request: CrearOcurrenciaRequest,
): Promise<Ocurrencia> => {
  const response = await api.post<Ocurrencia>(
    "/ocurrencias",
    request,
  );

  return response.data;
};