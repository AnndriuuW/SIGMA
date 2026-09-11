import api from "./api";
import type { Unidad } from "../types/unidad";

export const listarUnidades = async (): Promise<Unidad[]> => {
  const response = await api.get<Unidad[]>("/unidades");

  return response.data;
};