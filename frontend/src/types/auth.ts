export interface User {
  userId: string;
  email: string;
  role: 'MEMBER' | 'PERSONAL_TRAINER' | 'ADMIN' | 'OWNER';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}