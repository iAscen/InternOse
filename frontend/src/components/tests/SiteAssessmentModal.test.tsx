import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
      'welcomeMeasures': 'COMPLETELY_AGREE',
      'supervisionTime': 'PARTIALLY_AGREE',
      'tasksConformity': 'PARTIALLY_AGREE',
      'workEnvironmentSafety': 'COMPLETELY_AGREE',
      'supervisorCommunication': 'PARTIALLY_AGREE',
      'academicConformity': 'PARTIALLY_AGREE',
    },
    siteAssessmentComments: {
      'welcomeMeasures': 'Excellent accueil',
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

    // Remplir tous les critères d'évaluation (il y a 10 critères)
    // Chaque critère a 5 boutons, donc il y a 10 boutons avec le texte COMPLETELY_AGREE (un par critère)
    const excellentButtons = screen.getAllByText('siteAssessment.ratings.COMPLETELY_AGREE');
    // Il devrait y avoir exactement 10 boutons (un par critère)
    expect(excellentButtons.length).toBeGreaterThanOrEqual(10);

    // Cliquer sur tous les boutons COMPLETELY_AGREE (un pour chaque critère)
    excellentButtons.forEach(button => {
      fireEvent.click(button);
    });

    // Attendre que le champ salaryHourlyRate apparaisse (car le critère salary est maintenant évalué)
    // et le remplir
    let salaryInput: HTMLInputElement;
    await waitFor(() => {
      salaryInput = screen.getByPlaceholderText('siteAssessment.salaryPerHourPlaceholder') as HTMLInputElement;
      expect(salaryInput).toBeInTheDocument();
    }, { timeout: 2000 });
    fireEvent.change(salaryInput!, { target: { value: '25' } });

    // Sélectionner l'appréciation globale (requis)
    const excellentAppreciationButton = screen.getByRole('button', { name: 'siteAssessment.appreciationOptions.EXCELLENT' });
    fireEvent.click(excellentAppreciationButton);

    // Remplir les heures par semaine (requis)
    // Trouver les labels et ensuite les inputs dans le même conteneur parent
    const hoursFirstMonthLabel = screen.getByText('siteAssessment.hoursPerWeekFirstMonth');
    const hoursFirstMonthContainer = hoursFirstMonthLabel.closest('div[class*="border"]') as HTMLElement;
    expect(hoursFirstMonthContainer).toBeDefined();
    const hoursFirstMonthInput = within(hoursFirstMonthContainer).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(hoursFirstMonthInput, { target: { value: '35' } });

    const hoursSecondMonthLabel = screen.getByText('siteAssessment.hoursPerWeekSecondMonth');
    const hoursSecondMonthContainer = hoursSecondMonthLabel.closest('div[class*="border"]') as HTMLElement;
    expect(hoursSecondMonthContainer).toBeDefined();
    const hoursSecondMonthInput = within(hoursSecondMonthContainer).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(hoursSecondMonthInput, { target: { value: '35' } });

    const hoursThirdMonthLabel = screen.getByText('siteAssessment.hoursPerWeekThirdMonth');
    const hoursThirdMonthContainer = hoursThirdMonthLabel.closest('div[class*="border"]') as HTMLElement;
    expect(hoursThirdMonthContainer).toBeDefined();
    const hoursThirdMonthInput = within(hoursThirdMonthContainer).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(hoursThirdMonthInput, { target: { value: '35' } });

    // Sélectionner "Non" pour les quarts de travail variables (pour éviter de devoir remplir workShiftTimes)
    const noVariableShiftsButton = screen.getByRole('button', { name: /siteAssessment\.no/i });
    fireEvent.click(noVariableShiftsButton);

    // Remplir la signature - c'est un champ password, pas un textbox
    const signatureInput = screen.getByPlaceholderText('siteAssessment.passwordSignaturePlaceholder') as HTMLInputElement;
    expect(signatureInput).toBeDefined();
    expect(signatureInput.type).toBe('password');
    fireEvent.change(signatureInput, { target: { value: 'M. Martin' } });

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

    // Remplir le formulaire (10 critères)
    // Chaque critère a 5 boutons, donc il y a 10 boutons avec le texte COMPLETELY_AGREE (un par critère)
    const excellentButtons = screen.getAllByText('siteAssessment.ratings.COMPLETELY_AGREE');
    // Cliquer sur tous les boutons COMPLETELY_AGREE (un pour chaque critère)
    excellentButtons.forEach(button => {
      fireEvent.click(button);
    });

    // Attendre que le champ salaryHourlyRate apparaisse (car le critère salary est maintenant évalué)
    // et le remplir
    let salaryInput: HTMLInputElement;
    await waitFor(() => {
      salaryInput = screen.getByPlaceholderText('siteAssessment.salaryPerHourPlaceholder') as HTMLInputElement;
      expect(salaryInput).toBeInTheDocument();
    }, { timeout: 2000 });
    fireEvent.change(salaryInput!, { target: { value: '25' } });

    // Sélectionner l'appréciation globale (requis)
    const excellentAppreciationButton = screen.getByRole('button', { name: 'siteAssessment.appreciationOptions.EXCELLENT' });
    fireEvent.click(excellentAppreciationButton);

    // Remplir les heures par semaine (requis)
    // Trouver les labels et ensuite les inputs dans le même conteneur parent
    const hoursFirstMonthLabel = screen.getByText('siteAssessment.hoursPerWeekFirstMonth');
    const hoursFirstMonthContainer = hoursFirstMonthLabel.closest('div[class*="border"]') as HTMLElement;
    expect(hoursFirstMonthContainer).toBeDefined();
    const hoursFirstMonthInput = within(hoursFirstMonthContainer).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(hoursFirstMonthInput, { target: { value: '35' } });

    const hoursSecondMonthLabel = screen.getByText('siteAssessment.hoursPerWeekSecondMonth');
    const hoursSecondMonthContainer = hoursSecondMonthLabel.closest('div[class*="border"]') as HTMLElement;
    expect(hoursSecondMonthContainer).toBeDefined();
    const hoursSecondMonthInput = within(hoursSecondMonthContainer).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(hoursSecondMonthInput, { target: { value: '35' } });

    const hoursThirdMonthLabel = screen.getByText('siteAssessment.hoursPerWeekThirdMonth');
    const hoursThirdMonthContainer = hoursThirdMonthLabel.closest('div[class*="border"]') as HTMLElement;
    expect(hoursThirdMonthContainer).toBeDefined();
    const hoursThirdMonthInput = within(hoursThirdMonthContainer).getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(hoursThirdMonthInput, { target: { value: '35' } });

    // Sélectionner "Non" pour les quarts de travail variables (pour éviter de devoir remplir workShiftTimes)
    const noVariableShiftsButton = screen.getByRole('button', { name: /siteAssessment\.no/i });
    fireEvent.click(noVariableShiftsButton);

    // Trouver le champ de signature - c'est un champ password
    const signatureInput = screen.getByPlaceholderText('siteAssessment.passwordSignaturePlaceholder') as HTMLInputElement;
    expect(signatureInput).toBeDefined();
    expect(signatureInput.type).toBe('password');
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

