import type { ApiResponse, InternshipContract, Professor } from "~/interfaces";
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
    
          let url = buildFullApiUrl(API_PATHS.PROFESSOR.CONTRACTS)
          url = url.replace("{professorID}", String(professorID))
    
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
              error: errorData.error || 'Erreur lors de la recuperation des contrats',
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

export const professorAPI = new ProfessorAPI()