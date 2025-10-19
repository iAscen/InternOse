import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { Cv, InternshipOffer } from "~/interfaces";
import { apiService } from "~/services/apiService";


interface InternshipCandidatesProps {
		setSelectedOffer: Dispatch<SetStateAction<InternshipOffer | null>>
    internship: InternshipOffer
}

export default function InternshipApplications({setSelectedOffer, internship}: InternshipCandidatesProps) {
	const [applications, setApplications] = useState<Cv[]>([])
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const {t} = useTranslation()

	useEffect(() => {
		fetchStudentApplications()
	}, [])

	const fetchStudentApplications = async () => {
		const errorMes = "Erreur lors de l'obtention des candidatures."
		try {
			let response = await apiService.getStudentApplicationsBy(internship.id!, null, null, null, null)
			
			if (response.success)
				setApplications(response.data!)
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
							<h2 className="text-xl font-semibold text-gray-900">{internship.jobTitle + ": "}{t('dashboard.internshipApplications.applications')}</h2>
							<span className="ml-auto hover:text-gray-500 cursor-pointer">{t('dashboard.internshipApplications.sortAndFilter')}</span>
						</div>
					</div>
					
					<div className="mt-1">
						{applications.map((application, index) => {
							return <div key={application.studentId || index} className="bg-white shadow-lg rounded-md ps-6 pe-6 pt-2 pb-2 mb-1">
								<div className="flex">
									<div className="text-lg font-medium text-gray-900 mb-3">
										{application.firstName + " " + application.lastName}
									</div>
									<span className="ml-auto">
										{getStatusBadge(application)}
									</span>	
								</div>
								<div className="mb-2">
									<h4 className="text-md font-medium text-gray-900 mb-1">Institution</h4>
									<p className="text-sm text-gray-700 leading-relaxed">{application.institution + " - " + application.program}</p>
              	</div>
								<div>
									<h4 className="text-md font-medium text-gray-900 mb-1">Date de candidature</h4>
									<p className="text-sm text-gray-700 leading-relaxed">{getDateWithoutTime(application.applicationDate!)}</p>
              	</div>
							</div>
						})}
					</div>

				</div>

				{applications.length == 0 &&
					<div className="text-center text-gray-900 mt-2">
						{t('dashboard.internshipApplications.noCandidaturesFound')}
					</div>
				}
			</>
		}
		</>
	)
}