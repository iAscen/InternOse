// Service API pour les gestionnaires de stages
import type {
  InternshipOffer,
  ApiResponse,
  Cv,
  InternshipContract
} from '~/interfaces';
import { userAPI } from './UserAPI';
import { API_PATHS, buildFullApiUrl } from '~/constants/apiPaths';

class InternshipManagerAPI {
  // Récupérer toutes les offres de stages de tous les employeurs
  async getAllInternshipOffers(): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = userAPI.getToken();
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

  // Récupérer tous les CVs des étudiants
  async getAllCvs(): Promise<ApiResponse<Cv[]>> {
    try {
      const token = userAPI.getToken();
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

  // Récupérer les détails d'un CV
  async getCvDetails(studentId: number): Promise<ApiResponse<Cv>> {
    try {
      const token = userAPI.getToken();
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

  // Télécharger un CV
  async getCvBlob(studentId: Number): Promise<ApiResponse<Blob>> {
    try {
      const token = userAPI.getToken();
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

  // Valider/refuser une offre de stage
  async validateInternshipOffer(offerId: number, approved: boolean, comment?: string): Promise<ApiResponse<string>> {
    try {
      const token = userAPI.getToken();
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

  // Valider/refuser un CV
  async validateCv(studentId: number, approved: boolean, comment?: string): Promise<ApiResponse<string>> {

    try {
      const token = userAPI.getToken();
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
  async createInternshipContract(contractData: any): Promise<ApiResponse<string>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      console.log("imma kill you RIGHT NOW", contractData)

      const response = await fetch(buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.CONTRACTS), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData),
      });

      if (response.ok) {
        return {
          success: true,
          data: 'Contrat créé avec succès',
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || errorData.error || 'Erreur lors de la création du contrat',
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

  // Récupérer toutes les ententes de stage
  async getAllInternshipContracts(): Promise<ApiResponse<InternshipContract[]>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const response = await fetch(buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.CONTRACTS), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const contracts = await response.json();
        return {
          success: true,
          data: contracts,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || errorData.error || 'Erreur lors du chargement des ententes',
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

  // Signer une entente de stage (Gestionnaire de stages)
  async signContract(contractId: number): Promise<ApiResponse<string>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const response = await fetch(buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.CONTRACTS) + `/${contractId}/sign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        return {
          success: true,
          data: responseData.message || 'Entente signée avec succès',
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || errorData.error || 'Erreur lors de la signature de l\'entente',
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

  async assignProfessorToContract(contractId: number, professorId: number | null): Promise<ApiResponse<Cv>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      let url = buildFullApiUrl(API_PATHS.INTERNSHIP_MANAGER.ASSIGN_PROFESSOR_TO_CONTRACT)
      
      if (professorId)
        url = url.replace("{professorID}", String(professorId))
      else
        url = url.replace("{professorID}", String("-1"))

      url = url + `?contractID=${contractId}`

      console.log('URL: ' + url)

      const response = await fetch(url, {
        method: 'Post',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const body = await response.json();
        console.log(response.status)
        return {
          success: true,
          data: body.data,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Erreur lors de l\'assignation d\'un professeur',
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

export const internshipManagerAPI = new InternshipManagerAPI();
