import api from "./api";
import type { TipoRecurso } from "../types/tipoRecurso";

export const listarTiposRecurso = async (): Promise<TipoRecurso[]> => {
  const response = await api.get<TipoRecurso[]>("/tipos-recurso");
  return response.data;
};
