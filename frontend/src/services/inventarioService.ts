import api from "./api";
import type {
  EstadoInventario,
  Inventario,
  ResultadoInventario,
} from "../types/inventario";

export const listarInventarios = async (): Promise<Inventario[]> => {
  const response = await api.get<Inventario[]>("/inventarios");
  return response.data;
};

export const obtenerInventario = async (
  id: number,
): Promise<Inventario> => {
  const response = await api.get<Inventario>(`/inventarios/${id}`);
  return response.data;
};

export const crearInventario = async (
  idUnidad: number,
): Promise<Inventario> => {
  const response = await api.post<Inventario>("/inventarios", {
    idUnidad,
  });

  return response.data;
};

export const actualizarInventario = async (
  id: number,
  estado: EstadoInventario,
  resultadoGeneral?: ResultadoInventario,
): Promise<Inventario> => {
  const response = await api.put<Inventario>(`/inventarios/${id}`, {
    estado,
    resultadoGeneral,
  });

  return response.data;
};