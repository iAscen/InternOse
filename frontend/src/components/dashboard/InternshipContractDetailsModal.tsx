import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InternshipContract } from '~/interfaces';
import { userAPI } from '~/services/UserAPI';
import { internshipManagerAPI } from '~/services/InternshipManagerAPI';
import { studentAPI } from '~/services/StudentAPI';
import { employerAPI } from '~/services/EmployerAPI';

interface InternshipContractDetailsModalProps {
  contract: InternshipContract;
  onClose: () => void;
  onContractUpdate?: () => void;
  onIsAssigningProfessor?: () => void;
}

export default function InternshipContractDetailsModal({
  contract,
  onClose,
  onContractUpdate,
  onIsAssigningProfessor
}: InternshipContractDetailsModalProps) {
  const { t } = useTranslation();
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const userRole = userAPI.getUserRole();
  const isInternshipManager = userRole === 'INTERNSHIP_MANAGER';
  const isStudent = userRole === 'STUDENT';
  const isEmployer = userRole === 'EMPLOYER';
  
  // Déterminer qui peut signer
  // Le gestionnaire ne peut signer que si l'étudiant ET l'employeur ont déjà signé
  const canSignAsManager = isInternshipManager && !contract.isSignedInternshipManager && contract.isSignedStudent && contract.isSignedEmployer;
  const canSignAsStudent = isStudent && !contract.isSignedStudent;
  const canSignAsEmployer = isEmployer && !contract.isSignedEmployer;
  const canSign = canSignAsManager || canSignAsStudent || canSignAsEmployer;

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleAssignmentOfProfessor = async () => {
    if (onIsAssigningProfessor) {
      onIsAssigningProfessor()
      onClose()
    }
  }

  const handleUnassignmentOfProfessor = async () => {
    try {
      console.log("Comencement de handleUnassignementOfProfessor")
      const response = await internshipManagerAPI.assignProfessorToContract(contract.id, null)

      if (response.success && onContractUpdate) {
        onContractUpdate()
        onClose()
      }
      else
        setError(response.error!)
    }
    catch(err) {
      setError(t('internshipContract.errors.professorAssignmentFailed'))
    }
  }

  const handleSignContract = async () => {
    if (!canSign) return;
    
    setIsSigning(true);
    setError(null);
    
    try {
      let response;
      
      if (canSignAsManager) {
        // Le gestionnaire signe en dernier - vérifier que l'étudiant et l'employeur ont signé
        if (!contract.isSignedStudent || !contract.isSignedEmployer) {
          setError(t('internshipContract.managerMustSignLast') || 'Le gestionnaire de stages doit signer en dernier. L\'étudiant et l\'employeur doivent signer d\'abord.');
          setIsSigning(false);
          return;
        }
        response = await internshipManagerAPI.signContract(contract.id);
      } else if (canSignAsStudent) {
        if (!contract.internshipOfferId) {
          setError(t('internshipContract.missingOfferId') || 'ID de l\'offre manquant');
          setIsSigning(false);
          return;
        }
        response = await studentAPI.signContract(contract.internshipOfferId);
      } else if (canSignAsEmployer) {
        if (!contract.internshipOfferId || !contract.studentId) {
          setError(t('internshipContract.missingIds') || 'Informations manquantes pour signer');
          setIsSigning(false);
          return;
        }
        response = await employerAPI.signContract(contract.internshipOfferId, contract.studentId);
      } else {
        setError(t('internshipContract.cannotSign') || 'Vous ne pouvez pas signer ce contrat');
        setIsSigning(false);
        return;
      }
      
      if (response.success) {
        // Appeler le callback pour mettre à jour la liste des contrats
        if (onContractUpdate) {
          onContractUpdate();
        }
        // Fermer le modal après signature réussie
        onClose();
      } else {
        setError(response.error || t('internshipContract.signError'));
      }
    } catch (err) {
      setError(t('internshipContract.signError') || 'Erreur lors de la signature');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('internshipContract.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {contract.internshipOfferTitle || t('internshipContract.contractTitle', { id: contract.id })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('internshipContract.generalInformation')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.student')}</p>
                <p className="text-sm text-gray-900">
                  {contract.studentFirstName} {contract.studentLastName}
                </p>
              </div>
              {contract.employerCompany && (
                <div>
                  <p className="text-sm font-medium text-gray-700">{t('internshipContract.employer')}</p>
                  <p className="text-sm text-gray-900">{contract.employerCompany}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.startDate')}</p>
                <p className="text-sm text-gray-900">{formatDate(contract.startDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.endDate')}</p>
                <p className="text-sm text-gray-900">{formatDate(contract.endDate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.weeklyHours')}</p>
                <p className="text-sm text-gray-900">{contract.weeklyHours} {t('internshipContract.hoursPerWeek')}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('internshipContract.tasks')}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.tasks}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('internshipContract.educationalObjectives')}
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.educationalObjectives}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('internshipContract.supervisor')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.supervisorName')}</p>
                <p className="text-sm text-gray-900">{contract.supervisorName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.supervisorTitle')}</p>
                <p className="text-sm text-gray-900">{contract.supervisorTitle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.supervisorEmail')}</p>
                <p className="text-sm text-gray-900">{contract.supervisorEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.supervisorPhone')}</p>
                <p className="text-sm text-gray-900">{contract.supervisorPhone}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className='flex'>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('internshipContract.professor')}
              </h3>
              {isInternshipManager && <div>
                <button onClick={() => handleAssignmentOfProfessor()} className="rounded-sm ms-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.25 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-150">
                  {t('internshipContract.assign')}
                </button>
                {contract.professorEmail && <button onClick={() => handleUnassignmentOfProfessor()} className="rounded-sm ms-2 bg-red-600 text-white text-xs font-medium px-2 py-0.25 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors duration-150">
                  {t('internshipContract.unassign')}
                </button>}
              </div>}
            </div>
            {contract.professorEmail && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.professorName')}</p>
                <p className="text-sm text-gray-900">{contract.professorFirstName} {contract.professorLastName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('internshipContract.professorEmail')}</p>
                <p className="text-sm text-gray-900">{contract.professorEmail}</p>
              </div>
            </div>}
            {contract.professorEmail == undefined && 
              <div className="text-sm text-gray-900">{t('internshipContract.noProfessorAssigned')}</div>
            }
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('internshipContract.signatures')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{t('internshipContract.student')}</span>
                <span className={`text-sm font-medium ${contract.isSignedStudent ? 'text-green-600' : 'text-gray-400'}`}>
                  {contract.isSignedStudent ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{t('internshipContract.employer')}</span>
                <span className={`text-sm font-medium ${contract.isSignedEmployer ? 'text-green-600' : 'text-gray-400'}`}>
                  {contract.isSignedEmployer ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{t('internshipContract.internshipManager')}</span>
                <span className={`text-sm font-medium ${contract.isSignedInternshipManager ? 'text-green-600' : 'text-gray-400'}`}>
                  {contract.isSignedInternshipManager ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 flex-shrink-0 border-t border-gray-200 bg-gray-50">
            {canSign && (
              <button
                onClick={handleSignContract}
                disabled={isSigning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSigning ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('internshipContract.signing') || 'Signature en cours...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    {t('internshipContract.sign') || 'Signer l\'entente'}
                  </>
                )}
              </button>
            )}
            {isInternshipManager && !contract.isSignedInternshipManager && (!contract.isSignedStudent || !contract.isSignedEmployer) && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                {t('internshipContract.waitingForSignatures') || 'En attente des signatures de l\'étudiant et de l\'employeur'}
              </div>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('common.close') || 'Fermer'}
            </button>
        </div>
      </div>
    </div>
  );
}

