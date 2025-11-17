import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OfferList from '../dashboard/OfferList';
import type { InternshipOffer } from '~/interfaces';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('~/services/StudentAPI', () => ({
  studentAPI: {
    respondToOffer: vi.fn(),
    getInternshipContract: vi.fn()
  }
}));

vi.mock('~/services/UserAPI', () => ({
  userAPI: {
    getStudentIdFromJWT: vi.fn()
  }
}));

describe('OfferList - Fonctionnalités d\'historique et de sessions', () => {
  const mockSelectOffer = vi.fn();
  const mockOnSessionChange = vi.fn();

  const mockOffersSession1: InternshipOffer[] = [
    {
      id: 1,
      title: 'Développeur Full Stack',
      description: 'Développement d\'applications web',
      program: 'Informatique',
      requiredSkills: 'React, Node.js',
      duration: 12,
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      salary: 20,
      address: 'Montréal, QC',
      verificationStatus: 'APPROVED',
      applicationId: 1,
      session: 'Winter-2024'
    },
    {
      id: 2,
      title: 'Analyste de données',
      description: 'Analyse et visualisation de données',
      program: 'Informatique',
      requiredSkills: 'Python, SQL',
      duration: 12,
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      salary: 22,
      address: 'Québec, QC',
      verificationStatus: 'APPROVED',
      applicationId: 2,
      session: 'Winter-2024'
    }
  ];

  const mockOffersSession2: InternshipOffer[] = [
    {
      id: 3,
      title: 'Designer UX/UI',
      description: 'Conception d\'interfaces utilisateur',
      program: 'Design',
      requiredSkills: 'Figma, Adobe XD',
      duration: 12,
      startDate: '2024-05-01',
      endDate: '2024-08-01',
      salary: 18,
      address: 'Laval, QC',
      verificationStatus: 'APPROVED',
      applicationId: 3,
      session: 'Autumn-2024'
    }
  ];

  const allMockOffers = [...mockOffersSession1, ...mockOffersSession2];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Affichage du mode historique', () => {
    it('devrait afficher un message d\'information lorsque isHistory est true', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
          availableSessions={['Winter-2024', 'Autumn-2024']}
        />
      );

      expect(screen.getByText('dashboard.internshipApplications.viewOnlyMode')).toBeInTheDocument();
    });

    it('ne devrait pas afficher le message d\'information lorsque isHistory est false', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={mockOffersSession1}
          numbersOfApplications={[]}
          isHistory={false}
        />
      );

      expect(screen.queryByText('dashboard.internshipApplications.viewOnlyMode')).not.toBeInTheDocument();
    });
  });

  describe('Sélection de session par défaut', () => {
    it('devrait sélectionner automatiquement la première session disponible quand isHistory est true', () => {
      const availableSessions = ['Winter-2024', 'Autumn-2024', 'Autumn-2024'];

      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
          availableSessions={availableSessions}
          onSessionChange={mockOnSessionChange}
        />
      );

      expect(mockOnSessionChange).toHaveBeenCalledWith('Winter-2024');
    });

    it('devrait utiliser la session fournie via selectedSession si elle est spécifiée', () => {
      const availableSessions = ['Winter-2024', 'Autumn-2024'];

      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
          availableSessions={availableSessions}
          selectedSession="Autumn-2024"
          onSessionChange={mockOnSessionChange}
        />
      );

      // Ne devrait pas appeler onSessionChange car une session est déjà spécifiée
      expect(mockOnSessionChange).not.toHaveBeenCalled();
    });

    it('ne devrait pas définir de session par défaut quand isHistory est false', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={mockOffersSession1}
          numbersOfApplications={[]}
          isHistory={false}
          onSessionChange={mockOnSessionChange}
        />
      );

      expect(mockOnSessionChange).not.toHaveBeenCalled();
    });
  });

  describe('Filtrage des offres par session', () => {
    it('devrait afficher uniquement les offres de la session sélectionnée en mode historique', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024', 'Autumn-2024']}
        />
      );

      // Devrait afficher les offres de la session Hiver 2024
      expect(screen.getByText('Développeur Full Stack')).toBeInTheDocument();
      expect(screen.getByText('Analyste de données')).toBeInTheDocument();

      // Ne devrait pas afficher les offres de la session Automne 2024
      expect(screen.queryByText('Designer UX/UI')).not.toBeInTheDocument();
    });

    it('devrait afficher les offres d\'une session différente lorsque selectedSession change', () => {
      const { rerender } = render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024', 'Autumn-2024']}
        />
      );

      expect(screen.getByText('Développeur Full Stack')).toBeInTheDocument();
      expect(screen.queryByText('Designer UX/UI')).not.toBeInTheDocument();

      // Changer la session
      rerender(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
          selectedSession="Autumn-2024"
          availableSessions={['Winter-2024', 'Autumn-2024']}
        />
      );

      // Maintenant devrait afficher les offres de la session Automne 2024
      expect(screen.getByText('Designer UX/UI')).toBeInTheDocument();
      expect(screen.queryByText('Développeur Full Stack')).not.toBeInTheDocument();
    });

    it('devrait afficher toutes les offres quand isHistory est false', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={false}
        />
      );

      // Devrait afficher toutes les offres sans filtrage
      expect(screen.getByText('Développeur Full Stack')).toBeInTheDocument();
      expect(screen.getByText('Analyste de données')).toBeInTheDocument();
      expect(screen.getByText('Designer UX/UI')).toBeInTheDocument();
    });

    it('devrait sélectionner automatiquement la première session disponible en mode historique', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
          availableSessions={['Winter-2024', 'Autumn-2024']}
          onSessionChange={mockOnSessionChange}
        />
      );

      // Quand availableSessions est fourni, la première session est automatiquement sélectionnée
      // Donc seules les offres de la session 'Hiver 2024' devraient être affichées
      expect(screen.getByText('Développeur Full Stack')).toBeInTheDocument();
      expect(screen.getByText('Analyste de données')).toBeInTheDocument();
      expect(screen.queryByText('Designer UX/UI')).not.toBeInTheDocument();
    });
  });

  describe('Affichage des boutons d\'action en mode historique', () => {
    it('ne devrait pas afficher les boutons d\'action primaires quand isHistory est true', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={mockOffersSession1}
          numbersOfApplications={[]}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024']}
        />
      );

      // Vérifier qu'il n'y a pas de boutons d'action visibles
      // Les boutons sont rendus uniquement si !isHistory
      const buttons = screen.queryAllByRole('button');
      // On s'attend à ce qu'il n'y ait pas de boutons d'action sur les offres
      expect(buttons.length).toBe(0);
    });

    it('devrait afficher les boutons d\'action quand isHistory est false', () => {
      const offerWithPendingStatus = {
        ...mockOffersSession1[0],
        applicationStatus: 'APPROVED'
      };

      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={[offerWithPendingStatus]}
          numbersOfApplications={[]}
          isHistory={false}
          cvStatus="approved"
        />
      );

      // Devrait avoir des boutons d'action disponibles
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Gestion de plusieurs sessions', () => {
    it('devrait filtrer correctement les offres lorsqu\'il y a plusieurs sessions disponibles', () => {
      const multiSessionOffers: InternshipOffer[] = [
        { ...mockOffersSession1[0], session: 'Winter-2024' },
        { ...mockOffersSession1[1], session: 'Winter-2024' },
        { ...mockOffersSession2[0], session: 'Winter-2024' },
        {
          id: 4,
          title: 'Développeur Mobile',
          description: 'Développement d\'applications mobiles',
          program: 'Informatique',
          requiredSkills: 'React Native, Swift',
          duration: 12,
          startDate: '2024-09-01',
          endDate: '2024-12-01',
          salary: 25,
          address: 'Sherbrooke, QC',
          verificationStatus: 'APPROVED',
          applicationId: 4,
          session: 'Autumn-2024'
        }
      ];

      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={multiSessionOffers}
          numbersOfApplications={[]}
          isHistory={true}
          selectedSession="Autumn-2024"
          availableSessions={['Winter-2024', 'Autumn-2024', 'Autumn-2024']}
        />
      );

      // Devrait afficher uniquement l'offre de la session Automne 2024
      expect(screen.getByText('Développeur Mobile')).toBeInTheDocument();
      expect(screen.queryByText('Développeur Full Stack')).not.toBeInTheDocument();
      expect(screen.queryByText('Analyste de données')).not.toBeInTheDocument();
      expect(screen.queryByText('Designer UX/UI')).not.toBeInTheDocument();
    });

    it('devrait afficher un message si aucune offre ne correspond à la session sélectionnée', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={mockOffersSession1}
          numbersOfApplications={[]}
          isHistory={true}
          selectedSession="Autumn-2024"
          availableSessions={['Winter-2024', 'Autumn-2024', 'Autumn-2024']}
        />
      );

      // Devrait afficher le message d'absence d'offres
      expect(screen.getByText('im.internshipOffersSectionEmpty')).toBeInTheDocument();
    });
  });

  describe('Affichage de la session sur les cartes d\'offre', () => {
    it('devrait afficher la session sur chaque carte d\'offre', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={mockOffersSession1}
          numbersOfApplications={[]}
          isHistory={false}
        />
      );

      // Vérifier que la session est affichée
      const sessionElements = screen.getAllByText('Winter-2024');
      expect(sessionElements.length).toBeGreaterThan(0);
    });

    it('devrait afficher différentes sessions pour différentes offres', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={false}
        />
      );

      // Vérifier que les deux sessions sont présentes
      expect(screen.getAllByText('Winter-2024').length).toBeGreaterThan(0);
      expect(screen.getByText('Autumn-2024')).toBeInTheDocument();
    });
  });

  describe('Comportement avec des sessions vides ou nulles', () => {
    it('devrait gérer correctement le cas où availableSessions est vide en mode historique', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
          availableSessions={[]}
          onSessionChange={mockOnSessionChange}
        />
      );

      // Ne devrait pas appeler onSessionChange si aucune session n'est disponible
      expect(mockOnSessionChange).not.toHaveBeenCalled();
    });

    it('devrait afficher toutes les offres si availableSessions n\'est pas fourni', () => {
      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={allMockOffers}
          numbersOfApplications={[]}
          isHistory={true}
        />
      );

      // Devrait afficher toutes les offres sans filtrage
      expect(screen.getByText('Développeur Full Stack')).toBeInTheDocument();
      expect(screen.getByText('Analyste de données')).toBeInTheDocument();
      expect(screen.getByText('Designer UX/UI')).toBeInTheDocument();
    });
  });

  describe('Intégration du filtrage de session avec d\'autres fonctionnalités', () => {
    it('devrait afficher les badges de statut correctement pour les offres filtrées par session', () => {
      const offersWithStatus = mockOffersSession1.map(offer => ({
        ...offer,
        applicationStatus: 'PENDING'
      }));

      render(
        <OfferList
          isStudent={true}
          isEmployer={false}
          loading={false}
          offers={offersWithStatus}
          numbersOfApplications={[]}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024', 'Autumn-2024']}
        />
      );

      // Devrait afficher les offres avec leurs statuts
      expect(screen.getByText('Développeur Full Stack')).toBeInTheDocument();
      const pendingBadges = screen.getAllByText('student.pending');
      expect(pendingBadges.length).toBe(2); // Une pour chaque offre de la session
    });

    it('devrait permettre de cliquer sur une offre approuvée en mode historique pour l\'Internship Manager', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={false}
          loading={false}
          offers={mockOffersSession1}
          numbersOfApplications={[]}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024']}
          selectOffer={mockSelectOffer}
        />
      );

      // Cliquer sur la première offre
      const offerCard = screen.getByText('Développeur Full Stack').closest('div[class*="p-6"]');
      if (offerCard) {
        fireEvent.click(offerCard);
        expect(mockSelectOffer).toHaveBeenCalledWith(mockOffersSession1[0]);
      }
    });
  });
});
