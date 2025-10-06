// Interfaces pour l'authentification
export interface LoginRequest {
  email: string;
  password: string;
}

export interface StudentRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT';
}

export interface EmployerRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'EMPLOYER';
  enterprise: string;
}

export interface ErrorResponseDTO {
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
