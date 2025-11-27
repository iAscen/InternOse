import { useTranslation } from 'react-i18next';
import type { InternshipContract } from '~/interfaces';

interface ProfessorStudentDetailsModalProps {
  contract: InternshipContract;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfessorStudentDetailsModal({
  contract,
  isOpen,
  onClose,
}: ProfessorStudentDetailsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getContractStatus = (): string => {
    const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
    if (allSigned) {
      return t('professor.contractFullySigned');
    }
    const anySigned = contract.isSignedStudent || contract.isSignedEmployer || contract.isSignedInternshipManager;
    if (anySigned) {
      return t('professor.contractPartiallySigned');
    }
    return t('professor.contractPending');
  };

  const getStatusBadgeColor = (): string => {
    const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
    if (allSigned) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    const anySigned = contract.isSignedStudent || contract.isSignedEmployer || contract.isSignedInternshipManager;
    if (anySigned) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
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
        {/* Header */}
        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {t('professor.studentDetails')}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {contract.studentFirstName} {contract.studentLastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('common.close')}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Student Information */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('professor.studentInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">{t('professor.studentName')}</label>
                <p className="text-base text-gray-900 mt-1">
                  {contract.studentFirstName} {contract.studentLastName}
                </p>
              </div>
              {contract.studentEmail && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.studentEmail')}</label>
                  <p className="text-base text-gray-900 mt-1">
                    <a href={`mailto:${contract.studentEmail}`} className="text-indigo-600 hover:text-indigo-800">
                      {contract.studentEmail}
                    </a>
                  </p>
                </div>
              )}
              {contract.studentProgram && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.studentProgram')}</label>
                  <p className="text-base text-gray-900 mt-1">{contract.studentProgram}</p>
                </div>
              )}
              {contract.internshipOfferSession && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.session')}</label>
                  <p className="text-base text-gray-900 mt-1">
                    {(() => {
                      const parts = contract.internshipOfferSession.split(/[-\s]+/);
                      const year = parts[1] || '';
                      return t('common.winterSession', { year });
                    })()}
                  </p>
                </div>
              )}
              {contract.internshipOfferTitle && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">{t('professor.internshipTitle')}</label>
                  <p className="text-base text-gray-900 mt-1">{contract.internshipOfferTitle}</p>
                </div>
              )}
            </div>
          </section>

          {/* Workplace Information */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('professor.workplaceInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contract.employerCompany && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.companyName')}</label>
                  <p className="text-base text-gray-900 mt-1">{contract.employerCompany}</p>
                </div>
              )}
              {contract.internshipOfferAddress && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.companyAddress')}</label>
                  <p className="text-base text-gray-900 mt-1">{contract.internshipOfferAddress}</p>
                </div>
              )}
            </div>
          </section>

          {/* Supervisor Information */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('professor.supervisorInfo')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contract.supervisorName && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.supervisorName')}</label>
                  <p className="text-base text-gray-900 mt-1">{contract.supervisorName}</p>
                </div>
              )}
              {contract.supervisorTitle && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.supervisorTitle')}</label>
                  <p className="text-base text-gray-900 mt-1">{contract.supervisorTitle}</p>
                </div>
              )}
              {contract.supervisorEmail && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.supervisorEmail')}</label>
                  <p className="text-base text-gray-900 mt-1">
                    <a href={`mailto:${contract.supervisorEmail}`} className="text-indigo-600 hover:text-indigo-800">
                      {contract.supervisorEmail}
                    </a>
                  </p>
                </div>
              )}
              {contract.supervisorPhone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">{t('professor.supervisorPhone')}</label>
                  <p className="text-base text-gray-900 mt-1">
                    <a href={`tel:${contract.supervisorPhone}`} className="text-indigo-600 hover:text-indigo-800">
                      {contract.supervisorPhone}
                    </a>
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Internship Period */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('professor.period')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">{t('professor.startDate')}</label>
                <p className="text-base text-gray-900 mt-1">{formatDate(contract.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('professor.endDate')}</label>
                <p className="text-base text-gray-900 mt-1">{formatDate(contract.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">{t('professor.weeklyHours')}</label>
                <p className="text-base text-gray-900 mt-1">
                  {contract.weeklyHours} {t('internshipContract.hoursPerWeek')}
                </p>
              </div>
            </div>
          </section>

          {/* Contract Status */}
          <section className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('professor.contractStatus')}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor()}`}>
                {getContractStatus()}
              </span>
              <div className="text-sm text-gray-600 flex flex-wrap gap-2">
                <span className={contract.isSignedStudent ? 'text-green-600' : 'text-gray-400'}>
                  {t('internshipContract.student')}: {contract.isSignedStudent ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                </span>
                <span className="text-gray-300">•</span>
                <span className={contract.isSignedEmployer ? 'text-green-600' : 'text-gray-400'}>
                  {t('internshipContract.employer')}: {contract.isSignedEmployer ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                </span>
                <span className="text-gray-300">•</span>
                <span className={contract.isSignedInternshipManager ? 'text-green-600' : 'text-gray-400'}>
                  {t('internshipContract.internshipManager')}: {contract.isSignedInternshipManager ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                </span>
              </div>
            </div>
          </section>

          {/* Educational Objectives */}
          {contract.educationalObjectives && (
            <section className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('professor.internshipObjectives')}
              </h3>
              <p className="text-base text-gray-700 whitespace-pre-wrap">{contract.educationalObjectives}</p>
            </section>
          )}

          {/* Tasks */}
          {contract.tasks && (
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('professor.tasks')}
              </h3>
              <p className="text-base text-gray-700 whitespace-pre-wrap">{contract.tasks}</p>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
}

