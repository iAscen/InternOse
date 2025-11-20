import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import OfferList from '../dashboard/OfferList';
import type { InternshipOffer } from '~/interfaces';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Mock StudentAPI
vi.mock('~/services/StudentAPI', () => ({
  studentAPI: {
    respondToOffer: vi.fn(),
    getInternshipContract: vi.fn()
  }
}));

// Mock UserAPI
vi.mock('~/services/UserAPI', () => ({
  userAPI: {
    getEmployerIdFromJWT: vi.fn(async () => 1),
  }
}));

describe('EQ6-112 - Historique des offres de stage pour Employeur (FE)', () => {
  const mockSelectOffer = vi.fn();
  const mockOnSessionChange = vi.fn();

  const mockEmployerPastOffersSession1: InternshipOffer[] = [
    {
      id: 1,
      title: 'Développeur Backend',
      description: 'Développement API REST',
      program: 'Informatique',
      requiredSkills: 'Java, Spring Boot',
      duration: 12,
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      salary: 22,
      address: 'Montréal, QC',
      verificationStatus: 'APPROVED',
      applicationId: 1,
      session: 'Winter-2024'
    },
    {
      id: 2,
      title: 'Développeur Frontend',
      description: 'Développement interfaces React',
      program: 'Informatique',
      requiredSkills: 'React, TypeScript',
      duration: 12,
      startDate: '2024-01-15',
      endDate: '2024-04-15',
      salary: 20,
      address: 'Québec, QC',
      verificationStatus: 'APPROVED',
      applicationId: 2,
      session: 'Winter-2024'
    }
  ];

  const mockEmployerPastOffersSession2: InternshipOffer[] = [
    {
      id: 3,
      title: 'Analyste de données',
      description: 'Analyse et reporting',
      program: 'Informatique',
      requiredSkills: 'Python, SQL',
      duration: 12,
      startDate: '2023-09-01',
      endDate: '2023-12-01',
      salary: 21,
      address: 'Laval, QC',
      verificationStatus: 'APPROVED',
      applicationId: 3,
      session: 'Autumn-2023'
    }
  ];

  const allMockEmployerPastOffers = [...mockEmployerPastOffersSession1, ...mockEmployerPastOffersSession2];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Affichage du mode historique pour Employeur', () => {
    it('devrait afficher un message d\'information en mode historique pour l\'employeur', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={true}
          availableSessions={['Winter-2024', 'Autumn-2023']}
        />
      );

      expect(screen.getByText('dashboard.internshipApplications.viewOnlyMode')).toBeInTheDocument();
    });

    it('ne devrait pas afficher le message d\'information en mode normal', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={mockEmployerPastOffersSession1}
          numbersOfApplications={new Map()}
          isHistory={false}
        />
      );

      expect(screen.queryByText('dashboard.internshipApplications.viewOnlyMode')).not.toBeInTheDocument();
    });
  });

  describe('Sélection de session par défaut - Employeur', () => {
    it('devrait sélectionner automatiquement la première session pour l\'employeur', () => {
      const availableSessions = ['Winter-2024', 'Autumn-2023'];

      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={true}
          availableSessions={availableSessions}
          onSessionChange={mockOnSessionChange}
        />
      );

      expect(mockOnSessionChange).toHaveBeenCalledWith('Winter-2024');
    });

    it('devrait utiliser la session fournie si elle est spécifiée', () => {
      const availableSessions = ['Winter-2024', 'Autumn-2023'];

      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={true}
          availableSessions={availableSessions}
          selectedSession="Autumn-2023"
          onSessionChange={mockOnSessionChange}
        />
      );

      // Ne devrait pas appeler onSessionChange car une session est déjà spécifiée
      expect(mockOnSessionChange).not.toHaveBeenCalled();
    });
  });

  describe('Filtrage des offres par session - Employeur', () => {
    it('devrait afficher uniquement les offres de l\'employeur pour la session sélectionnée', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024', 'Autumn-2023']}
        />
      );

      // Devrait afficher les offres de Winter-2024
      expect(screen.getByText('Développeur Backend')).toBeInTheDocument();
      expect(screen.getByText('Développeur Frontend')).toBeInTheDocument();

      // Ne devrait pas afficher les offres d'Autumn-2023
      expect(screen.queryByText('Analyste de données')).not.toBeInTheDocument();
    });

    it('devrait changer les offres affichées quand on change de session', () => {
      const { rerender } = render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024', 'Autumn-2023']}
        />
      );

      expect(screen.getByText('Développeur Backend')).toBeInTheDocument();
      expect(screen.queryByText('Analyste de données')).not.toBeInTheDocument();

      // Changer la session
      rerender(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={true}
          selectedSession="Autumn-2023"
          availableSessions={['Winter-2024', 'Autumn-2023']}
        />
      );

      // Maintenant devrait afficher les offres d'Autumn-2023
      expect(screen.getByText('Analyste de données')).toBeInTheDocument();
      expect(screen.queryByText('Développeur Backend')).not.toBeInTheDocument();
    });

    it('devrait afficher toutes les offres de l\'employeur quand isHistory est false', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={false}
        />
      );

      // Devrait afficher toutes les offres sans filtrage
      expect(screen.getByText('Développeur Backend')).toBeInTheDocument();
      expect(screen.getByText('Développeur Frontend')).toBeInTheDocument();
      expect(screen.getByText('Analyste de données')).toBeInTheDocument();
    });
  });

  describe('Affichage des boutons d\'action en mode historique - Employeur', () => {
    it('ne devrait pas afficher les boutons d\'action en mode historique', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={mockEmployerPastOffersSession1}
          numbersOfApplications={new Map()}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024']}
        />
      );

      // Pas de boutons d'action en mode historique
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBe(0);
    });

    it('devrait afficher les boutons d\'action en mode normal', () => {
      const offerWithApplications = {
        ...mockEmployerPastOffersSession1[0],
        applicationStatus: 'APPROVED'
      };

      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={[offerWithApplications]}
          numbersOfApplications={new Map()}
          isHistory={false}
        />
      );

      // Devrait avoir des boutons d'action disponibles
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Affichage de la session sur les cartes - Employeur', () => {
    it('devrait afficher la session sur chaque carte d\'offre de l\'employeur', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={mockEmployerPastOffersSession1}
          numbersOfApplications={new Map()}
          isHistory={false}
        />
      );

      // Vérifier que la session est affichée
      const sessionElements = screen.getAllByText('Winter-2024');
      expect(sessionElements.length).toBeGreaterThan(0);
    });

    it('devrait afficher différentes sessions pour différentes offres de l\'employeur', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={false}
        />
      );

      // Vérifier que les deux sessions sont présentes
      expect(screen.getAllByText('Winter-2024').length).toBeGreaterThan(0);
      expect(screen.getByText('Autumn-2023')).toBeInTheDocument();
    });
  });

  describe('Interaction avec les offres en mode historique - Employeur', () => {
    it('devrait permettre de cliquer sur une offre approuvée en mode historique', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={mockEmployerPastOffersSession1}
          numbersOfApplications={new Map()}
          isHistory={true}
          selectedSession="Winter-2024"
          availableSessions={['Winter-2024']}
          selectOffer={mockSelectOffer}
        />
      );

      // Cliquer sur la première offre
      const offerCard = screen.getByText('Développeur Backend').closest('div[class*="p-6"]');
      if (offerCard) {
        fireEvent.click(offerCard);
        expect(mockSelectOffer).toHaveBeenCalledWith(mockEmployerPastOffersSession1[0]);
      }
    });
  });

  describe('Gestion des sessions vides - Employeur', () => {
    it('devrait gérer le cas où availableSessions est vide', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
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
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={allMockEmployerPastOffers}
          numbersOfApplications={new Map()}
          isHistory={true}
        />
      );

      // Devrait afficher toutes les offres sans filtrage
      expect(screen.getByText('Développeur Backend')).toBeInTheDocument();
      expect(screen.getByText('Développeur Frontend')).toBeInTheDocument();
      expect(screen.getByText('Analyste de données')).toBeInTheDocument();
    });
  });

  describe('Message d\'absence d\'offres - Employeur', () => {
    it('devrait afficher un message si aucune offre ne correspond à la session sélectionnée', () => {
      render(
        <OfferList
          isStudent={false}
          isEmployer={true}
          loading={false}
          offers={mockEmployerPastOffersSession1}
          numbersOfApplications={new Map()}
          isHistory={true}
          selectedSession="Summer-2023"
          availableSessions={['Winter-2024', 'Summer-2023']}
        />
      );

      // Devrait afficher le message d'absence d'offres
      expect(screen.getByText('im.internshipOffersSectionEmpty')).toBeInTheDocument();
    });
  });
});

