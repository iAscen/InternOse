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
          <div /*onClick={() => {navigate("/cv/" + cv.studentId)}} */ className="text-gray-900 cursor-pointer hover:bg-gray-50 transition shadow-md rounded-lg mb-2 p-5" key={index}>
            <div className="flex mb-4">
              <div className="flex-auto">
                <p className="text-lg font-medium">{cv.cvFileName}</p>
              </div>
              <div className="flex-auto flex justify-end">
                  <div className="ml-4 flex flex-col items-end space-y-2">
                      {getCvStatusBadge(cv.cvStatus)}
                      {(!cv.cvStatus || cv.cvStatus === 'pending') && (
                          <button
                              onClick={() => handleValidateCv(cv)}
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
            <div className="mt-6 text-sm font-light">
              {t("dashboard.uploadedAt")}: {cv.uploadedAt}
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