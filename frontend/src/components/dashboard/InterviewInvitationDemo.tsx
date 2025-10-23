import { useState } from 'react';
import InterviewInvitationModal from './InterviewInvitationModal';
import type { Cv, InternshipOffer } from '~/interfaces';

/**
 * Composant de démonstration pour tester la fonctionnalité de convocation
 * Ce composant peut être utilisé pour tester le modal d'invitation
 */
export default function InterviewInvitationDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Données de test
  const testStudent: Cv = {
    id: 1,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    program: '420.B0',
    institution: 'Cégep de Montréal',
    applicationDate: '2024-01-15T10:30:00',
    applicationStatus: 'PENDING',
    cvStatus: 'APPROVED',
    cvFileName: 'CV_Jean_Dupont.pdf',
    cvFileType: 'application/pdf'
  };

  const testOffer: InternshipOffer = {
    id: 1,
    title: 'Développeur Full Stack',
    description: 'Développement d\'applications web modernes',
    program: '420.B0',
    requiredSkills: 'React, Node.js, TypeScript',
    duration: 12,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    salary: 25.0,
    address: 'Montréal, QC',
    verificationStatus: 'APPROVED'
  };

  const handleInvitationSent = (invitation: any) => {
    console.log('Invitation sent:', invitation);
    alert('Convocation envoyée avec succès ! (Mode démo)');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Démonstration - Convocation d'étudiant</h2>
      <p className="mb-4 text-gray-600">
        Cliquez sur le bouton ci-dessous pour tester le modal de convocation.
      </p>
      
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Ouvrir le modal de convocation
      </button>

      <InterviewInvitationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={testStudent}
        internshipOffer={testOffer}
        onInvitationSent={handleInvitationSent}
      />
    </div>
  );
}
