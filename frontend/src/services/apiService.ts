// Service API basé sur les vrais contrôleurs du backend
import type {
  LoginRequest,
  StudentRegistrationRequest,
  EmployerRegistrationRequest,
  InternshipOffer,
  CreateInternshipOfferRequest,
  ErrorResponseDTO,
  ApiResponse,
  Cv
} from '~/interfaces';
import {ErrorService} from './errorService';

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
  saveUserRole(role: 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER'): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_role', role);
  }

  getUserRole(): 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_role') as 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | null;
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

  // Récupérer l'ID de l'étudiant depuis le JWT
  async getStudentIdFromJWT(): Promise<number | null> {
    if (typeof window === 'undefined') return null;
    const token = this.getToken();
    if (!token) return null;

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
  getUserRoleFromJWT(): 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | null {
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
        if (role === 'EMPLOYER' || role === 'STUDENT' || role === 'INTERNSHIP_MANAGER') {
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
  async determineUserRole(email: string): Promise<"EMPLOYER" | "STUDENT" | "INTERNSHIP_MANAGER" | null> {
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

      // Si aucun pattern trouvé, ne pas deviner - retourner null
      return null;
    } catch (error) {
      return null;
    }
  }

  // Méthodes pour les CV des étudiants
  async uploadCV(file: File): Promise<ApiResponse<string>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Récupérer l'ID de l'étudiant depuis le JWT
      const studentId = await this.getStudentIdFromJWT();
      if (!studentId) {
        return {
          success: false,
          error: 'Impossible de récupérer l\'ID de l\'étudiant',
        };
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('studentID', studentId.toString());

      const response = await fetch(`${API_BASE_URL}/student/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          data: result.message || 'CV téléversé avec succès',
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Erreur lors du téléversement du CV',
        };
      }
    } catch (error) {
      console.error('Erreur lors du téléversement du CV:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async getCVStatus(): Promise<ApiResponse<{
    status: string;
    fileName: string;
    uploadedAt: string;
    validatedAt: string;
    rejectionReason: string
  }>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Récupérer l'ID de l'étudiant depuis le JWT
      const studentId = await this.getStudentIdFromJWT();
      if (!studentId) {
        return {
          success: false,
          error: 'Impossible de récupérer l\'ID de l\'étudiant',
        };
      }

      const response = await fetch(`${API_BASE_URL}/student/resume/status?studentID=${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 CV status response:', result);
        return {
          success: true,
          data: {
            status: result.verificationStatus || 'none',
            fileName: result.resumeFileName || '',
            uploadedAt: result.upload_date || '',
            validatedAt: result.verifyDate || '',
            rejectionReason: result.rejectionReason || ''
          },
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Erreur lors de la récupération du statut du CV',
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du statut du CV:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async StudentGetInternshipOffers(studentId: number | null, sortBy?: string, filterBy?: string[]): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const response = await fetch(`${API_BASE_URL}/student/internship-offers?studentID=${studentId}`, {
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
        }
      }
    }
    catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async StudentGetAllInternshipOffers(sortBy?: string, filterBy?: string[]): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Récupérer l'ID de l'étudiant depuis le JWT
      const studentId = await this.getStudentIdFromJWT();
      if (!studentId) {
        return {
          success: false,
          error: 'Impossible de récupérer l\'ID de l\'étudiant',
        };
      }

      // Extraire les paramètres de recherche du tableau filterBy
      const program = filterBy ? filterBy[0] : null;
      const location = filterBy ? filterBy[1] : null;
      const jobTitle = filterBy ? filterBy[2] : null;
      const company = filterBy ? filterBy[3] : null;
      const minSalary = filterBy ? filterBy[4] : null;
      const maxSalary = filterBy ? filterBy[5] : null;
      const minDuration = filterBy ? filterBy[6] : null;
      const maxDuration = filterBy ? filterBy[7] : null;
      const startDateFrom = filterBy ? filterBy[8] : null;
      const startDateTo = filterBy ? filterBy[9] : null;
      const sortOrder = filterBy ? filterBy[10] : null;
      const page = filterBy ? filterBy[11] : null;
      const size = filterBy ? filterBy[12] : null;

      // Construire les paramètres de requête
      const params = new URLSearchParams();
      params.append('studentID', studentId.toString());
      if (sortBy) params.append('sortBy', sortBy);
      if (program) params.append('program', program);
      if (location) params.append('location', location);
      if (jobTitle) params.append('jobTitle', jobTitle);
      if (company) params.append('company', company);
      if (minSalary && !isNaN(Number(minSalary))) params.append('minSalary', minSalary);
      if (maxSalary && !isNaN(Number(maxSalary))) params.append('maxSalary', maxSalary);
      if (minDuration && !isNaN(Number(minDuration))) params.append('minDuration', minDuration);
      if (maxDuration && !isNaN(Number(maxDuration))) params.append('maxDuration', maxDuration);
      if (startDateFrom) params.append('startDateFrom', startDateFrom);
      if (startDateTo) params.append('startDateTo', startDateTo);
      if (sortOrder) params.append('sortOrder', sortOrder);
      if (page && !isNaN(Number(page))) params.append('page', page);
      if (size && !isNaN(Number(size))) params.append('size', size);

      const response = await fetch(`${API_BASE_URL}/student/internship-offers/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Search response received from backend:', data);
        return {
          success: true,
          data: data.offers,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || errorData.error || 'Erreur lors de la recherche des offres',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  // Méthodes pour les CV
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

  async getAllInternshipOffers(sortBy?: string, filterBy?: string[]): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const status = filterBy ? filterBy[0] : null;
      const program = filterBy ? filterBy[1] : null;
      const title = filterBy ? filterBy[2] : null;

      // Construire les paramètres de requête
      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (status) {
        const valid = status.toLowerCase() === 'true' || status.toLowerCase() === 'validated' || status.toLowerCase() === 'approuvé';
        params.append('valid', valid.toString());
      }
      if (program) params.append('program', program);
      if (title) params.append('title', title);

      const response = await fetch(`${API_BASE_URL}/internship-manager/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const offers = await response.json();
        console.log('🔍 Offers received from backend:', offers);
        console.log('🔍 First offer details:', offers[0]);
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

  async getAllCvs(sortBy?: string, filterBy?: string[], sortOrder?: string): Promise<ApiResponse<Cv[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const status = filterBy ? filterBy[0] : null;
      const program = filterBy ? filterBy[1] : null;
      const institution = filterBy ? filterBy[2] : null;

      // Construire les paramètres de requête
      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder)
      if (status) params.append('status', status)
      if (program) params.append('program', program);
      if (institution) params.append('institution', institution);

      const response = await fetch(`${API_BASE_URL}/internship-manager/students/cvs?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const body = await response.json();
        const cvs = body.data.map((cv: any) => ({
          studentId: cv.studentID,
          firstName: cv.firstName,
          lastName: cv.lastName,
          email: cv.email,
          cvStatus: cv.resumeVerificationStatus || 'pending', // Map resumeVerificationStatus to cvStatus
          cvFileName: cv.resumeFileName || '',
          cvFileType: 'pdf', // Default to PDF
          uploadedAt: cv.resumeUploadDate || '',
          validatedAt: cv.resumeVerifiedDate || '',
          rejectionReason: cv.resumeRejectionReason || ''
        }));
        return {
          success: true,
          data: cvs,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Erreur lors du chargement des offres',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async getCvDetails(studentId: number): Promise<ApiResponse<Cv>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const response = await fetch(`${API_BASE_URL}/internship-manager/students/${studentId}/cv`, {
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
          data: body.data,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Erreur lors de la recuperation du cv',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async getCvBlob(studentId: Number): Promise<ApiResponse<Blob>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const response = await fetch(`${API_BASE_URL}/internship-manager/students/${studentId}/cv/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const bytes = await response.blob()

        return {
          success: true,
          data: bytes
        }
      } else {
        return {
          success: false,
          error: "Erreur lors de la recuperation du cv"
        }
      }
    } catch (error) {
      return {
        success: false,
        error: "Erreur de connexion au server"
      }
    }
  }

  // Méthode pour valider/refuser une offre de stage (gestionnaire de stages)
  async validateInternshipOffer(offerId: number, approved: boolean, comment?: string): Promise<ApiResponse<string>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Construire les paramètres de requête
      const params = new URLSearchParams();
      params.append('offerId', offerId.toString());
      params.append('approved', approved.toString());
      if (comment && comment.trim()) {
        params.append('comment', comment.trim());
      }

      const url = `${API_BASE_URL}/internship-manager/verify?${params.toString()}`;
      console.log('🔍 Validation URL:', url);
      console.log('🔍 Params:', {offerId, approved, comment});

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const responseText = await response.text();
        console.log('🔍 Response body:', responseText);
        return {
          success: true,
          data: approved ? 'Offre approuvée avec succès' : 'Offre refusée avec succès',
        };
      } else {
        let errorMessage = 'Erreur lors de la validation de l\'offre';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('🔍 Error data:', errorData);
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.log('🔍 Error text:', errorText);
        }
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('🔍 Network error:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async validateCv(studentId: number, approved: boolean, comment?: string): Promise<ApiResponse<string>> {

    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Construire les paramètres de requête
      const params = new URLSearchParams();
      params.append('studentID', studentId.toString());
      params.append('approved', approved.toString());
      if (comment && comment.trim()) {
        params.append('reason', comment.trim());
      }
      //             /api/internship-manager/students/{studentId}/cv/validate
      const url = `${API_BASE_URL}/internship-manager/students/${studentId}/cv/validate?${params.toString()}`;
      console.log('🔍 Validation URL:', url);
      console.log('🔍 Params:', {cvId: studentId, approved, comment});

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const responseText = await response.text();
        console.log('🔍 Response body:', responseText);
        return {
          success: true,
          data: approved ? 'CV approuvée avec succès' : 'CV refusée avec succès',
        };
      } else {
        let errorMessage = 'Erreur lors de la validation du CV';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('🔍 Error data:', errorData);
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
          console.log('🔍 Error text:', errorText);
        }
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('🔍 Network error:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }
}

export const apiService = new ApiService();
