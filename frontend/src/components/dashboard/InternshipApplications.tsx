import { useEffect, useState, useRef, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { Cv, InternshipOffer, CreateInterviewInvitationRequest, InternshipContract } from "~/interfaces";
import { employerAPI } from "~/services/EmployerAPI";
import ApplicationValidationModal from "./ApplicationValidationModal";
import InterviewInvitationModal from "./InterviewInvitationModal";
import SortButton from "./SortButton";
import FilterButton from "./FilterButton";
import FilterMenuCvs from "./FilterMenuCvs";
import SortMenuApplications from "./SortMenuApplications";
import { useClickOutside } from "~/hooks/useClickOutside";
import InternshipContractModal from "~/components/dashboard/InternshipContractModal";
import InternshipContractDetailsModal from "~/components/dashboard/InternshipContractDetailsModal";
import {internshipManagerAPI} from "~/services/InternshipManagerAPI";


interface InternshipCandidatesProps {
  isInternshipManager: boolean;
		setSelectedOffer: Dispatch<SetStateAction<InternshipOffer | null>>
    internship: InternshipOffer
	countNumberOfUnseenApplications?: (offers: InternshipOffer[]) => Promise<void>
	offers?: InternshipOffer[]
	onContractCreated?: () => void
}

export default function InternshipApplications({
  isInternshipManager = false,
 setSelectedOffer,
 internship,
 countNumberOfUnseenApplications,
 offers,
 onContractCreated
}: InternshipCandidatesProps) {
	const [applications, setApplications] = useState<Cv[]>([])
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	const [selectedApplication, setSelectedApplication] = useState<Cv | null>(null)
	const [showSortMenuApplications, setShowSortMenuApplications] = useState(false);
    const [showFilterMenuApplications, setShowFilterMenuApplications] = useState(false);
	const [showInvitationModal, setShowInvitationModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [studentForContract, setStudentForContract] = useState<Cv | null>(null);
	const [studentToInvite, setStudentToInvite] = useState<Cv | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [selectedContract, setSelectedContract] = useState<InternshipContract | null>(null);
	const [loadingContract, setLoadingContract] = useState(false);
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
	} else if (application.applicationStatus === 'PENDING_CONTRACT') {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
          {t('im.pendingContract')}
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

  const handleContract = (application: Cv, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentForContract(application);
    setShowContractModal(true);
    setSuccessMessage(null);
  }

  const handleViewContract = async (application: Cv) => {
    if (!internship.id || !application.id) return;
    
    setLoadingContract(true);
    try {
      const response = await employerAPI.getInternshipContract(internship.id, application.id);
      if (response.success && response.data) {
        setSelectedContract(response.data);
      } else {
        setErrorMessage(response.error || t('internshipContract.errors.loadError'));
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (error) {
      setErrorMessage(t('internshipContract.errors.loadError'));
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoadingContract(false);
    }
  }

  const handleContractSubmit = async (contractData: any) => {
    try {
      console.log('Contract data:', contractData);
      const response = await internshipManagerAPI.createInternshipContract(contractData);
      
      if (response.success) {
        setSuccessMessage(t('internshipContract.createSuccess'));
        setShowContractModal(false);
        setStudentForContract(null);

        await fetchStudentApplications(null, null, null, null);

        // Notifier le parent pour recharger les contrats
        if (onContractCreated) {
          onContractCreated();
        }

        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      } else {
        setErrorMessage(response.error || t('internshipContract.errors.createFailed'));
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      setErrorMessage(t('internshipContract.errors.createFailed'));
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
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
							// Pour le gestionnaire de stage, on ne permet pas de cliquer sur les candidatures pour les valider
							// Le gestionnaire peut seulement créer des contrats via le bouton dédié
							const canClick = !isInternshipManager;
							return <div key={application.id || index} onClick={canClick ? () => setSelectedApplication(application) : undefined} className={`bg-white shadow-lg relative rounded-md ps-6 pe-6 pt-2 pb-2 mb-1 ${canClick ? 'hover:bg-gray-100 cursor-pointer' : ''}`}>
								{application.seenStatus && application.seenStatus === "UNSEEN" && <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-500 rounded-full" />}
								<div className="flex">
									<div className="text-lg font-medium text-gray-900 mb-3">
										{(application.firstName || 'Prénom') + " " + (application.lastName || 'Nom')}
									</div>
									<div className="ml-auto flex items-center space-x-2">
										{/* Bouton pour inviter à l'entrevue (Employeur seulement) */}
										{application.applicationStatus === 'PENDING' && !isInternshipManager && (
											<button
												onClick={(e) => handleInviteToInterview(application, e)}
												className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												{t('dashboard.internshipApplications.inviteToInterview')}
											</button>
										)}
										{/* Bouton pour créer une entente de stage (Gestionnaire seulement) */}
										{application.applicationStatus === 'ACCEPTED_BY_STUDENT' && isInternshipManager && (
                      <button
                        onClick={(e) => handleContract(application, e)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                       {t('dashboard.internshipApplications.createInternshipContract')}
                      </button>
                    )}
										{/* Bouton pour voir l'entente de stage (Employeur seulement, quand PENDING_CONTRACT) */}
										{application.applicationStatus === 'PENDING_CONTRACT' && !isInternshipManager && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewContract(application);
                        }}
                        disabled={loadingContract}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                       {loadingContract ? t('common.loading') : t('im.viewContract')}
                      </button>
                    )}
										<span>
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
                      <p className="text-sm text-gray-700 leading-relaxed">{application.applicationDate ? getDateWithoutTime(application.applicationDate) : t('dashboard.internshipApplications.dateUnavailable')}</p>
              					</div>
							</div>

						})}
					</div>

				</div>

        {applications.length === 0 && errorMessage == null && (
          <div className="text-center text-gray-900 mt-2">
            {t('dashboard.internshipApplications.noCandidaturesFound')}
          </div>

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

    {/* Modal de création de contrat de stage */}
    {studentForContract && showContractModal && (
      <InternshipContractModal
        student={studentForContract}
        studentId={studentForContract.id}
        internshipOfferId={internship.id}
        internshipOffer={internship}
        onSubmit={handleContractSubmit}
        onCancel={() => {
          setShowContractModal(false);
          setStudentForContract(null);
        }}
      />

    )}

    {/* Modal pour voir les détails de l'entente */}
    {selectedContract && (
      <InternshipContractDetailsModal
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
        onContractUpdate={async () => {
          // Recharger le contrat après signature
          if (internship.id && selectedContract.studentId) {
            try {
              const response = await employerAPI.getInternshipContract(internship.id, selectedContract.studentId);
              if (response.success && response.data) {
                setSelectedContract(response.data);
              }
            } catch (error) {
              console.error('Error reloading contract:', error);
            }
          }
        }}
      />
    )}

		</>
	)
}

