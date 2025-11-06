import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { InternshipContract } from '~/interfaces';
import InternshipContractDetailsModal from '~/components/dashboard/InternshipContractDetailsModal';

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

  const getStatusBadge = (contract: InternshipContract) => {
    const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
    
    if (allSigned) {
      return (
        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {t('internshipContract.fullySigned')}
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
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
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">{t('common.loading')}</p>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        {t('internshipContract.noContracts')}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            onClick={() => setSelectedContract(contract)}
            className="bg-white shadow-lg rounded-lg p-6 cursor-pointer hover:shadow-xl transition-shadow border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {contract.internshipOfferTitle || t('internshipContract.contractTitle', { id: contract.id })}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">{t('internshipContract.student')}:</span>{' '}
                    {contract.studentFirstName} {contract.studentLastName}
                  </p>
                  {contract.employerCompany && (
                    <p>
                      <span className="font-medium">{t('internshipContract.employer')}:</span>{' '}
                      {contract.employerCompany}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">{t('internshipContract.period')}:</span>{' '}
                    {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                  </p>
                </div>
              </div>
              <div className="ml-4">
                {getStatusBadge(contract)}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs">
                <div className="flex flex-wrap gap-4">
                  <span className={contract.isSignedStudent ? 'text-green-600' : 'text-gray-400'}>
                    {t('internshipContract.student')}: {contract.isSignedStudent ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                  </span>
                  <span className={contract.isSignedEmployer ? 'text-green-600' : 'text-gray-400'}>
                    {t('internshipContract.employer')}: {contract.isSignedEmployer ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                  </span>
                  <span className={contract.isSignedInternshipManager ? 'text-green-600' : 'text-gray-400'}>
                    {t('internshipContract.internshipManager')}: {contract.isSignedInternshipManager ? t('internshipContract.signed') : t('internshipContract.notSigned')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedContract && (
        <InternshipContractDetailsModal
          contract={selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </>
  );
}

