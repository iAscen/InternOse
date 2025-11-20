// Service API pour les employeurs
import type {
  InternshipOffer,
  CreateInternshipOfferRequest,
  ApiResponse,
  Cv,
  CreateInterviewInvitationRequest,
  InterviewInvitation,
  UnseenApplicationsCount,
  InternshipContract,
  InternAssessment
} from '~/interfaces';
import { userAPI } from './UserAPI';
import { API_PATHS, buildFullApiUrl } from '~/constants/apiPaths';

class EmployerAPI {
  // Récupérer toutes les offres de stage de l'employeur
  async getInternshipOffers(): Promise<ApiResponse<InternshipOffer[]>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Récupérer l'ID de l'employeur depuis le JWT
      const employerId = await userAPI.getEmployerIdFromJWT();
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

  // Récupérer une offre de stage par son ID
  async getInternshipOffer(internshipOfferId: number): Promise<ApiResponse<InternshipOffer>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const url = buildFullApiUrl(API_PATHS.EMPLOYER.INTERNSHIP_OFFER_DETAILS, { offerID: internshipOfferId });
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const offer = await response.json();
        return {
          success: true,
          data: offer,
        };
      } else {
        let errorMessage = 'Erreur lors du chargement de l\'offre';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // ignore
        }
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  // Créer une nouvelle offre de stage
  async createInternshipOffer(offerData: CreateInternshipOfferRequest): Promise<ApiResponse<string>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      // Récupérer l'ID de l'employeur depuis le JWT
      const employerId = await userAPI.getEmployerIdFromJWT();
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

  // Récupérer les candidatures pour une offre de stage
  async getStudentApplicationsBy(internshipId: number, applicationStatus: string | null, 
                                  program: string | null, institution: string | null, sortBy: string | null): Promise<ApiResponse<Cv[]>> {
      try {
      const token = userAPI.getToken();
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

  // Méthode pour programmer une entrevue - correspond à EmployerController.scheduleInterview()
  async scheduleInterview(invitationData: CreateInterviewInvitationRequest): Promise<ApiResponse<InterviewInvitation>> {
    try {
      const token = userAPI.getToken();
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

  // Mettre à jour le statut d'une candidature (Accepter/Refuser)
  async updateApplicationStatus(
    internshipOfferId: number,
    studentId: number,
    isApproved: boolean,
    comment?: string
  ): Promise<ApiResponse<string>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant'
        };
      }

      const params = new URLSearchParams();
      params.append("isApproved", isApproved.toString());
      if (comment && comment.trim()) {
        params.append('comment', comment.trim());
      }

      // Construire l'URL avec les paramètres
      const url = buildFullApiUrl(API_PATHS.EMPLOYER.UPDATE_APPLICATION_STATUS, {
        internshipOfferID: internshipOfferId,
        studentID: studentId
      }) + `?${params.toString()}`;
      
      console.log('🔍 Update application status URL:', url);

      console.error(params.toString());

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });


      console.log('🔍 Update application status response status:', isApproved ? 'APPROVED' : 'REJECTED');

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          data: result.message || (isApproved ? 'Candidature acceptée avec succès' : 'Candidature refusée avec succès')
        };
      } else {
        let errorMessage = isApproved
          ? 'Erreur lors de l\'acceptation de la candidature' 
          : 'Erreur lors du refus de la candidature';
        
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

   async getUnseenApplicationsCount(offerID: number): Promise<ApiResponse<UnseenApplicationsCount>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      let url = buildFullApiUrl(API_PATHS.EMPLOYER.APPLICATIONS_COUNT_UNSEEN)
      url = url.replace(":offerID", offerID.toString())

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const unseenApplicationsCount = await response.json();
        return {
          success: true,
          data: unseenApplicationsCount,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Erreur lors du compte des applications',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async makeApplicationsSeen(offerID: number) {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      let url = buildFullApiUrl(API_PATHS.EMPLOYER.APPLICATIONS_MAKE_SEEN)
      url = url.replace(":offerID", offerID.toString())

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return {
          success: true
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Erreur lors de la modification des applications',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  // Récupérer l'entente de stage pour une offre et un étudiant spécifiques
  async getInternshipContract(offerId: number, studentId: number): Promise<ApiResponse<InternshipContract>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant'
        };
      }

      const employerId = await userAPI.getEmployerIdFromJWT();
      if (!employerId) {
        return {
          success: false,
          error: 'Impossible de récupérer l\'ID de l\'employeur'
        };
      }

      let url = buildFullApiUrl(API_PATHS.EMPLOYER.CONTRACT, { studentID: String(studentId) });
      url += `?employerID=${employerId}&internshipOfferID=${offerId}`;
      console.log('🔍 Fetching contract from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contract = await response.json();
        return {
          success: true,
          data: contract
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Erreur lors de la récupération du contrat'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      };
    }
  }

  // Signer l'entente de stage
  async signContract(offerId: number, studentId: number): Promise<ApiResponse<InternshipContract>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant'
        };
      }

      const employerId = await userAPI.getEmployerIdFromJWT();
      if (!employerId) {
        return {
          success: false,
          error: 'Impossible de récupérer l\'ID de l\'employeur'
        };
      }

      let url = buildFullApiUrl(API_PATHS.EMPLOYER.CONTRACT, { studentID: String(studentId) });
      url += `/sign?employerID=${employerId}&internshipOfferID=${offerId}`;
      console.log('🔍 Signing contract at:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const contract = await response.json();
        return {
          success: true,
          data: contract
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Erreur lors de la signature du contrat'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      };
    }
  }

  // Récupérer l'évaluation du stagiaire
  async getInternAssessment(employerId: number | undefined, internshipContractId: number): Promise<ApiResponse<InternAssessment>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant'
        };
      }

      const url = `${buildFullApiUrl(API_PATHS.EMPLOYER.INTERN_ASSESSMENT)}?employerID=${employerId}&internshipContractID=${internshipContractId}`;
      console.log('Récupération de l\'évaluation du stagiaire depuis:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const assessment = await response.json();
        return {
          success: true,
          data: assessment
        };
      } else {
        let errorMessage = 'Erreur lors de la récupération de l\'évaluation';
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          try {
            const clonedResponse = response.clone();
            const errorText = await clonedResponse.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            console.log('Impossible de lire la réponse d\'erreur');
          }
        }

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      };
    }
  }

  // Soumettre l'évaluation du stagiaire
  async postInternAssessment(employerId: number, internshipContractId: number, assessmentData: InternAssessment): Promise<ApiResponse<InternAssessment>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant'
        };
      }

      const url = `${buildFullApiUrl(API_PATHS.EMPLOYER.INTERN_ASSESSMENT)}?employerID=${employerId}&internshipContractID=${internshipContractId}`;
      console.log('Soumission de l\'évaluation du stagiaire à:', url);
      console.log('Données d\'évaluation:', assessmentData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assessmentData)
      });

      if (response.ok) {
        const savedAssessment = await response.json();
        return {
          success: true,
          data: savedAssessment
        };
      } else {
        let errorMessage = 'Erreur lors de la soumission de l\'évaluation';
        try {
          const clonedResponse = response.clone();
          const errorData = await clonedResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('Erreur data:', errorData);
        } catch (parseError) {
          try {
            const clonedResponse = response.clone();
            const errorText = await clonedResponse.text();
            errorMessage = errorText || errorMessage;
            console.log('Erreur:', errorText);
          } catch (textError) {
            console.log('Impossible de lire la réponse d\'erreur');
          }
        }

        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur'
      };
    }
  }


}

export const employerAPI = new EmployerAPI();
