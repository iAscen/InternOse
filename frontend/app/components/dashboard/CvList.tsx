import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Cv } from "~/interfaces";

interface CvListProps {
    cvs: Cv[]
}


export default function CvList({cvs}: CvListProps) {
  const { t } = useTranslation();

  useEffect(() => {
    console.log(cvs)
  }, [])

  if (Array.isArray(cvs) && cvs.length != 0) {
    return (
      <div>
          {cvs.map((cv, index) => (
          <div className="text-gray-900 bg-white shadow-md rounded-lg mb-2 p-5" key={index}>
            <div className="flex mb-4">
              <div className="flex-auto">
                <p className="text-lg font-medium">{cv.cvFileName}</p>
              </div>
              <div className="flex-auto flex justify-end">
                <div>
                  {cv.validatedAt && 
                    <span className="me-1">{cv.validatedAt}</span>}
                  {cv.cvStatus == "pending" && 
                    <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-yellow-100 text-yellow-800">Pending</span>}
                  {cv.cvStatus == "approved" && 
                    <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-green-100 text-green-800">Approved</span>}
                  {cv.cvStatus == "rejected" && 
                    <span className="text-sm font-semibold rounded-full p-2 ps-3 pe-3 bg-red-100 text-red-800">Rejected</span>}
                </div>
              </div>
            </div>
            <div className="mb-2">
              <h4 className="text-sm font-medium">Student</h4>
              <p className="text-sm">{cv.firstName} {cv.lastName}</p>
            </div>
            <div className="mb-2">
              <h4 className="text-sm font-medium">Email</h4>
              <p className="text-sm">{cv.email}</p>
            </div>
            {cv.rejectionReason && 
            <div className="mb-2">
              <h4 className="text-sm font-medium">Raison de rejet</h4>
              <p className="text-sm">{cv.rejectionReason}</p>
            </div>
            }
            <div className="mt-6 text-sm font-light">
              UploadedAt: {cv.uploadedAt}
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