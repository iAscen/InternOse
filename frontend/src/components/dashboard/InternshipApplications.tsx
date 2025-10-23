import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { Cv, InternshipOffer } from "~/interfaces";
import { apiService } from "~/services/apiService";
import ApplicationValidationModal from "./ApplicationValidationModal";
import SortButton from "./SortButton";
import SortMenuCvs from "./SortMenuCvs";
import FilterButton from "./FilterButton";
import FilterMenuCvs from "./FilterMenuCvs";
import SortMenuApplications from "./SortMenuApplications";


interface InternshipCandidatesProps {
		setSelectedOffer: Dispatch<SetStateAction<InternshipOffer | null>>
    internship: InternshipOffer
}

export default function InternshipApplications({setSelectedOffer, internship}: InternshipCandidatesProps) {
	const [applications, setApplications] = useState<Cv[]>([])
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [selectedApplication, setSelectedApplication] = useState<Cv | null>(null)
	const [showSortMenuApplications, setShowSortMenuApplications] = useState(false);
    const [showFilterMenuApplications, setShowFilterMenuApplications] = useState(false);
	const {t} = useTranslation()

	useEffect(() => {
		fetchStudentApplications(null, null, null, null)
	}, [])

	const fetchStudentApplications = async (applicationStatus: string | null, program: string | null, institution: string | null, sortBy: string | null) => {
		const errorMes = "Erreur lors de l'obtention des candidatures."
		try {
			let response = await apiService.getStudentApplicationsBy(internship.id!, applicationStatus, program, institution, sortBy)
			if (response.success) {
				setApplications(response.data!)
			}
			else
				setErrorMessage(response.error || errorMes)
		}
		catch(error) {
			setErrorMessage(errorMes)
		}
	}

	const getDateWithoutTime = (date: string) => {
		return date.substring(0, date.indexOf("T"))
	}

	const getStatusBadge = (application: Cv) => {
    if (application.applicationStatus === 'ACCEPTED') {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
          {t('im.approved')}
        </span>
      );
    } else if (application.applicationStatus === 'REJECTED') {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
          {t('im.rejected')}
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
          {t('im.pending')}
        </span>
      );
    }
  };

	return (
		<>
			{
				errorMessage &&
				<div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
				</div>
			}

			<button onClick={() => setSelectedOffer(null)} className="text-white bg-red-600 mb-1 p-2 shadow-md rounded-sm cursor-pointer hover:scale-110">
				{t('dashboard.internshipApplications.goBack')}
			</button>

			{
			errorMessage == null && 
			<>
				<div>
					<div className="bg-white rounded-lg shadow-md text-gray-900">
						<div className="flex px-6 py-4 border-b border-gray-200">
							<h2 className="text-xl font-semibold text-gray-900">{(internship.title || 'Offre de stage') + ": "}{t('dashboard.internshipApplications.applications')}</h2>
							{/*<span className="ml-auto hover:text-gray-500 cursor-pointer">{t('dashboard.internshipApplications.sortAndFilter')}</span>*/}
							<div className="flex ml-auto items-center space-x-4 text-gray-900">
								<div className="relative">
									<SortButton onClick={() => {
										setShowSortMenuApplications(true)
										setShowFilterMenuApplications(false)
									}} />
									{showSortMenuApplications &&
										<SortMenuApplications applySorting={(sortBy: string) => {
											setShowSortMenuApplications(false);
											fetchStudentApplications(null, null, null, sortBy)
										}}/>
									}
								</div>
								<div className="relative">
									<FilterButton onClick={() => {
										setShowSortMenuApplications(false)
										setShowFilterMenuApplications(true)
									}}/>
									{showFilterMenuApplications &&
										<FilterMenuCvs applyFilters={(filterBy: string[]) => {
											setShowFilterMenuApplications(false);
											const status = filterBy[0] ? filterBy[0].toUpperCase() : null
											const program = filterBy[1]
											const institution = filterBy[2]

											fetchStudentApplications(status, program, institution, null)
										}}/>
									}
								</div>
							</div>
						</div>
					</div>

					{selectedApplication && errorMessage == null && (
							
								<ApplicationValidationModal
									cv={selectedApplication}
									isOpen={true}
									onClose={() => {
										setSelectedApplication(null);
									}}
									onValidationSuccess={() => {console.log("dasdasd")}}
								/>
							)}
					
					<div className="mt-1">
						{applications.map((application, index) => {
							return <div key={application.id || index} onClick={() => setSelectedApplication(application)} className="bg-white shadow-lg rounded-md ps-6 pe-6 pt-2 pb-2 mb-1 cursor-pointer hover:bg-gray-100">
								<div className="flex">
									<div className="text-lg font-medium text-gray-900 mb-3">
										{(application.firstName || 'Prénom') + " " + (application.lastName || 'Nom')}
									</div>
									<span className="ml-auto">
										{getStatusBadge(application)}
									</span>	
								</div>
								<div className="mb-2">
									<h4 className="text-md font-medium text-gray-900 mb-1">{t("dashboard.internshipApplications.school")}</h4>
									<p className="text-sm text-gray-700 leading-relaxed">{(application.institution || t("dashboard.internshipApplications.notSpecified")) + " - " + (application.program || t("dashboard.internshipApplications.notSpecified"))}</p>
              					</div>
								<div>
									<h4 className="text-md font-medium text-gray-900 mb-1">{t("dashboard.internshipApplications.applicationDate")}</h4>
									<p className="text-sm text-gray-700 leading-relaxed">{application.applicationDate ? getDateWithoutTime(application.applicationDate) : 'Date non disponible'}</p>
              					</div>
							</div>
						
						})}
					</div>

				</div>

				{applications.length == 0 && errorMessage == null &&
					<div className="text-center text-gray-900 mt-2">
						{t('dashboard.internshipApplications.noCandidaturesFound')}
					</div>
				}
			</>
		}
		</>
	)
}