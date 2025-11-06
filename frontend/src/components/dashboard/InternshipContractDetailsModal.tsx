import { useTranslation } from 'react-i18next';
import type { InternshipContract } from '~/interfaces';

interface InternshipContractDetailsModalProps {
  contract: InternshipContract;
  onClose: () => void;
}

export default function InternshipContractDetailsModal({
  contract,
  onClose
}: InternshipContractDetailsModalProps) {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
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

        <div className="p-6">
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

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

