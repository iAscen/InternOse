import {useEffect, useState} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type {Cv, InternshipOffer} from "~/interfaces";
import OfferValidationModal from "~/components/dashboard/OfferValidationModal";
import CvValidationModal from "~/components/dashboard/CvValidationModal";

interface CvListProps {
    cvs: Cv[]

    loading: boolean;
    onCvValidation?: () => void;
}


export default function CvList({cvs, loading, onCvValidation}: CvListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCv, setSelectedCv] = useState<Cv | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
    console.log(cvs)
    }, [])

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
        if (status === "approved") {
            return (
                <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-green-100 text-green-800">
        {t('dashboard.validated')}
      </span>
            );
        } else if (status === "rejected") {
            return (
                <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-red-100 text-red-800">
        {t('dashboard.rejected')}
      </span>
            );
        } else if (status === "pending") {
            return (
                <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-yellow-100 text-yellow-800">
        {t('dashboard.pending')}
      </span>
            );
        }
        return null;
    };

  if (Array.isArray(cvs) && cvs.length != 0) {
    return (
      <div>
          {cvs.map((cv, index) => (
          <div onClick={() => handleValidateCv(cv)} className="text-gray-900 cursor-pointer hover:bg-blue-50 hover:shadow-lg hover:border-blue-200 border-2 border-transparent transition-all duration-200 shadow-md rounded-lg mb-2 p-5 group" key={index}>
            <div className="flex mb-4">
              <div className="flex-auto">
                <div className="flex items-center">
                  <p className="text-lg font-medium">{cv.cvFileName}</p>
                  <svg className="w-4 h-4 ml-2 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex-auto flex justify-end">
                  <div className="ml-4 flex flex-col items-end space-y-2">
                      {getCvStatusBadge(cv.cvStatus)}
                      {(!cv.cvStatus || cv.cvStatus === 'pending') && (
                          <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleValidateCv(cv);
                              }}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                          >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t('im.validateCv')}
                          </button>
                      )}
                  </div>
              </div>
            </div>
            <div className="mb-2">
              <h4 className="text-sm font-medium">{t("dashboard.student")}</h4>
              <p className="text-sm">{cv.firstName} {cv.lastName}</p>
            </div>
            <div className="mb-2">
              <h4 className="text-sm font-medium">{t("common.email")}</h4>
              <p className="text-sm">{cv.email}</p>
            </div>
            {cv.rejectionReason && 
            <div className="mb-2">
              <h4 className="text-sm font-medium">{t("dashboard.rejectionReason")}</h4>
              <p className="text-sm">{cv.rejectionReason}</p>
            </div>
            }
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm font-light">
                {t("dashboard.uploadedAt")}: {cv.uploadedAt}
              </div>
              <div className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                {t('im.clickToValidate')}
              </div>
            </div>
          </div>
          ))}

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
  else {
    return (
      <div></div>
    )
  }
}