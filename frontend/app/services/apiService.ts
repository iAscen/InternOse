// Service API basé sur les vrais contrôleurs du backend
import type { 
  LoginRequest, 
  StudentRegistrationRequest, 
  EmployerRegistrationRequest,
  InternshipOffer,
  CreateInternshipOfferRequest,
  ErrorResponseDTO,
  ApiResponse
} from '../interfaces';
import { ErrorService } from './errorService';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
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
            error: ErrorService.getUserFriendlyMessage(response.status, errorResponse.message),
          };
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut
          const errorText = await response.text();
          return {
            success: false,
            error: ErrorService.getUserFriendlyMessage(response.status, errorText),
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
            error: ErrorService.getUserFriendlyMessage(response.status, errorResponse.message),
          };
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut
          const errorText = await response.text();
          return {
            success: false,
            error: ErrorService.getUserFriendlyMessage(response.status, errorText),
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
            error: ErrorService.getUserFriendlyMessage(response.status, errorResponse.message),
          };
        } catch {
          // Si ce n'est pas du JSON, utiliser le texte brut
          const errorText = await response.text();
          return {
            success: false,
            error: ErrorService.getUserFriendlyMessage(response.status, errorText),
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

  // Récupérer l'ID de l'employeur depuis le JWT
  async getEmployerIdFromJWT(): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) return null;
    
    try {
      // Décodage simple du JWT (partie payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      
      console.log('🔍 Contenu du JWT:', decoded);
      
      // Chercher l'ID utilisateur dans le JWT (userId contient l'ID de l'employeur)
      const userId = decoded.userId || decoded.id || decoded.employerId || decoded.employer_id;
      
      if (userId) {
        console.log(`✅ ID utilisateur trouvé dans le JWT: ${userId} (type: ${typeof userId})`);
        return Number(userId);
      }
      
      // Fallback : utiliser l'ID 1 pour tous les employeurs (solution temporaire)
      const email = decoded.sub || decoded.email;
      if (email) {
        console.warn(`⚠️ Aucun ID utilisateur dans le JWT. Utilisation de l'ID 1 pour tous les employeurs (${email})`);
        return 1;
      }
      
      console.error('❌ Aucun email trouvé dans le JWT');
      return null;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT pour l\'ID employeur:', error);
      return null;
    }
  }

  // Générer un ID unique basé sur l'email (solution temporaire)
  private generateUniqueIdFromEmail(email: string): number {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      const char = email.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    // Retourner un ID entre 1 et 9999 pour éviter les conflits
    return Math.abs(hash) % 9999 + 1;
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

      // Récupérer l'ID de l'employeur depuis le JWT
      const employerId = await this.getEmployerIdFromJWT();
      if (!employerId) {
        return {
          success: false,
          error: 'Impossible de récupérer l\'ID de l\'employeur. Vérifiez que le JWT contient l\'ID ou que l\'endpoint getEmployerIdByEmail est implémenté.',
        };
      }

      const response = await fetch(`${API_BASE_URL}/employer/internship-offers?employerID=${employerId}`, {
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

      // Récupérer l'ID de l'employeur depuis le JWT
      const employerId = await this.getEmployerIdFromJWT();
      if (!employerId) {
        return {
          success: false,
          error: 'Impossible de récupérer l\'ID de l\'employeur. Vérifiez que le JWT contient l\'ID ou que l\'endpoint getEmployerIdByEmail est implémenté.',
        };
      }

      // Envoyer l'ID de l'employeur comme paramètre de requête (pas dans le body)
      const response = await fetch(`${API_BASE_URL}/employer/internship-offers?employerID=${employerId}`, {
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
