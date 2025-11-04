// Service API pour les étudiants
import type {
  InternshipOffer,
  ApiResponse
} from '~/interfaces';
import { userAPI } from './UserAPI';
import { API_PATHS, buildFullApiUrl } from '~/constants/apiPaths';

class StudentAPI {
  // Méthodes pour les CV des étudiants
  async uploadCV(file: File): Promise<ApiResponse<string>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Récupérer l'ID de l'étudiant depuis le JWT
      const studentId = await userAPI.getStudentIdFromJWT();
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
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Récupérer l'ID de l'étudiant depuis le JWT
      const studentId = await userAPI.getStudentIdFromJWT();
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

  async StudentGetInternshipOffers(studentId: number | null): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = userAPI.getToken();
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
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Get student ID from JWT
      const studentId = await userAPI.getStudentIdFromJWT();
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

  // Récupérer les candidatures d'un étudiant
  async getStudentApplications(studentId: number): Promise<ApiResponse<any[]>> {
    try {
      const token = userAPI.getToken();
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
        console.log(applications)
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
      const token = userAPI.getToken();
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

  async respondToOffer(internshipOfferID: number, acceptOffer: boolean) {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Non authentifié'
        };
      }

      const studentId = await userAPI.getStudentIdFromJWT()

      let url = buildFullApiUrl(API_PATHS.STUDENT.RESPOND_TO_OFFER) + `?studentID=${studentId}`;
      url = url.replace(":internshipOfferID", internshipOfferID.toString())

      console.log("🔍 respondToOffer URL: ", url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accepted: acceptOffer
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 respondToOffer result:', result);
        return {
          success: true,
          data: result
        };
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.message || 'Erreur lors de la reponse a l\'offre de stage.'

        console.log('🔍 respondToOffer errorMessage:', errorMessage);
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
}

export const studentAPI = new StudentAPI();
