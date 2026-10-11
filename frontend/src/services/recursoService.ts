
import api from "./api";
import type { Recurso } from "../types/recurso";
import type { MovimientoRecurso } from "../types/movimientoRecurso";

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

export const obtenerHistorialRecurso = async (
  idRecurso: number,
): Promise<MovimientoRecurso[]> => {
  const response = await api.get<MovimientoRecurso[]>(
    `/recursos/${idRecurso}/historial`,
  );

  return response.data;
};
