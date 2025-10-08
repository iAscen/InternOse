import { useEffect, useState } from "react";
import { useSSR, useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import type { Cv } from "~/interfaces";
import { apiService } from "~/services/apiService";


export function CvDetailsContent() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { studentId } = useParams<{ studentId: string }>();
    const [cvDetails, setCvDetails] = useState<Cv>();
    const [cvBlob, setCvBlob] = useState<Blob>();
    const [error, setError] = useState<string>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!apiService.isAuthenticated()) {
            navigate('/login');
        } else {
            const userRole = apiService.getUserRole();
            if (userRole !== 'INTERNSHIP_MANAGER') {
                // Rediriger vers le bon dashboard selon le rôle
                switch (userRole) {
                    case 'EMPLOYER':
                        navigate('/employer-dashboard');
                        break;
                    case 'STUDENT':
                        navigate('/student-dashboard');
                        break;
                    default:
                        navigate('/');
                        break;
                }
            }
        }
    }, [navigate]);

    useEffect(() => {
       loadCvData()
    }, [])

    const loadCvData = async () => {
        setLoading(true)

        await loadCvDetails()

        if (!error)
            await loadCvBytes()

        setLoading(false)
    }

    const loadCvDetails = async () => {
        const response = await apiService.getCvDetails(Number(studentId))
        
        if (response.success) {
            setCvDetails(response.data)
        }
        else {
            setError(response.error)
            setLoading(false)
        }
        
    }

    const loadCvBytes = async () => {
        const response = await apiService.getCvBlob(Number(studentId))
        
        if (response.success) {
            setCvBlob(response.data)
        }
        else {
            setError(response.error)
            setLoading(false)
        }
    }
    
    const handleDownload = () => {
        if (!cvBlob) return;

        const url = window.URL.createObjectURL(cvBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `cv_${studentId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

  if (error)
    return (
        <div className="text-center mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg w-[60%] m-auto">
                {error}
        </div>
    )


  if (loading) 
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-50">
            <div className="text-gray-900 text-lg font-medium">
                Loading...
            </div>
        </div>
    )

  if (!error && !loading && cvDetails)
    return (
        <>
            <div onClick={() => {navigate("/im-dashboard")}} className="flex items-center gap-2 w-[10%] bg-red-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-red-700 transition mt-3 ml-3">
                <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>{t("cv-details.goBack")}</span>
            </div>

            <div className="p-4 border rounded-lg shadow-md space-y-3 text-gray-900 w-[60%] m-auto mt-20">
            <p>
                <strong>{t("im.name") || "Name"}:</strong> {cvDetails.firstName} {cvDetails.lastName}
            </p>
            <p>
                <strong>{t("common.email") || "Email"}:</strong> {cvDetails.email}
            </p>
            {cvDetails.cvFileName && (
                <p>
                <strong>{t("cv-details.fileName")}:</strong> {cvDetails.cvFileName}
                </p>
            )}
            {cvDetails.cvFileType && (
                <p>
                <strong>{t("cv-details.fileType")}:</strong> {cvDetails.cvFileType}
                </p>
            )}
            <button
                onClick={handleDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                {t("cv-details.downloadCv")}
            </button>
            </div>
        </>
    );

}