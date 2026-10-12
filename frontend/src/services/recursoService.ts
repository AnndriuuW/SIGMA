
import api from "./api";
import type { Recurso } from "../types/recurso";
import type { MovimientoRecurso } from "../types/movimientoRecurso";
import type { EstadoRecurso } from "../types/recurso";

export interface RecursoPayload {
  codigo: string;
  nombre: string;
  marca: string;
  modelo: string | null;
  numeroSerie: string | null;
  longitud: string | null;
  estado: EstadoRecurso;
  idTipoRecurso: number;
  idUbicacion: number;
}

export const listarRecursos = async (): Promise<Recurso[]> => {
  const response = await api.get<Recurso[]>("/recursos");

  return response.data;
};

export const crearRecurso = async (payload: RecursoPayload): Promise<Recurso> => {
  const response = await api.post<Recurso>("/recursos", payload);
  return response.data;
};

export const actualizarRecurso = async (
  id: number,
  payload: RecursoPayload,
): Promise<Recurso> => {
  const response = await api.put<Recurso>(`/recursos/${id}`, payload);
  return response.data;
};

export const desactivarRecurso = async (id: number): Promise<void> => {
  await api.delete(`/recursos/${id}`);
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
