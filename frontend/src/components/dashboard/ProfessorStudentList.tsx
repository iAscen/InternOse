import { useTranslation } from 'react-i18next';
import type { InternshipContract } from '~/interfaces';

interface ProfessorStudentListProps {
  contracts: InternshipContract[];
  onContractSelect: (contract: InternshipContract) => void;
  onEvaluateSite: (contract: InternshipContract) => void;
  getStatusBadgeColor: (contract: InternshipContract) => string;
  getContractStatus: (contract: InternshipContract) => string;
  formatDate: (dateString: string | undefined) => string;
}

export default function ProfessorStudentList({
  contracts,
  onContractSelect,
  onEvaluateSite,
  getStatusBadgeColor,
  getContractStatus,
  formatDate
}: ProfessorStudentListProps) {
  const { t } = useTranslation();

  if (contracts.length === 0) {
    return (
      <div className="text-center p-6 text-sm font-medium text-slate-500">
        <p className="text-slate-700">{t('professor.noStudentFound')}</p>
      </div>
    );
  }

  return (
    <div className="min-w-full overflow-x-auto rounded-sm">
      <div className="space-y-4">
        {contracts.map((contract) => (
          <div
            key={contract.id}
            className="rounded-lg border border-slate-200 bg-white p-6 hover:bg-slate-50 transition-colors relative"
          >
            {/* Status badge - Top right */}
            <div className="absolute top-6 right-6">
              <span className={`inline-block rounded-full border px-2 py-1 text-xs leading-4 font-semibold ${getStatusBadgeColor(contract)}`}>
                {getContractStatus(contract)}
              </span>
            </div>

            <div className="flex-1 pr-20">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {contract.studentFirstName} {contract.studentLastName}
              </h3>
              {contract.internshipOfferTitle && (
                <p className="text-sm text-slate-600 mb-4">
                  {contract.internshipOfferTitle}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contract.studentEmail && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {t('professor.studentEmail')}
                    </label>
                    <p className="text-sm text-slate-900 mt-1">
                      <a href={`mailto:${contract.studentEmail}`} className="text-indigo-600 hover:text-indigo-800">
                        {contract.studentEmail}
                      </a>
                    </p>
                  </div>
                )}
                {contract.studentProgram && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {t('professor.studentProgram')}
                    </label>
                    <p className="text-sm text-slate-900 mt-1">{contract.studentProgram}</p>
                  </div>
                )}
                {contract.internshipOfferSession && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {t('professor.session')}
                    </label>
                    <p className="text-sm text-slate-900 mt-1">{contract.internshipOfferSession}</p>
                  </div>
                )}
                {contract.employerCompany && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {t('professor.companyName')}
                    </label>
                    <p className="text-sm text-slate-900 mt-1">{contract.employerCompany}</p>
                  </div>
                )}
                {contract.internshipOfferAddress && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {t('professor.companyAddress')}
                    </label>
                    <p className="text-sm text-slate-900 mt-1">{contract.internshipOfferAddress}</p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    {t('professor.period')}
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                  </p>
                </div>
                {contract.supervisorName && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {t('professor.supervisorName')}
                    </label>
                    <p className="text-sm text-slate-900 mt-1">{contract.supervisorName}</p>
                  </div>
                )}
                {contract.supervisorEmail && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {t('professor.supervisorEmail')}
                    </label>
                    <p className="text-sm text-slate-900 mt-1">
                      <a href={`mailto:${contract.supervisorEmail}`} className="text-indigo-600 hover:text-indigo-800">
                        {contract.supervisorEmail}
                      </a>
                    </p>
                  </div>
                )}
                {contract.supervisorPhone && (
                  <div>
                    <label className="text-xs font-medium text-slate-500 uppercase">
                      {t('professor.supervisorPhone')}
                    </label>
                    <p className="text-sm text-slate-900 mt-1">
                      <a href={`tel:${contract.supervisorPhone}`} className="text-indigo-600 hover:text-indigo-800">
                        {contract.supervisorPhone}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons - Bottom right */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3">
              <button
                onClick={() => onEvaluateSite(contract)}
                className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('siteAssessment.evaluateSite')}
              </button>
              <button
                onClick={() => onContractSelect(contract)}
                className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('professor.viewDetails')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

