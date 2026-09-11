export interface LoginRequest {
  codigo: string;
  contrasena: string;
}

export interface LoginResponse {
  codigo: string;
  nombres: string;
  apellidos: string;
  rol: string;
  token: string;
}