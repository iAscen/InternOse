import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InternshipContract } from '~/interfaces';
import InternshipContractDetailsModal from '~/components/dashboard/InternshipContractDetailsModal';
import InternshipAssessmentDetailsModal from "~/components/dashboard/InternshipAssessmentDetailsModal";

interface InternshipContractListProps {
  contracts: InternshipContract[];
  loading: boolean;
  onContractUpdate?: () => void;
}

export default function InternshipContractList({
  contracts,
  loading,
  onContractUpdate
}: InternshipContractListProps) {
  const { t } = useTranslation();
  const [selectedContract, setSelectedContract] = useState<InternshipContract | null>(null);
  const [selectedAssessmentContract, setSelectedAssessmentContract] = useState<InternshipContract | null>(null);

  const getStatusBadge = (contract: InternshipContract) => {
    const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
    
    if (allSigned) {
      return (
        <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs leading-4 font-semibold text-emerald-700">
          {t('internshipContract.fullySigned')}
        </span>
      );
    }
    
    return (
      <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs leading-4 font-semibold text-amber-700">
        {t('internshipContract.pendingSignatures')}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-sm font-medium text-slate-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center p-6 text-sm font-medium text-slate-500">
        {t('internshipContract.noContracts')}
      </div>
    );
  }

  return (
    <>
      <div className="min-w-full overflow-x-auto rounded-sm">
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="rounded-lg border border-slate-200 bg-white p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {contract.internshipOfferTitle || t('internshipContract.contractTitle', { id: contract.id })}
                    </h3>
                    <div className="text-sm font-medium text-slate-600 space-y-1 mb-4">
                      <p>
                        <span className="font-semibold text-slate-900">{t('internshipContract.student')}:</span>{' '}
                        {contract.studentFirstName} {contract.studentLastName}
                      </p>
                      {contract.employerCompany && (
                        <p>
                          <span className="font-semibold text-slate-900">{t('internshipContract.employer')}:</span>{' '}
                          {contract.employerCompany}
                        </p>
                      )}
                      <p>
                        <span className="font-semibold text-slate-900">{t('internshipContract.period')}:</span>{' '}
                        {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(contract)}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="text-xs font-medium text-slate-600 flex-1">
                    <div className="flex flex-wrap gap-4">
                      <span className={contract.isSignedStudent ? 'text-emerald-600' : 'text-slate-400'}>
                        {t('internshipContract.student')}: {contract.isSignedStudent ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                      </span>
                      <span className={contract.isSignedEmployer ? 'text-emerald-600' : 'text-slate-400'}>
                        {t('internshipContract.employer')}: {contract.isSignedEmployer ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                      </span>
                      <span className={contract.isSignedInternshipManager ? 'text-emerald-600' : 'text-slate-400'}>
                        {t('internshipContract.internshipManager')}: {contract.isSignedInternshipManager ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                      </span>
                    </div>
                  </div>
                  {contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager && (
                    <div className="flex items-center flex-shrink-0">

                      <button
                        onClick={() => setSelectedAssessmentContract(contract)}
                        className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {t('tk internshipAssessment.viewAssessment')}
                      </button>
                    </div>
                  )}
                  <div className="flex items-center flex-shrink-0">

                    <button
                      onClick={() => setSelectedContract(contract)}
                      className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {t('internshipContract.viewContract')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedContract && (
        <InternshipContractDetailsModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
          onContractUpdate={onContractUpdate}
        />
      )}

      { selectedAssessmentContract && (
          <InternshipAssessmentDetailsModal
          contract={selectedAssessmentContract}
          onClose={() => setSelectedAssessmentContract(null)}
          />
        )
      }
    </>
  );
}

