// Service API basé sur les vrais contrôleurs du backend
const API_BASE_URL = 'http://localhost:8080/api';

// Types basés sur les DTOs du backend
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

// Type pour les réponses d'erreur du GlobalExceptionManager
export interface ErrorResponseDTO {
  message: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  // Méthode pour convertir les erreurs techniques en messages conviviaux
  private getUserFriendlyErrorMessage(status: number, technicalMessage: string): string {
    // Erreurs de connexion - basées sur les vraies exceptions du backend
    if (status === 401 || status === 403 || status === 404 || status === 500) {
      if (technicalMessage === 'userNotFound' || technicalMessage.includes('userNotFound')) {
        return 'Aucun compte trouvé avec cet email. Vérifiez votre adresse email ou créez un compte.';
      }
      if (technicalMessage === 'Incorrect username or password' || technicalMessage.includes('Incorrect username or password')) {
        return 'Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
      }
      if (technicalMessage.includes('token') || technicalMessage.includes('jwt') || technicalMessage.includes('Token')) {
        return 'Session expirée. Veuillez vous reconnecter.';
      }
      return 'Email ou mot de passe incorrect.';
    }
    
    // Erreurs d'inscription - email déjà utilisé
    if (status === 409) {
      if (technicalMessage.includes('existe déjà') || technicalMessage.includes('already exists') || technicalMessage.includes('L\'utilisateur avec l\'email')) {
        return 'Un compte avec cet email existe déjà. Essayez de vous connecter ou utilisez un autre email.';
      }
      return 'Cet email est déjà utilisé.';
    }
    
    // Erreurs de validation (400)
    if (status === 400) {
      // Erreurs de mot de passe spécifiques
      if (technicalMessage.includes('Le mot de passe doit contenir au moins 8 caractères')) {
        return 'Le mot de passe doit contenir au moins 8 caractères.';
      }
      if (technicalMessage.includes('Le mot de passe doit contenir au moins une lettre majuscule')) {
        return 'Le mot de passe doit contenir au moins une lettre majuscule.';
      }
      if (technicalMessage.includes('Le mot de passe doit contenir au moins un chiffre')) {
        return 'Le mot de passe doit contenir au moins un chiffre.';
      }
      if (technicalMessage.includes('Le mot de passe doit contenir au moins un caractère spécial')) {
        return 'Le mot de passe doit contenir au moins un caractère spécial.';
      }
      if (technicalMessage.includes('Il y a des champs manquants')) {
        return 'Veuillez remplir tous les champs obligatoires.';
      }
      if (technicalMessage.includes('mot de passe') || technicalMessage.includes('password') || technicalMessage.includes('Le mot de passe doit')) {
        return 'Le mot de passe ne respecte pas les critères requis.';
      }
      if (technicalMessage.includes('champ requis') || technicalMessage.includes('required')) {
        return 'Veuillez remplir tous les champs obligatoires.';
      }
      return 'Les informations fournies ne sont pas valides.';
    }
    
    // Erreurs serveur
    if (status >= 500) {
      return 'Une erreur technique s\'est produite. Veuillez réessayer dans quelques instants.';
    }
    
    // Erreur par défaut
    return 'Une erreur s\'est produite. Veuillez réessayer.';
  }

  // Méthode de connexion - correspond à AuthController.login()
  async login(loginData: LoginRequest): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        const jwt = await response.text(); // Le backend retourne directement le JWT en string
        return {
          success: true,
          data: jwt,
        };
      } else {
        // Gestion des erreurs du GlobalExceptionManager
        try {
          const errorResponse: ErrorResponseDTO = await response.json();
          return {
            success: false,
            error: this.getUserFriendlyErrorMessage(response.status, errorResponse.message),
          };
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut
          const errorText = await response.text();
          return {
            success: false,
            error: this.getUserFriendlyErrorMessage(response.status, errorText),
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      };
    }
  }

  // Méthode d'inscription étudiant - correspond à AuthController.registerStudent()
  async registerStudent(studentData: StudentRegistrationRequest): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/students/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      if (response.ok) {
        const jwt = await response.text(); // Le backend retourne directement le JWT en string
        return {
          success: true,
          data: jwt,
        };
      } else {
        // Gestion des erreurs du GlobalExceptionManager
        try {
          const errorResponse: ErrorResponseDTO = await response.json();
          return {
            success: false,
            error: this.getUserFriendlyErrorMessage(response.status, errorResponse.message),
          };
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut
          const errorText = await response.text();
          return {
            success: false,
            error: this.getUserFriendlyErrorMessage(response.status, errorText),
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      };
    }
  }

  // Méthode d'inscription employeur - correspond à AuthController.registerEmployer()
  async registerEmployer(employerData: EmployerRegistrationRequest): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/employers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(employerData),
      });

      if (response.ok) {
        const jwt = await response.text(); // Le backend retourne directement le JWT en string
        return {
          success: true,
          data: jwt,
        };
      } else {
        // Gestion des erreurs du GlobalExceptionManager
        try {
          const errorResponse: ErrorResponseDTO = await response.json();
          return {
            success: false,
            error: this.getUserFriendlyErrorMessage(response.status, errorResponse.message),
          };
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut
          const errorText = await response.text();
          return {
            success: false,
            error: this.getUserFriendlyErrorMessage(response.status, errorText),
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
      };
    }
  }

  // Gestion du token JWT
  saveToken(token: string): void {
    localStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  removeToken(): void {
    localStorage.removeItem('jwt_token');
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  // Vérification de la santé du serveur
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test', password: 'test' }),
      });
      return true; // Si on arrive ici, le serveur répond
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService();
