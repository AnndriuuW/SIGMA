import api from "./api";
import type { DetalleInventario } from "../types/detalleInventario";

export interface CrearDetalleInventarioRequest {
  idInventario: number;
  idRecurso: number;
  verificado: boolean;
  observacion?: string;
}

export interface ActualizarDetalleInventarioRequest {
  verificado: boolean;
  observacion?: string;
}

export const listarDetallesInventario = async (): Promise<
  DetalleInventario[]
> => {
  const response = await api.get<DetalleInventario[]>(
    "/detalles-inventario",
  );

  return response.data;
};

export const obtenerDetalleInventario = async (
  id: number,
): Promise<DetalleInventario> => {
  const response = await api.get<DetalleInventario>(
    `/detalles-inventario/${id}`,
  );

  return response.data;
};

export const crearDetalleInventario = async (
  request: CrearDetalleInventarioRequest,
): Promise<DetalleInventario> => {
  const response = await api.post<DetalleInventario>(
    "/detalles-inventario",
    request,
  );

  return response.data;
};

export const actualizarDetalleInventario = async (
  id: number,
  request: ActualizarDetalleInventarioRequest,
): Promise<DetalleInventario> => {
  const response = await api.put<DetalleInventario>(
    `/detalles-inventario/${id}`,
    request,
  );

  return response.data;
};