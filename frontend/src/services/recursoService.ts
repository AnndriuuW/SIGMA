import api from "./api";
import type { Recurso } from "../types/recurso";

export const listarRecursos = async (): Promise<Recurso[]> => {
  const response = await api.get<Recurso[]>("/recursos");

  return response.data;
};

export const cambiarUbicacionRecurso = async (
  idRecurso: number,
  idUbicacion: number,
): Promise<Recurso> => {
  const response = await api.put<Recurso>(
    `/recursos/${idRecurso}/ubicacion`,
    { idUbicacion },
  );

  return response.data;
};