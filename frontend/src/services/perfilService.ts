import api from "./api";

export interface Perfil {
  codigo: string;
  nombres: string;
  apellidos: string;
  rol: string;
}

export interface PerfilUpdateRequest {
  nombres: string;
  apellidos: string;
  contrasena?: string;
}

export const obtenerPerfil = async (): Promise<Perfil> => {
  const response = await api.get<Perfil>("/perfil");
  return response.data;
};

export const actualizarPerfil = async (
  data: PerfilUpdateRequest,
): Promise<Perfil> => {
  const response = await api.put<Perfil>("/perfil", data);
  return response.data;
};