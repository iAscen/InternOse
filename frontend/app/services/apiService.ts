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

// Types pour les offres de stage
export interface InternshipOffer {
  id?: number;
  jobTitle: string;
  taskDescription: string;
  qualifications: string;
  duration: number;
  startDate: string;
  endDate: string;
  salary: number;
  address: string;
  validee?: boolean;
}

export interface CreateInternshipOfferRequest {
  jobTitle: string;
  taskDescription: string;
  qualifications: string;
  duration: number;
  startDate: string;
  endDate: string;
  salary: number;
  address: string;
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
    if (typeof window === 'undefined') return;
    localStorage.setItem('jwt_token', token);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('jwt_token');
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return this.getToken() !== null;
  }

  // Gestion du rôle utilisateur
  saveUserRole(role: 'STUDENT' | 'EMPLOYER'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_role', role);
  }

  getUserRole(): 'STUDENT' | 'EMPLOYER' | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_role') as 'STUDENT' | 'EMPLOYER' | null;
  }

  // Récupérer l'email depuis le JWT (décodage simple)
  getUserEmail(): string | null {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) return null;
    
    try {
      // Décodage simple du JWT (partie payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.sub || decoded.email || null;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT:', error);
      return null;
    }
  }

  // Récupérer le rôle utilisateur depuis le JWT
  getUserRoleFromJWT(): 'STUDENT' | 'EMPLOYER' | null {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) return null;
    
    try {
      // Décodage simple du JWT (partie payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      // Le backend stocke les autorités dans le claim "authorities"
      const authorities = decoded.authorities;
      if (authorities && Array.isArray(authorities) && authorities.length > 0) {
        const role = authorities[0].authority || authorities[0];
        if (role === 'STUDENT' || role === 'EMPLOYER') {
          return role;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT pour le rôle:', error);
      return null;
    }
  }

  // Méthode pour déterminer le rôle utilisateur basé sur l'email (fallback)
  async determineUserRole(email: string): Promise<'STUDENT' | 'EMPLOYER' | null> {
    try {
      // Essayer d'abord de récupérer le rôle depuis le JWT
      const roleFromJWT = this.getUserRoleFromJWT();
      if (roleFromJWT) {
        return roleFromJWT;
      }

      // Si pas de JWT ou rôle non trouvé, utiliser la logique de fallback basée sur l'email
      const studentPatterns = [
        '@student', '@etudiant', '@univ', '@college', '@edu', 
        '@university', '@school', '@campus', '@academic'
      ];
      
      const employerPatterns = [
        '@company', '@entreprise', '@corp', '@business', 
        '@org', '@firm', '@agency'
      ];
      
      const emailLower = email.toLowerCase();
      
      // Vérifier les patterns employeurs en premier (plus spécifiques)
      for (const pattern of employerPatterns) {
        if (emailLower.includes(pattern)) {
          return 'EMPLOYER';
        }
      }
      
      // Vérifier les patterns étudiants
      for (const pattern of studentPatterns) {
        if (emailLower.includes(pattern)) {
          return 'STUDENT';
        }
      }
      
      // Si aucun pattern trouvé, ne pas deviner - retourner null
      return null;
    } catch (error) {
      return null;
    }
  }

  // Méthodes pour les offres de stage
  async getInternshipOffers(): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const response = await fetch(`${API_BASE_URL}/employer/internship-offers`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const offers = await response.json();
        return {
          success: true,
          data: offers,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Erreur lors du chargement des offres',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async createInternshipOffer(offerData: CreateInternshipOfferRequest): Promise<ApiResponse<string>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const response = await fetch(`${API_BASE_URL}/employer/internship-offers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerData),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          data: result.message || 'Offre créée avec succès',
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Erreur lors de la création de l\'offre',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
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
