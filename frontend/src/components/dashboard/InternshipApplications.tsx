import { useEffect, useState, useRef, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { Cv, InternshipOffer, CreateInterviewInvitationRequest } from "~/interfaces";
import { employerAPI } from "~/services/EmployerAPI";
import ApplicationValidationModal from "./ApplicationValidationModal";
import InterviewInvitationModal from "./InterviewInvitationModal";
import SortButton from "./SortButton";
import FilterButton from "./FilterButton";
import FilterMenuCvs from "./FilterMenuCvs";
import SortMenuApplications from "./SortMenuApplications";
import { useClickOutside } from "~/hooks/useClickOutside";


interface InternshipCandidatesProps {
  isInternshipManager: boolean;
		setSelectedOffer: Dispatch<SetStateAction<InternshipOffer | null>>
    internship: InternshipOffer
	countNumberOfUnseenApplications?: (offers: InternshipOffer[]) => Promise<void>
	offers?: InternshipOffer[]
}

export default function InternshipApplications({
  isInternshipManager = false,
 setSelectedOffer,
 internship,
 countNumberOfUnseenApplications,
 offers
}: InternshipCandidatesProps) {
	const [applications, setApplications] = useState<Cv[]>([])
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [selectedApplication, setSelectedApplication] = useState<Cv | null>(null)
	const [showSortMenuApplications, setShowSortMenuApplications] = useState(false);
    const [showFilterMenuApplications, setShowFilterMenuApplications] = useState(false);
	const [showInvitationModal, setShowInvitationModal] = useState(false);
	const [studentToInvite, setStudentToInvite] = useState<Cv | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const {t} = useTranslation()
	const cleanupRuns = useRef(0)

	// Refs pour les dropdowns
	const sortMenuRef = useRef<HTMLDivElement>(null);
	const filterMenuRef = useRef<HTMLDivElement>(null);

	// Fermer les dropdowns quand on clique à l'extérieur
	useClickOutside(sortMenuRef, () => {
		setShowSortMenuApplications(false);
	});

	useClickOutside(filterMenuRef, () => {
		setShowFilterMenuApplications(false);
	});

	const makeApplicationsSeen = async () => {
		await employerAPI.makeApplicationsSeen(internship.id)
		if (offers && countNumberOfUnseenApplications)
			countNumberOfUnseenApplications(offers)
	}

	useEffect(() => {
		if (isInternshipManager)
      fetchStudentApplications('ACCEPTED_BY_STUDENT', null, null, null);
    else
      fetchStudentApplications(null, null, null, null);

		return () => {
			if (cleanupRuns.current > 0) {
				makeApplicationsSeen()
			}

			cleanupRuns.current += 1
		}
	}, []);

	const fetchStudentApplications = async (applicationStatus: string | null, program: string | null, institution: string | null, sortBy: string | null) => {
		const errorMes = "Erreur lors de l'obtention des candidatures."
		try {
			let response = await employerAPI.getStudentApplicationsBy(internship.id!, applicationStatus, program, institution, sortBy)
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
    if (application.applicationStatus === 'APPROVED') {
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
    } else if (application.applicationStatus === 'PENDING_INTERVIEW') {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
          {t('dashboard.internshipApplications.pendingInterview')}
        </span>
      );
    } else if (application.applicationStatus === 'REJECTED_BY_STUDENT') {
		return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
          {t('im.rejectedByStudent')}
        </span>
      );
	}
	else if (application.applicationStatus === 'ACCEPTED_BY_STUDENT') {
		return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
          {t('im.acceptedByStudent')}
        </span>
      );
	}
	else {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800">
          {t('im.pending')}
        </span>
      );
    }
  };

	const handleInviteToInterview = (application: Cv, e: React.MouseEvent) => {
		e.stopPropagation(); // Empêcher la sélection de l'application
		setStudentToInvite(application);
		setShowInvitationModal(true);
		setSuccessMessage(null);
	};

	const handleInvitationSent = (invitation: CreateInterviewInvitationRequest) => {
		setSuccessMessage(t('interviewInvitation.success'));
		// Rafraîchir la liste des candidatures pour mettre à jour le statut
		fetchStudentApplications(null, null, null, null);
		setTimeout(() => {
			setSuccessMessage(null);
		}, 5000);
	};

	return (
		<>
			{
				errorMessage &&
				<div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errorMessage}
				</div>
			}

			{
				successMessage &&
				<div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
				</div>
			}

			<button onClick={() => setSelectedOffer(null)} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
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
								<div className="relative" ref={sortMenuRef}>
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
								<div className="relative" ref={filterMenuRef}>
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
                  isPending={selectedApplication.applicationStatus === 'PENDING'}
									cv={selectedApplication}
									internshipOffer={internship}
									isOpen={true}
									onClose={() => {
										setSelectedApplication(null);
									}}
									onValidationSuccess={() => {
										// Rafraîchir la liste des candidatures après validation
										fetchStudentApplications(null, null, null, null);
										setSuccessMessage(t('dashboard.internshipApplications.validationSuccess'));
										setTimeout(() => {
											setSuccessMessage(null);
										}, 5000);
									}}
								/>
							)}

					<div className="mt-1">
						{applications.map((application, index) => {
							return <div key={application.id || index} onClick={() => setSelectedApplication(application)} className="bg-white shadow-lg relative rounded-md ps-6 pe-6 pt-2 pb-2 mb-1 hover:bg-gray-100 cursor-pointer">
								{application.seenStatus && application.seenStatus === "UNSEEN" && <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full" />}
								<div className="flex">
									<div className="text-lg font-medium text-gray-900 mb-3">
										{(application.firstName || 'Prénom') + " " + (application.lastName || 'Nom')}
									</div>
									<div className="ml-auto flex items-center space-x-2">
										{(application.applicationStatus === 'PENDING') && (
											<button
												onClick={(e) => handleInviteToInterview(application, e)}
												className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												{t('dashboard.internshipApplications.inviteToInterview')}
											</button>
										)}
										<span>
                      {/*TODO remettre ceci quand terminé*/}
											{/*{!isInternshipManager && getStatusBadge(application)}*/}
                      {getStatusBadge(application)}
										</span>
									</div>
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

        {applications.length === 0 && errorMessage == null && (
          !isInternshipManager ? (
            <div className="text-center text-gray-900 mt-2">
              {t('dashboard.internshipApplications.noCandidaturesFound')}
            </div>
          ) : (
            <div className="text-center text-gray-900 mt-2">
              {/*TODO i18n*/}
              {/*Aucune candidature acceptée pour le moment*/}
              internshipApplications.noCandidaturesAcceptedFound
            </div>
          )
        )}
			</>
		}

		{/* Modal d'invitation à l'entrevue */}
		{studentToInvite && (
			<InterviewInvitationModal
				isOpen={showInvitationModal}
				onClose={() => {
					setShowInvitationModal(false);
					setStudentToInvite(null);
				}}
				student={studentToInvite}
				internshipOffer={internship}
				onInvitationSent={handleInvitationSent}
			/>
		)}
		</>
	)
}