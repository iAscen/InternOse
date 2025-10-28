// Service API basé sur les vrais contrôleurs du backend
import type {
  LoginRequest,
  StudentRegistrationRequest,
  EmployerRegistrationRequest,
  InternshipOffer,
  CreateInternshipOfferRequest,
  ErrorResponseDTO,
  ApiResponse,
  Cv,
  CreateInterviewInvitationRequest,
  InterviewInvitation
} from '~/interfaces';
import {ErrorService} from './errorService';
import { API_PATHS, buildFullApiUrl } from '~/constants/apiPaths';

class ApiService {
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
          const match = roleString.match(/=(EMPLOYER|STUDENT|INTERNSHIP_MANAGER)\)/);
          if (match && match[1]) {
            roleString = match[1];
            console.log('Extracted role from enum:', roleString);
          }
        }
        
        if (roleString === 'EMPLOYER' || roleString === 'STUDENT' || roleString === 'INTERNSHIP_MANAGER') {
          return roleString as 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER';
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
      formData.append('resumeFile', file);
      formData.append('studentID', studentId.toString());

      console.log('🔍 Uploading CV with FormData:', {
        studentID: studentId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      const url = buildFullApiUrl(API_PATHS.STUDENT.RESUME);
      console.log('🔍 Uploading CV to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          data: result.message || 'CV téléversé avec succès',
        };
      } else {
        // Try to parse as JSON, fall back to text if it fails
        let errorMessage = 'Erreur lors du téléversement du CV';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, read as text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        return {
          success: false,
          error: errorMessage,
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

      const response = await fetch(buildFullApiUrl(API_PATHS.STUDENT.RESUME_STATUS) + `?studentID=${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 CV status response:', result);
        
        // Handle both string response and object response
        let status = 'none';
        if (typeof result === 'string') {
          status = result.toLowerCase();
        } else if (result && result.verificationStatus) {
          status = result.verificationStatus.toLowerCase();
        }
        
        return {
          success: true,
          data: {
            status: status,
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

      const response = await fetch(buildFullApiUrl(API_PATHS.STUDENT.INTERNSHIP_OFFERS) + `?studentID=${studentId}`, {
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

  async StudentGetAllInternshipOffers(): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Get student ID from JWT
      const studentId = await this.getStudentIdFromJWT();
      if (!studentId) {
        return {
          success: false,
          error: 'Impossible de récupérer l\'ID de l\'étudiant',
        };
      }

      // Fetch all offers with studentID parameter
      const url = buildFullApiUrl(API_PATHS.STUDENT.SEARCH_INTERNSHIP_OFFERS) + `?studentID=${studentId}`;
      console.log('🔍 Fetching internship offers from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Internship offers response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Internship offers data:', data);
        return {
          success: true,
          data: data.offers || data, // L'endpoint simple retourne directement les offres
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

      const response = await fetch(buildFullApiUrl(API_PATHS.EMPLOYER.INTERNSHIP_OFFERS) + `?employerID=${employerId}`, {
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

  async getAllInternshipOffers(): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // No query parameters - fetch all offers
      const response = await fetch(buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.SEARCH), {
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
      const response = await fetch(buildFullApiUrl(API_PATHS.EMPLOYER.INTERNSHIP_OFFERS) + `?employerID=${employerId}`, {
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

  async getAllCvs(): Promise<ApiResponse<Cv[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // No query parameters - fetch all CVs
      const url = buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.STUDENTS_CVS);
      console.log('🔍 Fetching CVs from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 CVs response status:', response.status);
      
      if (response.ok) {
        const body = await response.json();
        console.log('🔍 CVs response data:', body);
        // Backend returns the data directly, not wrapped in a data property
        const cvs = body.map((cv: any) => ({
          id: cv.id || cv.studentId || cv.studentID, // Try different possible field names
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

      const response = await fetch(buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.RESUME, { studentID: String(studentId) }), {
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

      const response = await fetch(buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.DOWNLOAD_RESUME, { studentID: String(studentId) }), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Check if the response is JSON (Base64) or raw blob
        const contentType = response.headers.get('content-type');
        console.log('🔍 CV download content-type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          // Backend returns JSON with Base64 encoded data
          const jsonData = await response.json();
          console.log('🔍 CV download JSON response:', jsonData);
          
          // The backend might return the bytes as an array or base64 string
          let base64String;
          if (typeof jsonData === 'string') {
            base64String = jsonData;
          } else if (jsonData && Array.isArray(jsonData)) {
            // Backend returns base64 as last element in array
            base64String = jsonData[jsonData.length - 1];
          } else if (jsonData && jsonData.data) {
            base64String = jsonData.data;
          } else {
            throw new Error('Invalid response format from server');
          }
          
          // Convert base64 to blob
          const binaryString = atob(base64String);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          
          return {
            success: true,
            data: blob
          };
        } else {
          // Backend returns raw PDF blob
          const blob = await response.blob();
          console.log('🔍 Blob details:', {
            type: blob.type,
            size: blob.size,
            first100Bytes: await blob.slice(0, 100).text()
          });
          return {
            success: true,
            data: blob
          };
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
      params.append('internshipOfferID', offerId.toString());
      params.append('isApproved', approved.toString());
      if (comment && comment.trim()) {
        params.append('comment', comment.trim());
      }

      const url = buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.VERIFY_OFFER) + `?${params.toString()}`;
      console.log('🔍 Validation URL:', url);
      console.log('🔍 Params:', {internshipOfferID: offerId, isApproved: approved, comment});

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
        // Try to read response, but don't fail if it's not valid
        try {
          const responseText = await response.text();
          console.log('🔍 Response body:', responseText);
        } catch (err) {
          console.log('🔍 Could not read response body');
        }
        return {
          success: true,
          data: approved ? 'Offre approuvée avec succès' : 'Offre refusée avec succès',
        };
      } else {
        // Try to parse error response - use response.clone() to avoid consuming the stream
        let errorMessage = 'Erreur lors de la validation de l\'offre';
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('🔍 Error data:', errorData);
        } catch (parseError) {
          // If JSON parsing fails, try to read as text
          try {
            const clonedResponse = response.clone();
            const errorText = await clonedResponse.text();
            errorMessage = errorText || errorMessage;
            console.log('🔍 Error text:', errorText);
          } catch (textError) {
            console.log('🔍 Cannot read error response');
          }
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
      params.append('isApproved', approved.toString());
      if (comment && comment.trim()) {
        params.append('rejectionReason', comment.trim());
      }
      //             /api/internship-manager/students/{studentId}/cv/validate
      const url = buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.VERIFY_RESUME, { studentID: String(studentId) }) + `?${params.toString()}`;
      console.log('🔍 Validation URL:', url);
      console.log('🔍 Params:', {studentId, isApproved: approved, rejectionReason: comment});

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
        // Try to read response, but don't fail if it's not valid JSON
        try {
          const responseText = await response.text();
          console.log('🔍 Response body:', responseText);
        } catch (err) {
          console.log('🔍 Could not read response body');
        }
        return {
          success: true,
          data: approved ? 'CV approuvée avec succès' : 'CV refusée avec succès',
        };
      } else {
        // Try to parse error response - use response.clone() to avoid consuming the stream
        let errorMessage = 'Erreur lors de la validation du CV';
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('🔍 Error data:', errorData);
        } catch (parseError) {
          // If JSON parsing fails, try to read as text
          try {
            const clonedResponse = response.clone();
            const errorText = await clonedResponse.text();
            errorMessage = errorText || errorMessage;
            console.log('🔍 Error text:', errorText);
          } catch (textError) {
            console.log('🔍 Cannot read error response');
          }
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

  // ========================================
  // MÉTHODES POUR LES CANDIDATURES D'ÉTUDIANTS
  // ========================================

  // Récupérer les candidatures pour une offre de stage
  async getStudentApplicationsBy(internshipId: number, applicationStatus: string | null, 
                                  program: string | null, institution: string | null, sortBy: string | null): Promise<ApiResponse<Cv[]>> {
      try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Non authentifié'
        };
      }

      const params = new URLSearchParams();
      params.set("internshipOfferID", internshipId.toString());
      if (applicationStatus)
        params.set("applicationStatus", applicationStatus);
      if (program)
        params.set("program", program);
      if (institution)
        params.set("institution", institution);
      if (sortBy)
        params.set("sortBy", sortBy);
      
      const url = `${buildFullApiUrl(API_PATHS.EMPLOYER.APPLICATIONS)}?${params.toString()}`;
      console.log('🔍 Fetching student applications URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Applications response status:', response.status);

      if (response.ok) {
        const applications = await response.json();
        console.log('🔍 Applications received:', applications);
        return {
          success: true,
          data: applications
        };
      } else {
        // Try to parse error response - use response.clone() to avoid consuming the stream
        let errorMessage = "Erreur lors de l'obtention des candidatures.";
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('🔍 Error data:', errorData);
        } catch (parseError) {
          // If JSON parsing fails, try to read as text
          try {
            const clonedResponse = response.clone();
            const errorText = await clonedResponse.text();
            errorMessage = errorText || errorMessage;
            console.log('🔍 Error text:', errorText);
          } catch (textError) {
            console.log('🔍 Cannot read error response');
          }
        }
        
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      };
    }
  }

  // Récupérer les candidatures d'un étudiant
  async getStudentApplications(studentId: number): Promise<ApiResponse<any[]>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Non authentifié'
        };
      }

      const url = buildFullApiUrl(API_PATHS.STUDENT.APPLICATIONS);
      console.log('🔍 Fetching student applications from:', url);
      console.log('🔍 Token present:', !!token);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Applications response status:', response.status);
      console.log('🔍 Response headers:', [...response.headers.entries()]);

      if (response.ok) {
        const applications = await response.json();
        return {
          success: true,
          data: applications
        };
      } else {
        // Try to parse error response - use response.clone() to avoid consuming the stream
        let errorMessage = 'Erreur lors de la récupération des candidatures';
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('🔍 Error data:', errorData);
        } catch (parseError) {
          // If JSON parsing fails, try to read as text
          try {
            const clonedResponse = response.clone();
            const errorText = await clonedResponse.text();
            errorMessage = errorText || errorMessage;
            console.log('🔍 Error text:', errorText);
          } catch (textError) {
            console.log('🔍 Cannot read error response');
          }
        }
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      };
    }
  }

  // Postuler à une offre de stage
  async applyToOffer(studentId: number, offerId: number): Promise<ApiResponse<any>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Non authentifié'
        };
      }

      // Construire l'URL avec le path variable pour offerId
      const url = buildFullApiUrl(API_PATHS.STUDENT.APPLY_INTERNSHIP, { offerID: String(offerId) }) + `?studentID=${studentId}`;
      
      console.log('🔍 Applying to offer URL:', url);
      console.log('🔍 Params:', { studentID: studentId, offerID: offerId });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 Apply response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Apply result:', result);
        return {
          success: true,
          data: result
        };
      } else {
        // Try to parse error response - use response.clone() to avoid consuming the stream
        let errorMessage = 'Erreur lors de la candidature';
        try {
          const clonedResponse = response.clone();
          const errorText = await clonedResponse.text();
          console.log('🔍 Error text:', errorText);
          
          // Le backend renvoie parfois du texte brut avec "Erreur lors de la post體lation: "
          if (errorText.includes('Erreur lors de la postulation:')) {
            errorMessage = errorText.replace('Erreur lors de la postulation: ', '');
          } else {
            // Essayer de parser en JSON si possible
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText || errorMessage;
            }
          }
        } catch (err) {
          console.log('🔍 Cannot read error response');
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      };
    }
  }

  // Méthode pour programmer une entrevue - correspond à EmployerController.scheduleInterview()
  async scheduleInterview(invitationData: CreateInterviewInvitationRequest): Promise<ApiResponse<InterviewInvitation>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant'
        };
      }

      // Séparer les paramètres de requête du body et mapper les champs
      const { studentId, internshipOfferId, interviewDate, message, ...rest } = invitationData;
      
      // Mapper les champs pour correspondre au backend
      const interviewDetails = {
        interviewDate: interviewDate,    // Le backend attend interviewDate (pas interviewDateTime)
        personalizedMessage: message,      // Le backend attend personalizedMessage
        ...rest
      };
      
      // Construire l'URL avec les paramètres de requête
      const url = `${buildFullApiUrl(API_PATHS.EMPLOYER.SCHEDULE_INTERVIEW)}?internshipOfferID=${internshipOfferId}&studentID=${studentId}`;
      
      console.log('🔍 Schedule interview URL:', url);
      console.log('🔍 Interview details being sent:', interviewDetails);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(interviewDetails)
      });

      console.log('🔍 Schedule interview response status:', response.status);
      
      if (response.ok) {
        const interview: InterviewInvitation = await response.json();
        console.log('🔍 Interview scheduled successfully:', interview);
        return {
          success: true,
          data: interview
        };
      } else {
        let errorMessage = 'Erreur lors de la planification de l\'entrevue';
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('🔍 Error data:', errorData);
        } catch (parseError) {
          try {
            const clonedResponse = response.clone();
            const errorText = await clonedResponse.text();
            errorMessage = errorText || errorMessage;
            console.log('🔍 Error text:', errorText);
          } catch (textError) {
            console.log('🔍 Cannot read error response');
          }
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('🔍 Network error:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      };
    }
  }
}

export const apiService = new ApiService();
