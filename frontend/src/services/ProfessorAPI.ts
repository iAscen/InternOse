import type { ApiResponse, InternshipContract } from "~/interfaces";
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
}

export const professorAPI = new ProfessorAPI();