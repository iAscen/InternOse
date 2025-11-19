import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { InternshipContract, Professor } from '~/interfaces';
import { userAPI } from '~/services/UserAPI';
import { ProfessorListModal } from '../dashboard/ProfessorListModal';
import { internshipManagerAPI } from '~/services/InternshipManagerAPI';

vi.mock('~/services/UserAPI', () => ({
  userAPI: {
    getUserRole: vi.fn()
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('~/services/InternshipManagerAPI', () => ({
    internshipManagerAPI: {
        assignProfessorToContract: vi.fn()
    }
}))

describe('ProfessorListModal', () => {
  const mockOnClose = vi.fn();
  const mockOnProfessorUpdate = vi.fn();

  const professor1: Professor = {
    id: 1,
    firstName: "Robert",
    lastName: "Johnson"
  }

  const professor2: Professor = {
    id: 2,
    firstName: "Robert",
    lastName: "Carlos"
  }

  const professors: Professor[] = [
    professor1, professor2
  ]

  const mockContract: InternshipContract = {
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

  it('should display a message saying that there are no professors', () => {
     vi.mocked(userAPI.getUserRole).mockReturnValue('INTERNSHIP_MANAGER');

     const emptyProfessorsList: Professor[] = []

     render(<ProfessorListModal
        professors={emptyProfessorsList}
        contract={mockContract}
        onClose={mockOnClose}
        onProfessorUpdate={mockOnProfessorUpdate}
     ></ProfessorListModal>)

    const noProfessorsAvailableMessage = screen.getAllByText("internshipContract.noProfessorAvailable")

    expect(noProfessorsAvailableMessage).toHaveLength(1)
  }),

  it('should have one of the professors display a message \'assigned\'', () => {
    vi.mocked(userAPI.getUserRole).mockReturnValue('INTERNSHIP_MANAGER');

     render(<ProfessorListModal
        professors={professors}
        contract={mockContract}
        onClose={mockOnClose}
        onProfessorUpdate={mockOnProfessorUpdate}
     ></ProfessorListModal>)

    const alreadyAssignedProfessor = screen.getAllByText("common.assigned")

    expect(alreadyAssignedProfessor).toHaveLength(1)
  });
})