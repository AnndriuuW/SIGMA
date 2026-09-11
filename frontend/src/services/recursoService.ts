import api from "./api";
import type { Recurso } from "../types/recurso";

export const listarRecursos = async (): Promise<Recurso[]> => {
  const response = await api.get<Recurso[]>("/recursos");

  return response.data;
};