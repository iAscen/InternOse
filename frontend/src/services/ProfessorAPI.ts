import type { ApiResponse, InternshipContract, SiteAssessment } from "~/interfaces";
import { userAPI } from "./UserAPI";
import { API_PATHS, buildFullApiUrl } from "~/constants/apiPaths";

class ProfessorAPI {
  async findInternshipContracts(professorID: number): Promise<ApiResponse<InternshipContract[]>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const url = buildFullApiUrl(API_PATHS.PROFESSOR.CONTRACTS).replace("{professorID}", String(professorID));

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
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la récupération des contrats' }));
        return {
          success: false,
          error: errorData.error || 'Erreur lors de la récupération des contrats',
        };
      }
    } catch (error) {
      console.error('Error fetching internship contracts:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async findSiteAssessment(professorID: number, internshipContractID: number): Promise<ApiResponse<SiteAssessment | null>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const url = buildFullApiUrl(API_PATHS.PROFESSOR.SITE_ASSESSMENT).replace("{professorID}", String(professorID)) + `?internshipContractID=${internshipContractID}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const body = await response.json();
        // Le backend retourne null si aucune évaluation n'existe
        if (body === null || Object.keys(body).length === 0) {
          return {
            success: true,
            data: null,
          };
        }
        return {
          success: true,
          data: body,
        };
      } else if (response.status === 404) {
        // Pas d'évaluation existante
        return {
          success: true,
          data: null,
        };
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur lors de la récupération de l\'évaluation' }));
        return {
          success: false,
          error: errorData.message || errorData.error || 'Erreur lors de la récupération de l\'évaluation',
        };
      }
    } catch (error) {
      console.error('Error fetching site assessment:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  async saveSiteAssessment(professorID: number, internshipContractID: number, assessmentData: SiteAssessment): Promise<ApiResponse<SiteAssessment>> {
    try {
      const token = userAPI.getToken();
      if (!token) {
        return {
          success: false,
          error: 'Token d\'authentification manquant',
        };
      }

      const url = buildFullApiUrl(API_PATHS.PROFESSOR.SITE_ASSESSMENT).replace("{professorID}", String(professorID)) + `?internshipContractID=${internshipContractID}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData),
      });

      if (response.ok || response.status === 201) {
        const savedAssessment = await response.json();
        return {
          success: true,
          data: savedAssessment,
        };
      } else {
        let errorMessage = 'Erreur lors de la soumission de l\'évaluation';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('Error saving site assessment:', error);
      return {
        success: false,
        error: 'Erreur de connexion au serveur',
      };
    }
  }
}

export const professorAPI = new ProfessorAPI();