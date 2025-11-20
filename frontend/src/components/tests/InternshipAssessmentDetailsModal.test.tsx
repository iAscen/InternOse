import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import InternshipAssessmentDetailsModal from '../dashboard/InternshipAssessmentDetailsModal';
import type { InternshipContract, InternAssessment } from '~/interfaces';
import { employerAPI } from '~/services/EmployerAPI';
import { userAPI } from '~/services/UserAPI';

vi.mock('~/services/EmployerAPI', () => ({
  employerAPI: {
    getInternAssessment: vi.fn(),
    getInternshipOffer: vi.fn(),
    postInternAssessment: vi.fn(),
  },
}));

vi.mock('~/services/UserAPI', () => ({
  userAPI: {
    getEmployerIdFromJWT: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('InternshipAssessmentDetailsModal', () => {
  const mockOnClose = vi.fn();

  const baseContract: InternshipContract = {
    id: 11,
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    weeklyHours: 35,
    tasks: 'Aider au développement et aux tests logiciels',
    educationalObjectives: 'Acquérir une expérience pratique',
    supervisorName: 'Jane Doe',
    supervisorTitle: 'Développeuse sénior',
    supervisorEmail: 'jane.doe@example.com',
    supervisorPhone: '+1-555-123-4567',
    isSignedStudent: false,
    isSignedEmployer: false,
    isSignedInternshipManager: false,
    studentId: 5,
    studentFirstName: 'Jean',
    studentLastName: 'Dupont',
    employerId: 2,
    employerCompany: 'Tech Corp',
    internshipOfferId: 10,
    internshipOfferTitle: 'Stage en développement logiciel',
  } as any;

  const sampleAssessment: InternAssessment = {
    studentName: 'Jean Dupont',
    studentProgram: 'Informatique',
    companyName: 'Tech Corp',
    supervisorName: 'Jane Doe',
    supervisorTitle: 'Développeuse sénior',
    supervisorPhoneNumber: '+1-555-123-4567',
    internAssessment: {
      PUNCTUALITY: 'COMPLETELY_AGREE',
      ATTITUDE: 'COMPLETELY_AGREE',
      WORK_QUALITY: 'COMPLETELY_AGREE',
      FOLLOW_INSTRUCTIONS: 'COMPLETELY_AGREE',
      TEAM_INTEGRATION: 'COMPLETELY_AGREE',
    },
    internAssessmentComments: {
      PUNCTUALITY: 'Très ponctuel',
    },
    overallInternAppreciation: 'FULLY_MEETS_EXPECTATIONS',
    appreciationComment: 'Bon travail',
    discussedWithTheIntern: true,
    weeklySupervisionHours: 5,
    futureCollaboration: 'MAYBE',
    academicPreparationAdequacy: 'Adéquate',
    signerName: 'Jane Doe',
    signerTitle: 'Développeuse sénior',
    signature: '',
    signatureDate: new Date().toISOString(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche une évaluation existante retournée par l\'API', async () => {
    vi.mocked(employerAPI.getInternAssessment).mockResolvedValue({ success: true, data: sampleAssessment });
    vi.mocked(employerAPI.getInternshipOffer).mockResolvedValue({ success: true, data: { program: 'Informatique', title: 'Stage en développement logiciel' } } as any);

    render(
      <InternshipAssessmentDetailsModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    // Vérifier que l'entreprise, le superviseur et l'appréciation sont affichés
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    const janeDoeElements = screen.getAllByText('Jane Doe');
    expect(janeDoeElements.length).toBeGreaterThan(0);
    expect(screen.getByText('internshipAssessment.appreciations.FULLY_MEETS_EXPECTATIONS')).toBeInTheDocument();
  });

  it('affiche le formulaire quand aucune évaluation n\'existe', async () => {
    vi.mocked(employerAPI.getInternAssessment).mockResolvedValue({ success: false });
    vi.mocked(employerAPI.getInternshipOffer).mockResolvedValue({ success: true, data: { program: 'Informatique', title: 'Stage en développement logiciel' } } as any);

    render(
      <InternshipAssessmentDetailsModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    // le texte du bouton de soumission est codé en dur dans le composant (français)
    await waitFor(() => {
      expect(screen.getByText("Soumettre l'évaluation")).toBeInTheDocument();
    });
  });

  it('soumet le formulaire rempli avec succès et affiche l\'évaluation sauvegardée', async () => {
    vi.mocked(employerAPI.getInternAssessment).mockResolvedValue({ success: false });
    vi.mocked(employerAPI.getInternshipOffer).mockResolvedValue({ success: true, data: { program: 'Informatique', title: 'Stage en développement logiciel' } } as any);
    vi.mocked(userAPI.getEmployerIdFromJWT).mockResolvedValue(2);
    vi.mocked(employerAPI.postInternAssessment).mockResolvedValue({ success: true, data: sampleAssessment });

    render(
      <InternshipAssessmentDetailsModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    // attendre que le formulaire soit disponible
    await waitFor(() => {
      expect(screen.getByText("Soumettre l'évaluation")).toBeInTheDocument();
    });

    const excellentLabel = 'internshipAssessment.ratings.excellent';
    const excellentButtons = screen.getAllByText(excellentLabel);
    expect(excellentButtons.length).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < 5; i++) {
      fireEvent.click(excellentButtons[i]);
    }

    const hoursInput = screen.getByPlaceholderText('internshipAssessment.weeklySupervisionHoursPlaceholder') as HTMLInputElement;
    fireEvent.change(hoursInput, { target: { value: '10' } });

    const signerInput = screen.getByPlaceholderText('internshipAssessment.signerNamePlaceholder') as HTMLInputElement;
    const signerTitleInput = screen.getByPlaceholderText('internshipAssessment.signerTitlePlaceholder') as HTMLInputElement;
    fireEvent.change(signerInput, { target: { value: 'Jane Doe' } });
    fireEvent.change(signerTitleInput, { target: { value: 'Développeuse sénior' } });

    // Soumettre le formulaire
    const submitButton = screen.getByText("Soumettre l'évaluation");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(employerAPI.postInternAssessment).toHaveBeenCalled();
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
      expect(screen.getByText('internshipAssessment.appreciations.FULLY_MEETS_EXPECTATIONS')).toBeInTheDocument();
    });
  });
});
