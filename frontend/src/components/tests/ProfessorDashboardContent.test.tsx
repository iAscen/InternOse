import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OfferList from '../dashboard/OfferList';
import type { InternshipContract, InternshipOffer } from '~/interfaces';
import { professorAPI } from '~/services/ProfessorAPI';
import { userAPI } from '~/services/UserAPI';
import ProfessorDashboard from '~/routes/professor-dashboard';
import { MemoryRouter } from 'react-router';
import ProfessorDashboardContent from '../dashboard/ProfessorDashboardContent';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      // Gérer les traductions avec paramètres
      if (key === 'common.winterSession' && params?.year) {
        return `Hiver ${params.year}`;
      }
      // Retourner la clé telle quelle pour les autres cas
      return key;
    }
  })
}));

vi.mock('~/services/ProfessorAPI', () => ({
  professorAPI: {
    findInternshipContracts: vi.fn()
  }
}));

vi.mock('~/services/UserAPI', () => ({
  userAPI: {
    getProfessorIdFromJWT: vi.fn(),
    getUserRole: vi.fn(),
    isAuthenticated: vi.fn(),
    getUserName: vi.fn(),
    getUserEmail: vi.fn()
  }
}));

describe('ProfessorDashboardContent', () => {
    const contract: InternshipContract = {
        id: 1,
        startDate: '2024-07-01',
        endDate: '2024-12-31',
        weeklyHours: 35,
        tasks: 'Assist with software development and testing',
        educationalObjectives: 'Gain practical experience in Java and Spring Boot',
        supervisorName: 'Jane Doe',
        supervisorTitle: 'Senior Developer',
        supervisorEmail: 'jane.doe@example.com',
        supervisorPhone: '+1-555-123-4567',
        isSignedStudent: false,
        isSignedEmployer: false,
        isSignedInternshipManager: false,
        studentId: 5,
        studentFirstName: 'John',
        studentLastName: 'Smith',
        employerId: 2,
        employerCompany: 'Tech Corp',
        internshipOfferId: 10,
        internshipOfferTitle: 'Software Developer Internship',
        professorId: 1,
        professorEmail: 'prof@gmail.com',
        professorFirstName: 'Robert',
        professorLastName: 'Swanson'
      };

    const contracts: InternshipContract[] = [
        contract
    ]

    it('should display a message saying that no students where found', async () => {
        vi.mocked(userAPI.isAuthenticated).mockReturnValue(true)
        vi.mocked(userAPI.getUserRole).mockReturnValue('PROFESSOR');
        vi.mocked(userAPI.getProfessorIdFromJWT).mockResolvedValue(1)
        vi.mocked(professorAPI.findInternshipContracts).mockResolvedValue(
            {
                success: true,
                data: []
            }
        )

        render(
            <MemoryRouter>
            <ProfessorDashboardContent />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(professorAPI.findInternshipContracts).toHaveBeenCalledWith(1);
        });

        const noStudentFoundMessage = screen.getAllByText('professor.noStudentFound')
        expect(noStudentFoundMessage).toHaveLength(1)
    }),

    it('should display a student', async () => {
        vi.mocked(userAPI.isAuthenticated).mockReturnValue(true)
        vi.mocked(userAPI.getUserRole).mockReturnValue('PROFESSOR');
        vi.mocked(userAPI.getProfessorIdFromJWT).mockResolvedValue(1)
        vi.mocked(professorAPI.findInternshipContracts).mockResolvedValue(
            {
                success: true,
                data: contracts
            }
        )

        render(
            <MemoryRouter>
            <ProfessorDashboardContent />
            </MemoryRouter>
        );

        await waitFor(() => {
            const student = screen.getAllByText('professor.companyName')
            expect(student).toHaveLength(1)
        });
    }),

    it('should display an error', async () => {
        vi.mocked(userAPI.isAuthenticated).mockReturnValue(true)
        vi.mocked(userAPI.getUserRole).mockReturnValue('PROFESSOR');
        vi.mocked(userAPI.getProfessorIdFromJWT).mockResolvedValue(1)
        vi.mocked(professorAPI.findInternshipContracts).mockResolvedValue(
            {
                success: false,
                error: 'erreur de chargement des etudiants',
                data: []
            }
        )

        render(
            <MemoryRouter>
            <ProfessorDashboardContent />
            </MemoryRouter>
        );

        await waitFor(() => {
            const errorMessage = screen.getAllByText('erreur de chargement des etudiants')
            expect(errorMessage).toHaveLength(1)
        });
    })
})