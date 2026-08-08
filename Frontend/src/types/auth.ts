export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  correo: string;
  password: string;
  idioma?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}
