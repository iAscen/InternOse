import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import type { Cv } from "~/interfaces";

interface CvListProps {
    cvs: Cv[]
}


export default function CvList({cvs}: CvListProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log(cvs)
  }, [])

  if (Array.isArray(cvs) && cvs.length != 0) {
    return (
      <div>
          {cvs.map((cv, index) => (
          <div onClick={() => {navigate("/cv/" + cv.studentId)}} className="text-gray-900 cursor-pointer hover:scale-101 transition shadow-md rounded-lg mb-2 p-5" key={index}>
            <div className="flex mb-4">
              <div className="flex-auto">
                <p className="text-lg font-medium">{cv.cvFileName}</p>
              </div>
              <div className="flex-auto flex justify-end">
                <div>
                  {cv.validatedAt && 
                    <span className="me-1">{cv.validatedAt}</span>}
                  {cv.cvStatus == "pending" && 
                    <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-yellow-100 text-yellow-800">{t('dashboard.pending')}</span>}
                  {cv.cvStatus == "approved" && 
                    <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-green-100 text-green-800">{t('dashboard.validated')}</span>}
                  {cv.cvStatus == "rejected" && 
                    <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-red-100 text-red-800">{t('dashboard.rejected')}</span>}
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
      </div>
    );
  }
  else {
    return (
      <div></div>
    )
  }
}