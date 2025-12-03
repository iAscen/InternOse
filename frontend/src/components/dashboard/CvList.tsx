import {useState} from "react";
import { useTranslation } from "react-i18next";
import type {Cv} from "~/interfaces";
import CvValidationModal from "~/components/dashboard/CvValidationModal";

interface CvListProps {
    cvs: Cv[]

    loading: boolean;
    onCvValidation?: () => void;
}


export default function CvList({cvs, loading, onCvValidation}: CvListProps) {
  const { t } = useTranslation();
  const [selectedCv, setSelectedCv] = useState<Cv | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

    const handleValidateCv = (cv: Cv) => {
        setSelectedCv(cv);
        setIsModalOpen(true);
    };

    const handleValidationSuccess = () => {
        if (onCvValidation) {
            onCvValidation();
        }
    };

    const getCvStatusBadge = (status: string) => {
        // Convert status to lowercase for comparison
        const statusLower = status?.toLowerCase();
        
        if (statusLower === "approved") {
            return (
                <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs leading-4 font-semibold text-emerald-700">
                    {t('dashboard.validatedCvs')}
                </span>
            );
        } else if (statusLower === "rejected") {
            return (
                <span className="inline-block rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs leading-4 font-semibold text-red-700">
                    {t('dashboard.rejected')}
                </span>
            );
        } else if (statusLower === "pending") {
            return (
                <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs leading-4 font-semibold text-amber-700">
                    {t('dashboard.pending')}
                </span>
            );
        }
        return null;
    };

  if (Array.isArray(cvs) && cvs.length != 0) {
    return (
      <div className="min-w-full overflow-x-auto rounded-sm">
        <div className="divide-y divide-slate-100">
          {cvs.map((cv, index) => (
            <div 
              onClick={() => handleValidateCv(cv)} 
              className="p-6 cursor-pointer hover:bg-slate-50 transition-colors group" 
              key={index}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{cv.cvFileName}</p>
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    {getCvStatusBadge(cv.cvStatus)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{t("dashboard.student")}</h4>
                    <p className="text-sm font-medium text-slate-600">{cv.firstName} {cv.lastName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{t("common.email")}</h4>
                    <p className="text-sm font-medium text-slate-600">{cv.email}</p>
                  </div>
                  {cv.rejectionReason && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">{t("dashboard.rejectionReason")}</h4>
                      <p className="text-sm font-medium text-slate-600">{cv.rejectionReason}</p>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-500">
                        {t("dashboard.uploadedAt")}: {cv.uploadedAt}
                      </p>
                    </div>
                    {(!cv.cvStatus || cv.cvStatus?.toLowerCase() === 'pending') && (
                      <div className="flex items-center flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleValidateCv(cv);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {t('im.validateCv')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedCv && (
          <CvValidationModal
            cv={selectedCv}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCv(null);
            }}
            onValidationSuccess={handleValidationSuccess}
          />
        )}
      </div>
    );
  }
  
  return (
    <div></div>
  );
}