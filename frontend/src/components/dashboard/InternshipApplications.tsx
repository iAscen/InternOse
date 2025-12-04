import { useEffect, useState, useRef, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { Cv, InternshipOffer, CreateInterviewInvitationRequest, InternshipContract } from "~/interfaces";
import { employerAPI } from "~/services/EmployerAPI";
import { internshipManagerAPI } from "~/services/InternshipManagerAPI";
import ApplicationValidationModal from "./ApplicationValidationModal";
import InterviewInvitationModal from "./InterviewInvitationModal";
import SortButton from "./SortButton";
import FilterButton from "./FilterButton";
import FilterMenuCvs from "./FilterMenuCvs";
import SortMenuApplications from "./SortMenuApplications";
import { useClickOutside } from "~/hooks/useClickOutside";
import InternshipContractModal from "~/components/dashboard/InternshipContractModal";
import InternshipContractDetailsModal from "~/components/dashboard/InternshipContractDetailsModal";


interface InternshipCandidatesProps {
  isInternshipManager: boolean;
	setSelectedOffer: Dispatch<SetStateAction<InternshipOffer | null>>
    internship: InternshipOffer
	countNumberOfUnseenApplications?: (offers: InternshipOffer[]) => Promise<void>
	offers?: InternshipOffer[]
	onContractCreated?: () => void
	isHistory?: boolean
	contractsUpdateKey?: number // Clé qui change quand les contrats sont mis à jour
	allContracts?: InternshipContract[] // Tous les contrats chargés (pour le gestionnaire de stage)
}

export default function InternshipApplications({
  isInternshipManager = false,
 setSelectedOffer,
 internship,
 countNumberOfUnseenApplications,
 offers,
 onContractCreated,
 isHistory = false,
 contractsUpdateKey = 0,
 allContracts = []
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
	const [contractsMap, setContractsMap] = useState<Map<number, InternshipContract>>(new Map());
	const {t} = useTranslation()
	const cleanupRuns = useRef(0)
	const [contractsUpdateTrigger, setContractsUpdateTrigger] = useState(0)
	const onContractCreatedRef = useRef(onContractCreated)
	
	// Mettre à jour la ref quand onContractCreated change
	useEffect(() => {
		onContractCreatedRef.current = onContractCreated;
	}, [onContractCreated]);

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
	}, [internship.id]);

	// Recharger les contrats quand ils sont mis à jour (via contractsUpdateTrigger ou contractsUpdateKey)
	useEffect(() => {
		if (applications.length > 0 && (contractsUpdateTrigger > 0 || contractsUpdateKey > 0)) {
			// Si on a déjà les contrats chargés, les utiliser de manière synchrone pour éviter le loading
			// Sinon, charger de manière asynchrone
			if (allContracts.length > 0) {
				loadContractsForApplicationsSync(applications);
			} else {
				loadContractsForApplications(applications);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [contractsUpdateTrigger, contractsUpdateKey]);
	
	// Recharger les contrats quand on revient sur le composant (internship.id change) ou quand allContracts change
	// Note: Les contrats sont aussi chargés dans fetchStudentApplications, mais ce useEffect
	// s'assure qu'ils sont rechargés si on change d'offre ou si les contrats sont mis à jour
	useEffect(() => {
		if (applications.length > 0) {
			// Si on a déjà les contrats chargés, les utiliser de manière synchrone pour éviter le loading
			// Sinon, charger de manière asynchrone
			if (allContracts.length > 0) {
				loadContractsForApplicationsSync(applications);
			} else {
				loadContractsForApplications(applications);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [internship.id, allContracts.length]);

	const fetchStudentApplications = async (applicationStatus: string | null, program: string | null, institution: string | null, sortBy: string | null) => {
		const errorMes = "Erreur lors de l'obtention des candidatures."
		try {
			let response = await employerAPI.getStudentApplicationsBy(internship.id!, applicationStatus, program, institution, sortBy)
			if (response.success) {
				const apps = response.data!;
				setApplications(apps)
				// Si on a déjà les contrats chargés (gestionnaire ou employeur), les utiliser de manière synchrone
				// Sinon, charger de manière asynchrone via l'API
				if (allContracts.length > 0) {
					// Chargement synchrone pour éviter le loading
					loadContractsForApplicationsSync(apps);
				} else {
					// Chargement asynchrone si les contrats ne sont pas encore chargés
					await loadContractsForApplications(apps);
				}
			}
			else
				setErrorMessage(response.error || errorMes)
		}
		catch(error) {
			setErrorMessage(errorMes)
		}
	}

	// Fonction synchrone pour charger les contrats depuis allContracts (gestionnaire de stage ou employeur)
	const loadContractsForApplicationsSync = (applications: Cv[]) => {
		if (!internship.id) return;
		
		const contracts = new Map<number, InternshipContract>();
		const applicationsWithContract = applications.filter(app => 
			app.applicationStatus === 'PENDING_CONTRACT' && app.id
		);

		// Filtrer les contrats pour cette offre et les applications
		allContracts.forEach(contract => {
			if (contract.internshipOfferId === internship.id && contract.studentId) {
				// Vérifier si ce contrat correspond à une application
				const app = applicationsWithContract.find(a => a.id === contract.studentId);
				if (app) {
					contracts.set(contract.studentId, contract);
				}
			}
		});

		// Mettre à jour la map avec tous les contrats chargés
		setContractsMap(contracts);
		console.log(`Loaded ${contracts.size} contracts (sync) for ${applicationsWithContract.length} applications with PENDING_CONTRACT status`);
	}

	const loadContractsForApplications = async (applications: Cv[]) => {
		if (!internship.id) return;
		
		const contracts = new Map<number, InternshipContract>();
		const applicationsWithContract = applications.filter(app => 
			app.applicationStatus === 'PENDING_CONTRACT' && app.id
		);

		// Pour l'employeur, charger les contrats via l'API
		const contractPromises = applicationsWithContract.map(async (app) => {
			if (!app.id) return null;
			try {
				const response = await employerAPI.getInternshipContract(internship.id, app.id);
				if (response.success && response.data) {
					return { studentId: app.id, contract: response.data };
				}
			} catch (error) {
				// Ignorer silencieusement les erreurs (contrat peut ne pas exister encore)
				console.debug(`Contract not found for student ${app.id}:`, error);
			}
			return null;
		});

		const results = await Promise.all(contractPromises);
		results.forEach(result => {
			if (result && result.contract) {
				contracts.set(result.studentId, result.contract);
			}
		});

		// Mettre à jour la map avec tous les contrats chargés
		setContractsMap(contracts);
		console.log(`Loaded ${contracts.size} contracts (async) for ${applicationsWithContract.length} applications with PENDING_CONTRACT status`);
	}

	const getDateWithoutTime = (date: string) => {
		return date.substring(0, date.indexOf("T"))
	}

	const getStatusBadge = (application: Cv) => {
    if (application.applicationStatus === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {t('im.approved')}
        </span>
      );
    } else if (application.applicationStatus === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
          {t('im.rejected')}
        </span>
      );
    } else if (application.applicationStatus === 'PENDING_INTERVIEW') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {t('dashboard.internshipApplications.pendingInterview')}
        </span>
      );
    } else if (application.applicationStatus === 'REJECTED_BY_STUDENT') {
		return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
          {t('im.rejectedByStudent')}
        </span>
      );
	}
	else if (application.applicationStatus === 'PENDING_ACCEPTANCE') {
		return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
          {t('im.pendingAcceptance')}
        </span>
      );
	} else if (application.applicationStatus === 'HIRED') {
		return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {t('im.hired')}
        </span>
      );
	} else if (application.applicationStatus === 'ACCEPTED_BY_STUDENT') {
		return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {t('im.acceptedByStudent')}
        </span>
      );
	} else if (application.applicationStatus === 'PENDING_CONTRACT') {
      // Vérifier si le contrat est complètement signé
      const contract = application.id ? contractsMap.get(application.id) : null;
      
      // Si le contrat n'est pas encore chargé, afficher "En attente de signatures" par défaut
      // Sinon, vérifier si toutes les signatures sont présentes
      if (contract) {
        const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
        
        if (allSigned) {
          return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              {t('internshipContract.fullySigned')}
            </span>
          );
        }
      }
      
      // Par défaut, afficher "En attente de signatures" si le contrat n'est pas chargé ou pas complètement signé
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
          {t('internshipContract.pendingSignatures')}
        </span>
      );
  }
	else {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
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
        
        // Déclencher le rechargement des contrats dans ce composant
        setContractsUpdateTrigger(prev => prev + 1);

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
			{/* Messages d'erreur et de succès */}
			{errorMessage && (
				<div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
				</div>
			)}

			{successMessage && (
				<div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {successMessage}
				</div>
			)}

			{/* Bouton Retourner - en haut à l'extérieur */}
			<div className="mb-4">
				<button 
					onClick={() => setSelectedOffer(null)} 
					className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
				>
					<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
					</svg>
				{t('dashboard.internshipApplications.goBack')}
			</button>
			</div>

			{/* Conteneur principal */}
			<div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
				{/* Header avec titre et boutons */}
				<div className="px-6 pt-6">
					{/* View-only quand mode historique */}
					{isHistory && (
						<div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 flex items-center gap-2">
							<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
							</svg>
							{t('dashboard.internshipApplications.viewOnlyMode')}
						</div>
					)}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
							<h2 className="text-xl font-bold text-slate-900">
								{internship.title || t('dashboard.internshipApplications.internshipOffer')}
							</h2>
							<p className="text-sm font-medium text-slate-500 mt-1">
								{t('dashboard.internshipApplications.applications')}
							</p>
						</div>
						<div className="flex items-center gap-2">
                  <div className="relative" ref={sortMenuRef}>
                    <SortButton onClick={() => {
									setShowSortMenuApplications(!showSortMenuApplications);
									setShowFilterMenuApplications(false);
                    }} />
								{showSortMenuApplications && (
                        <SortMenuApplications applySorting={(sortBy: string) => {
                          setShowSortMenuApplications(false);
										fetchStudentApplications(null, null, null, sortBy);
                        }}/>
								)}
                  </div>
                  <div className="relative" ref={filterMenuRef}>
                    <FilterButton onClick={() => {
									setShowSortMenuApplications(false);
									setShowFilterMenuApplications(!showFilterMenuApplications);
                    }}/>
								{showFilterMenuApplications && (
                        <FilterMenuCvs applyFilters={(filterBy: string[]) => {
                          setShowFilterMenuApplications(false);
										const status = filterBy[0] ? filterBy[0].toUpperCase() : null;
										const program = filterBy[1];
										const institution = filterBy[2];
										fetchStudentApplications(status, program, institution, null);
									}}/>
								)}
                </div>
						</div>
						</div>
					</div>

				{/* Liste des candidatures */}
				<div className="p-6 pt-0">
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
										fetchStudentApplications(null, null, null, null);
										setSuccessMessage(t('dashboard.internshipApplications.validationSuccess'));
										setTimeout(() => {
											setSuccessMessage(null);
										}, 5000);
									}}
								/>
							)}

					{applications.length === 0 && errorMessage == null ? (
						<div className="text-center py-12">
							<p className="text-sm font-medium text-slate-500">
								{t('dashboard.internshipApplications.noCandidaturesFound')}
							</p>
						</div>
					) : (
						<div className="space-y-4">
						{applications.map((application, index) => {
							const canClick = !isInternshipManager && !isHistory;
								return (
									<div 
										key={application.id || index} 
										onClick={canClick ? () => setSelectedApplication(application) : undefined} 
										className={`relative rounded-lg border border-slate-200 bg-white p-6 transition-colors ${
											canClick ? 'hover:bg-slate-50 cursor-pointer' : ''
										}`}
									>
										{application.seenStatus && application.seenStatus === "UNSEEN" && (
											<div className="absolute top-4 right-4 w-2.5 h-2.5 bg-amber-500 rounded-full" />
										)}
										
										<div className="flex-1">
											<div className="flex items-start justify-between mb-4">
												<div className="flex-1">
													<h3 className="text-lg font-semibold text-slate-900">
														{application.firstName || 'Prénom'} {application.lastName || 'Nom'}
													</h3>
												</div>
												<div className="ml-4">
													{getStatusBadge(application)}
												</div>
											</div>
											
											<div className="space-y-3">
												<div>
													<h4 className="text-sm font-medium text-slate-700 mb-1">
														{t("dashboard.internshipApplications.school")}
													</h4>
													<p className="text-sm text-slate-600">
														{application.institution || t("dashboard.internshipApplications.notSpecified")} - {application.program || t("dashboard.internshipApplications.notSpecified")}
													</p>
												</div>
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1">
														<h4 className="text-sm font-medium text-slate-700 mb-1">
															{t("dashboard.internshipApplications.applicationDate")}
														</h4>
														<p className="text-sm text-slate-600">
															{application.applicationDate ? getDateWithoutTime(application.applicationDate) : t('dashboard.internshipApplications.dateUnavailable')}
														</p>
									</div>
													<div className="flex items-center gap-3 flex-shrink-0">
										{/* Bouton pour inviter à l'entrevue (Employeur seulement, not in history) */}
										{!isHistory && application.applicationStatus === 'PENDING' && !isInternshipManager && (
											<button
												onClick={(e) => handleInviteToInterview(application, e)}
																className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
											>
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
																</svg>
												{t('dashboard.internshipApplications.inviteToInterview')}
											</button>
										)}
														
										{/* Bouton pour créer une entente de stage (Gestionnaire seulement, not in history) */}
										{!isHistory && (application.applicationStatus === 'ACCEPTED_BY_STUDENT' || application.applicationStatus === 'HIRED') && isInternshipManager && (
                      <button
                        onClick={(e) => handleContract(application, e)}
																className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
                      >
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
																</svg>
                       {t('dashboard.internshipApplications.createInternshipContract')}
                      </button>
                    )}
														
										{/* Bouton pour voir l'entente de stage (Employeur seulement, quand PENDING_CONTRACT, not in history) */}
										{!isHistory && application.applicationStatus === 'PENDING_CONTRACT' && !isInternshipManager && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewContract(application);
                        }}
                        disabled={loadingContract}
																className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
																<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
																</svg>
                       {loadingContract ? t('common.loading') : t('im.viewContract')}
                      </button>
                    )}
									</div>
								</div>
              					</div>
              					</div>
							</div>
						);
					})}
				</div>
			)}
				</div>
          </div>

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
                // Mettre à jour le contrat dans la map
                setContractsMap(prev => {
                  const newMap = new Map(prev);
                  newMap.set(selectedContract.studentId!, response.data!);
                  return newMap;
                });
                // Recharger les candidatures pour mettre à jour les statuts
                await fetchStudentApplications(null, null, null, null);
                // Notifier le parent pour recharger les contrats dans d'autres tabs
                if (onContractCreated) {
                  onContractCreated();
                }
                // Déclencher le rechargement des contrats dans ce composant
                setContractsUpdateTrigger(prev => prev + 1);
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

