import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { InternshipContract } from "~/interfaces";
import DashboardSidebar from "./DashboardSidebar";
import { professorAPI } from "../../services/ProfessorAPI"
import { userAPI } from "../../services/UserAPI"
 
export default function ProfessorDashboardContent() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('etudiants');
    const [error, setError] = useState<string | null>(null);
    const [contracts, setContracts] = useState<InternshipContract[]>([]);

    useEffect(() => {
        loadContracts()
    }, [])

    const loadContracts = async () => {
        try {
            const userId = await userAPI.getProfessorIdFromJWT()

            if (userId) {
                const response = await professorAPI.findInternshipContracts(userId)

                if (response.success && response.data) {
                    setContracts(response.data)
                } else {
                    setError(response.error ?? t('professorDashboard.contractsNotFound'))
                }

            } else {
                setError(t('professorDashboard.contractsNotFound'))
            }
        } catch (error) {
            setError(t('professorDashboard.contractsNotFound'))
        }
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
    };
    
    
    return (
        <div className="mx-auto flex min-h-screen w-full min-w-[320px] flex-col bg-slate-100 lg:ps-96">
          <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main id="page-content" className="flex max-w-full flex-auto flex-col pt-20 lg:pt-0 bg-slate-100">
            <div className="mx-auto w-full xl:max-w-7xl bg-slate-100">
              {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                      {error}
                  </div>
              )}


              {activeTab == "etudiants" && contracts.length >= 1 &&

                 <div className="min-w-full text-gray-900 bg-white p-3">
                    <h2 className="text-lg font-medium mb-2">{t('professorDashboard.myStudents')}</h2>
                    <div>
                        {
                          contracts.map(contract => {
                              return (
                                <div key={contract.id} className="ps-4 bg-gray-50 shadow-md rounded-2xl p-2">
                                  <h3 className="font-medium text-lg pb-2">{contract.studentFirstName} {contract.studentLastName}</h3>
                                  <div className="pb-2">
                                    <h4 className="font-medium">{t("professorDashboard.employer")}</h4>
                                    <p>{contract.employerCompany} - {contract.internshipOfferTitle}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{t("professorDashboard.period")}</h4>
                                    <p>{formatDate(contract.startDate)} {'-->'} {formatDate(contract.endDate)}</p>
                                  </div>
                                </div> 
                              )
                          })
                        }
                    </div>
                  </div>
              }

              {
                activeTab == "etudiants" && contracts.length < 1 &&
                  <div className="min-w-full text-gray-900 bg-white p-3">
                    <h2 className="text-lg text-gray-900 font-medium mb-2">{t('professorDashboard.myStudents')}</h2>
                    <p className="text-gray-900">{t('professorDashboard.noStudentFound')}</p>
                  </div>
              }
            </div>
          </main>
        </div>
    )
}