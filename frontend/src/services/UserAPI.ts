// Service API pour l'authentification et la gestion des utilisateurs
import type {
  LoginRequest,
  StudentRegistrationRequest,
  EmployerRegistrationRequest,
  ErrorResponseDTO,
  ApiResponse,
  Notification
} from '~/interfaces';
import {ErrorService} from './errorService';
import { API_PATHS, buildFullApiUrl } from '~/constants/apiPaths';

class UserAPI {
  // Méthode de connexion - correspond à AuthController.login()
  async login(loginData: LoginRequest): Promise<ApiResponse<string>> {
    try {
      const response = await fetch(buildFullApiUrl(API_PATHS.AUTH.LOGIN), {
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
      const response = await fetch(buildFullApiUrl(API_PATHS.AUTH.STUDENT_REGISTER), {
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
      const response = await fetch(buildFullApiUrl(API_PATHS.AUTH.EMPLOYER_REGISTER), {
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
  saveUserRole(role: 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | 'PROFESSOR'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_role', role);
  }

  getUserRole(): 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | 'PROFESSOR' | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_role') as 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | 'PROFESSOR' | null;
  }

  // Récupérer le nom complet de l'utilisateur depuis le JWT (décodage simple)
  getUserName(): string | null {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) return null;

    try {
      // Décodage simple du JWT (partie payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      const firstName = decoded.firstName;
      const lastName = decoded.lastName;
      return `${firstName} ${lastName}`;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT:', error);
      return null;
    }
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
  async getInternshipManagerIdFromJWT(): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }

    try {
      // Décodage simple du JWT (partie payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      console.log('🔍 Contenu du JWT:', decoded);

      // Chercher l'ID utilisateur dans le JWT (userId contient l'ID de l'employeur)
      const userId = decoded.userId || decoded.id || decoded.internshipManagerId || decoded.internshipManager_id;
      
      if (userId) {
        console.log(`✅ ID utilisateur trouvé dans le JWT: ${userId} (type: ${typeof userId})`);
        return Number(userId);
      }

      // Fallback : utiliser l'ID 1 pour tous les employeurs (solution temporaire)
      const email = decoded.sub || decoded.email;
      if (email) {
        console.warn(`⚠️ Aucun ID utilisateur dans le JWT. Utilisation de l'ID 1 pour tous les gestionnaires (${email})`);
        return 1;
      }

      console.error('❌ Aucun email trouvé dans le JWT');
      return null;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT pour l\'ID gestionnaire:', error);
      return null;
    }
  }

  // Récupérer l'ID de l'employeur depuis le JWT
  async getProfessorIdFromJWT(): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }

    try {
      // Décodage simple du JWT (partie payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      console.log('🔍 Contenu du JWT:', decoded);

      // Chercher l'ID utilisateur dans le JWT (userId contient l'ID de l'employeur)
      const userId = decoded.userId || decoded.id || decoded.professorId || decoded.professor_id;

      if (userId) {
        console.log(`✅ ID utilisateur trouvé dans le JWT: ${userId} (type: ${typeof userId})`);
        return Number(userId);
      }

      // Fallback : utiliser l'ID 1 pour tous les employeurs (solution temporaire)
      const email = decoded.sub || decoded.email;
      if (email) {
        console.warn(`⚠️ Aucun ID utilisateur dans le JWT. Utilisation de l'ID 1 pour tous les professeurs (${email})`);
        return 1;
      }

      console.error('❌ Aucun email trouvé dans le JWT');
      return null;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT pour l\'ID professeur:', error);
      return null;
    }
  }

  // Récupérer l'ID de l'employeur depuis le JWT
  async getEmployerIdFromJWT(): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }

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

  // Récupérer l'ID de l'étudiant depuis le JWT
  async getStudentIdFromJWT(): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }

    try {
      // Décodage simple du JWT (partie payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));

      console.log('🔍 Contenu du JWT pour étudiant:', decoded);

      // Chercher l'ID utilisateur dans le JWT (userId contient l'ID de l'étudiant)
      const userId = decoded.userId || decoded.id || decoded.studentId || decoded.student_id;

      if (userId) {
        console.log(`✅ ID étudiant trouvé dans le JWT: ${userId} (type: ${typeof userId})`);
        return Number(userId);
      }

      // Fallback : utiliser l'ID 1 pour tous les étudiants (solution temporaire)
      const email = decoded.sub || decoded.email;
      if (email) {
        console.warn(`⚠️ Aucun ID utilisateur dans le JWT. Utilisation de l'ID 1 pour tous les étudiants (${email})`);
        return 1;
      }

      console.error('❌ Aucun email trouvé dans le JWT');
      return null;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT pour l\'ID étudiant:', error);
      return null;
    }
  }

  
  // Récupérer le rôle utilisateur depuis le JWT
  getUserRoleFromJWT(): 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | 'PROFESSOR' | null {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) {
      console.log('No token found');
      return null;
    }

    try {
      // Décodage simple du JWT (partie payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log('Decoded JWT payload:', decoded);

      // Le backend stocke les autorités dans le claim "authorities"
      const authorities = decoded.authorities;
      console.log('Authorities from JWT:', authorities);
      
      if (authorities && Array.isArray(authorities) && authorities.length > 0) {
        console.log('First authority:', authorities[0]);
        const role = authorities[0].authority || authorities[0];
        console.log('Extracted role:', role);
        
        // Handle case where role might be just a string
        let roleString = typeof role === 'string' ? role : (role?.authority || role);
        console.log('Role string:', roleString);
        
        // Extract the actual role from the Java enum toString format
        // Format: "UserRole.INTERNSHIP_MANAGER(userRole=INTERNSHIP_MANAGER)"
        if (typeof roleString === 'string') {
          // Try to extract the role from patterns like:
          // 1. "UserRole.INTERNSHIP_MANAGER(userRole=INTERNSHIP_MANAGER)"
          // 2. Just "INTERNSHIP_MANAGER"
          const match = roleString.match(/=(EMPLOYER|STUDENT|INTERNSHIP_MANAGER|PROFESSOR)\)/);
          if (match && match[1]) {
            roleString = match[1];
            console.log('Extracted role from enum:', roleString);
          }
        }
        
        if (roleString === 'EMPLOYER' || roleString === 'STUDENT' || roleString === 'INTERNSHIP_MANAGER' || roleString === 'PROFESSOR') {
          return roleString as 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | 'PROFESSOR';
        }
      }

      console.log('No valid role found in JWT');
      return null;
    } catch (error) {
      console.error('Erreur lors du décodage du JWT pour le rôle:', error);
      return null;
    }
  }

  // Méthode pour déterminer le rôle utilisateur basé sur l'email (fallback)
  async determineUserRole(email: string): Promise<"EMPLOYER" | "STUDENT" | "INTERNSHIP_MANAGER" | 'PROFESSOR' | null> {
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

      const managerPatterns = [
        '@manager', '@gestionnaire', '@admin', '@stage'
      ];

      const professorPatterns = [
        '@prof', '@professeur', '@teacher', '@teach'
      ];

      const emailLower = email.toLowerCase();

      // Vérifier les patterns gestionnaires en premier (plus spécifiques)
      for (const pattern of managerPatterns) {
        if (emailLower.includes(pattern)) {
          return 'INTERNSHIP_MANAGER';
        }
      }

      // Vérifier les patterns employeurs
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

      // Vérifier les patterns professeurs
      for (const pattern of professorPatterns) {
        if (emailLower.includes(pattern)) {
          return 'PROFESSOR';
        }
      }

      // Si aucun pattern trouvé, ne pas deviner - retourner null
      return null;
    } catch (error) {
      return null;
    }
  }

  async setSession(userId: number, session: string): Promise<ApiResponse<string>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Non authentifié. Veuillez vous reconnecter.',
        };
      }

      const response = await fetch(buildFullApiUrl(API_PATHS.AUTH.SET_SESSION_PATH), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id: userId, session }),
      });

      if (response.ok) {
        const sessionData = await response.text();
        return {
          success: true,
          data: sessionData,
        };
      } else {
        try {
          const errorResponse: ErrorResponseDTO = await response.json();
          return {
            success: false,
            error: ErrorService.getUserFriendlyMessage(response.status, errorResponse.message),
          };
        } catch {
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

  async getNotifications(userID: number): Promise<ApiResponse<Notification[]>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      let url = buildFullApiUrl(API_PATHS.USER.NOTIFICATIONS)
      url = url.replace("{userID}", String(userID))

      console.log('URL: ' + url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const body = await response.json();
        return {
          success: true,
          data: body,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Erreur lors de la recuperation des notifications',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async checkNotification(notificationID: number): Promise<ApiResponse<any>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      let url = buildFullApiUrl(API_PATHS.USER.CHECK_NOTIFICATION)
      url = url.replace("{notificationID}", String(notificationID))

      console.log('URL: ' + url)

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        //const body = await response.json();
        return {
          success: true,
          //data: body,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Erreur lors de la supprimation de la notification',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }
}

export const userAPI = new UserAPI();
