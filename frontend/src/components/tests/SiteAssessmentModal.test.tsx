import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SiteAssessmentModal from '../dashboard/SiteAssessmentModal';
import type { InternshipContract, SiteAssessment } from '~/interfaces';
import { professorAPI } from '~/services/ProfessorAPI';

vi.mock('~/services/ProfessorAPI', () => ({
  professorAPI: {
    findSiteAssessment: vi.fn(),
    saveSiteAssessment: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('SiteAssessmentModal', () => {
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
    professorId: 3,
    professorFirstName: 'Marie',
    professorLastName: 'Martin',
  } as any;

  const sampleAssessment: SiteAssessment = {
    studentName: 'Jean Dupont',
    companyName: 'Tech Corp',
    supervisorName: 'Jane Doe',
    internshipPosition: 'Stage en développement logiciel',
    internshipDuration: '2024-07-01 - 2024-12-31',
    siteAssessment: {
      'Accueil et intégration': 'EXCELLENT',
      'Qualité de l\'encadrement': 'VERY_GOOD',
      'Pertinence des tâches': 'GOOD',
      'Clarté des objectifs': 'EXCELLENT',
      'Communication': 'VERY_GOOD',
      'Conformité académique': 'GOOD',
    },
    siteAssessmentComments: {
      'Accueil et intégration': 'Excellent accueil',
    },
    overallSiteAppreciation: 'GOOD',
    generalComments: 'Bon milieu de stage',
    recommendation: 'RECOMMEND',
    academicConformity: 'Conforme aux attentes',
    professorName: 'Marie Martin',
    signature: 'M. Martin',
    assessmentDate: '2024-12-15',
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche une évaluation existante retournée par l\'API', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: true, data: sampleAssessment });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    });

    // Vérifier que l'entreprise, le superviseur et l'appréciation sont affichés
    const techCorpElements = screen.getAllByText('Tech Corp');
    expect(techCorpElements.length).toBeGreaterThan(0);
    const janeDoeElements = screen.getAllByText('Jane Doe');
    expect(janeDoeElements.length).toBeGreaterThan(0);
    expect(screen.getByText('siteAssessment.appreciationOptions.GOOD')).toBeInTheDocument();
  });

  it('affiche le formulaire quand aucune évaluation n\'existe', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: false });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    // Attendre que le formulaire soit affiché
    await waitFor(() => {
      expect(screen.getByText('siteAssessment.submit')).toBeInTheDocument();
    });
  });

  it('affiche une évaluation passée en prop', () => {
    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
        siteAssessment={sampleAssessment}
      />
    );

    // Vérifier que l'évaluation est affichée
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    const techCorpElements = screen.getAllByText('Tech Corp');
    expect(techCorpElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Marie Martin')).toBeInTheDocument();
  });

  it('soumet le formulaire rempli avec succès et affiche l\'évaluation sauvegardée', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: false });
    vi.mocked(professorAPI.saveSiteAssessment).mockResolvedValue({ success: true, data: sampleAssessment });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    // Attendre que le formulaire soit disponible
    await waitFor(() => {
      expect(screen.getByText('siteAssessment.submit')).toBeInTheDocument();
    });

    // Remplir tous les critères d'évaluation
    const excellentButtons = screen.getAllByText('siteAssessment.ratings.EXCELLENT');
    // Il devrait y avoir au moins 6 critères
    expect(excellentButtons.length).toBeGreaterThanOrEqual(6);

    // Cliquer sur les 6 premiers boutons EXCELLENT (un pour chaque critère)
    for (let i = 0; i < 6; i++) {
      fireEvent.click(excellentButtons[i]);
    }

    // Remplir la signature - chercher par placeholder ou par query plus spécifique
    const allInputs = screen.getAllByRole('textbox');
    // Find the signature input - it's not readonly and not disabled
    const writableInputs = allInputs.filter(input => !input.hasAttribute('readonly') && !input.hasAttribute('disabled'));

    // Should have only one writable input (signature) plus textareas
    const signatureInput = writableInputs.find(input => input.tagName === 'INPUT');
    expect(signatureInput).toBeDefined();

    if (signatureInput) {
      fireEvent.change(signatureInput, { target: { value: 'M. Martin' } });
    }

    // Soumettre le formulaire
    const submitButton = screen.getByText('siteAssessment.submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(professorAPI.saveSiteAssessment).toHaveBeenCalledWith(
        baseContract.professorId,
        baseContract.id,
        expect.objectContaining({
          studentName: 'Jean Dupont',
          companyName: 'Tech Corp',
          professorName: 'Marie Martin',
          signature: 'M. Martin',
        })
      );
    });

    // Vérifier que l'évaluation sauvegardée est maintenant affichée
    await waitFor(() => {
      expect(screen.getByText('Marie Martin')).toBeInTheDocument();
    });
  });

  it('affiche un message d\'erreur si le formulaire est soumis incomplet', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: false });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('siteAssessment.submit')).toBeInTheDocument();
    });

    // Soumettre sans remplir les critères
    const submitButton = screen.getByText('siteAssessment.submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('siteAssessment.errors.incompleteForm')).toBeInTheDocument();
    });

    // Vérifier que l'API n'a pas été appelée
    expect(professorAPI.saveSiteAssessment).not.toHaveBeenCalled();
  });

  it('pré-remplit les champs en lecture seule avec les données du contrat', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: false });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('siteAssessment.submit')).toBeInTheDocument();
    });

    // Vérifier que les champs sont pré-remplis
    const studentNameInput = screen.getByDisplayValue('Jean Dupont');
    expect(studentNameInput).toBeInTheDocument();
    expect(studentNameInput).toHaveAttribute('readonly');

    const companyNameInput = screen.getByDisplayValue('Tech Corp');
    expect(companyNameInput).toBeInTheDocument();
    expect(companyNameInput).toHaveAttribute('readonly');

    const supervisorNameInput = screen.getByDisplayValue('Jane Doe');
    expect(supervisorNameInput).toBeInTheDocument();
    expect(supervisorNameInput).toHaveAttribute('readonly');

    const professorNameInput = screen.getByDisplayValue('Marie Martin');
    expect(professorNameInput).toBeInTheDocument();
    expect(professorNameInput).toBeDisabled();
  });

  it('gère les erreurs de soumission de l\'API', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: false });
    vi.mocked(professorAPI.saveSiteAssessment).mockResolvedValue({
      success: false,
      error: 'Erreur serveur'
    });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('siteAssessment.submit')).toBeInTheDocument();
    });

    // Remplir le formulaire
    const excellentButtons = screen.getAllByText('siteAssessment.ratings.EXCELLENT');
    for (let i = 0; i < 6; i++) {
      fireEvent.click(excellentButtons[i]);
    }

    // Trouver le champ de signature - c'est le seul input text qui n'est ni readonly ni disabled
    const allInputs = document.querySelectorAll('input[type="text"]');
    const signatureInput = Array.from(allInputs).find(
      input => !input.hasAttribute('readonly') && !input.hasAttribute('disabled')
    ) as HTMLInputElement;

    expect(signatureInput).toBeTruthy();
    fireEvent.change(signatureInput, { target: { value: 'M. Martin' } });

    // Soumettre
    const submitButton = screen.getByText('siteAssessment.submit');
    fireEvent.click(submitButton);

    // Vérifier que l'API a été appelée
    await waitFor(() => {
      expect(professorAPI.saveSiteAssessment).toHaveBeenCalled();
    });

    // Vérifier que le formulaire est toujours affiché (pas de transition vers la vue)
    expect(screen.getByText('siteAssessment.submit')).toBeInTheDocument();
  });

  it('ferme le modal quand on clique sur le bouton fermer', () => {
    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
        siteAssessment={sampleAssessment}
      />
    );

    const closeButton = screen.getByText('common.close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('affiche les commentaires d\'évaluation dans la vue', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: true, data: sampleAssessment });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Excellent accueil')).toBeInTheDocument();
    });
  });

  it('permet de sélectionner différentes options d\'appréciation', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: false });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('siteAssessment.submit')).toBeInTheDocument();
    });

    // Sélectionner une appréciation globale
    const veryGoodButton = screen.getByRole('button', { name: 'siteAssessment.appreciationOptions.VERY_GOOD' });
    fireEvent.click(veryGoodButton);

    // Vérifier que le bouton est sélectionné (devrait avoir la classe bg-blue-600)
    expect(veryGoodButton).toHaveClass('bg-blue-600');
  });

  it('permet de sélectionner différentes recommandations', async () => {
    vi.mocked(professorAPI.findSiteAssessment).mockResolvedValue({ success: false });

    render(
      <SiteAssessmentModal
        contract={baseContract}
        onClose={mockOnClose}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('siteAssessment.submit')).toBeInTheDocument();
    });

    // Sélectionner une recommandation
    const stronglyRecommendButton = screen.getByRole('button', { name: 'siteAssessment.recommendationOptions.STRONGLY_RECOMMEND' });
    fireEvent.click(stronglyRecommendButton);

    // Vérifier que le bouton est sélectionné
    expect(stronglyRecommendButton).toHaveClass('bg-blue-600');
  });
});

