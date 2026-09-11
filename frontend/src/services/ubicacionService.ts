import api from "./api";
import type { Ubicacion } from "../types/ubicacion";

export const listarUbicaciones = async (): Promise<Ubicacion[]> => {
  const response = await api.get<Ubicacion[]>("/ubicaciones");

  return response.data;
};