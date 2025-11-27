import {useState, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import type {InternshipOffer, UnseenApplicationsCount, InternshipContract} from '~/interfaces';
import OfferValidationModal from './OfferValidationModal';
import ApplyOfferModal from './ApplyOfferModal';
import {studentAPI} from '~/services/StudentAPI';
import {userAPI} from '~/services/UserAPI';
import RespondToOfferModal from './RespondToOfferModal';
import InternshipContractDetailsModal from './InternshipContractDetailsModal';
import OfferActionButtons, { OfferSecondaryActions } from './OfferActionButtons';

interface OfferListProps {
  isStudent: boolean;
  isEmployer: boolean;
  loading: boolean;
  offers: InternshipOffer[];
  numbersOfApplications: number[] | Map<number, number>; // Peut être un tableau (index) ou une Map (offerId -> count)
  onOfferValidation?: () => void; // Callback pour rafraîchir la liste après validation
  onApplicationSuccess?: (offerId: number) => void; // Callback pour rafraîchir après candidature réussie
  cvStatus?: 'none' | 'pending' | 'approved' | 'rejected'; // Statut du CV de l'étudiant
  changeCursorIfApproved?: boolean; // Pour changer le curseur sur les offres approuvées
  selectOffer?: (offer: InternshipOffer) => void;
  unseenApplicationsCount?: Map<number, UnseenApplicationsCount> // Callback pour sélectionner une offre
  isHistory?: boolean;
  selectedSession?: string;
  onSessionChange?: (session: string) => void;
  availableSessions?: string[];
}

export default function OfferList({
                                    isStudent,
                                    isEmployer,
                                    loading,
                                    offers,
                                    numbersOfApplications,
                                    onOfferValidation,
                                    onApplicationSuccess,
                                    cvStatus,
                                    changeCursorIfApproved,
                                    selectOffer,
                                    unseenApplicationsCount,
                                    isHistory = false,
                                    selectedSession,
                                    onSessionChange,
                                    availableSessions
                                  }: OfferListProps) {
  const {t} = useTranslation();
  const [selectedOffer, setSelectedOffer] = useState<InternshipOffer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOfferToApply, setSelectedOfferToApply] = useState<InternshipOffer | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyError, setApplyError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedOfferToRespond, setSelectedOfferToRespond] = useState<InternshipOffer | null>(null);
  const [confirmationType, setConfirmationType] = useState<'REJECT_OFFER' | 'ACCEPT_OFFER'>('REJECT_OFFER')
  const [error, setError] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<InternshipContract | null>(null);
  const [loadingContract, setLoadingContract] = useState(false);

  // Set default session when isHistory is true
  const [internalSelectedSession, setInternalSelectedSession] = useState<string>('');

  useEffect(() => {
    if (isHistory && availableSessions && availableSessions.length > 0 && !internalSelectedSession) {
      const defaultSession = selectedSession || availableSessions[0];
      setInternalSelectedSession(defaultSession);
      if (onSessionChange && !selectedSession) {
        onSessionChange(defaultSession);
      }
    }
  }, [isHistory, availableSessions, internalSelectedSession, selectedSession, onSessionChange]);

  // Filter offers by session when isHistory is true
  const displayedOffers = useMemo(() => {
    if (!isHistory) {
      return offers;
    }

    const sessionToFilter = selectedSession || internalSelectedSession;
    if (!sessionToFilter) {
      return offers;
    }

    return offers.filter(offer => offer.session === sessionToFilter);
  }, [isHistory, offers, selectedSession, internalSelectedSession]);

  const rejectedUnseenApplicationsLargerThanZero = (offerId: number) => {
    if (unseenApplicationsCount) {
      const nbUnseenApplications = unseenApplicationsCount.get(offerId)?.studentsWhoRejectedTheOffer
      return nbUnseenApplications && nbUnseenApplications > 0
    }

    return false
  };

  const acceptedUnseenApplicationsLargerThanZero = (offerId: number) => {
    if (unseenApplicationsCount) {
      const nbUnseenApplications = unseenApplicationsCount.get(offerId)?.studentsWhoAcceptedTheOffer
      return nbUnseenApplications && nbUnseenApplications > 0
    }

    return false
  };

  const respondToOffer = async (offer: InternshipOffer, acceptOffer: boolean) => {
    const response = await studentAPI.respondToOffer(offer.id, acceptOffer)

    if (response.success) {
      // Fermer le modal de confirmation
      setSelectedOfferToRespond(null);
      // Afficher un message de succès
      setSuccessMessage(
        acceptOffer
          ? t('dashboard.acceptOfferSuccessMessage')
          : t('dashboard.refuseOfferSuccessMessage')
      );
      // Rafraîchir les données: onApplicationSuccess recharge les offres ET les candidatures (stats)
      // onOfferValidation est un fallback qui recharge seulement les offres
      if (onApplicationSuccess && offer.id) {
        onApplicationSuccess(offer.id);
      } else if (onOfferValidation) {
        onOfferValidation();
      }
      // Masquer le message après 5 secondes
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } else if (response.error) {
      setError(response.error);
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  }

  const handleViewContract = async (offer: InternshipOffer) => {
    if (!offer.id) return;
    
    setLoadingContract(true);
    try {
      const response = await studentAPI.getInternshipContract(offer.id);
      if (response.success && response.data) {
        setSelectedContract(response.data);
      } else {
        setError(response.error || t('internshipContract.errors.loadError'));
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      setError(t('internshipContract.errors.loadError'));
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingContract(false);
    }
  }

  const handleValidateOffer = (offer: InternshipOffer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
  };

  const handleValidationSuccess = () => {
    if (onOfferValidation) {
      onOfferValidation();
    }
  };

  const handleApplyClick = (offer: InternshipOffer) => {
    setSelectedOfferToApply(offer);
    setIsApplyModalOpen(true);
    setApplyError('');
  };

  const handleApplySubmit = async () => {
    if (!selectedOfferToApply || !selectedOfferToApply.id) {
      setApplyError('Erreur: Informations manquantes');
      return;
    }

    try {
      const studentId = await userAPI.getStudentIdFromJWT();
      if (!studentId) {
        setApplyError('Impossible de récupérer votre identifiant');
        return;
      }

      const response = await studentAPI.applyToOffer(studentId, selectedOfferToApply.id);

      if (response.success) {
        setSuccessMessage('Votre candidature a été soumise avec succès !');
        setIsApplyModalOpen(false);
        setSelectedOfferToApply(null);
        // Rafraîchir les données du dashboard
        if (onApplicationSuccess && selectedOfferToApply?.id) {
          onApplicationSuccess(selectedOfferToApply.id);
        }
        // Afficher le message pendant 5 secondes
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setApplyError(response.error || 'Une erreur est survenue lors de la candidature');
      }
    } catch (error) {
      setApplyError('Problème technique lors de la soumission. Veuillez réessayer.');
    }
  };

  const handleApplyClose = () => {
    setIsApplyModalOpen(false);
    setSelectedOfferToApply(null);
    setApplyError('');
  };

  const getStatusBadge = (offer: InternshipOffer) => {
    // Pour les étudiants, afficher le statut de candidature si disponible
    if (isStudent && offer.applicationStatus) {
      const getApplicationStatusInfo = (status: string) => {
        switch (status) {
          case 'PENDING':
            return {
              text: t('student.pending'),
              badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            };
          case 'PENDING_INTERVIEW':
            return {
              text: t('student.pendingInterview'),
              badgeClass: 'border-amber-200 bg-amber-50 text-amber-700',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              ),
            };
          case 'PENDING_CONTRACT':
            return {
              text: t('student.pendingContract'),
              badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
            };
          case 'APPROVED':
            return {
              text: t('student.approved'),
              badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            };
          case 'PENDING_ACCEPTANCE':
            return {
              text: t('student.pendingAcceptance'),
              badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            };
          case 'HIRED':
            return {
              text: t('student.hired'),
              badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            };
          case 'ACCEPTED':
          case 'ACCEPTED_BY_STUDENT':
            return {
              text: t('student.accepted'),
              badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            };
          case 'REJECTED':
          case 'REJECTED_BY_STUDENT':
            return {
              text: t('student.rejected'),
              badgeClass: 'border-red-200 bg-red-50 text-red-700',
              icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ),
            };
          default:
            return null;
        }
      };

      const statusInfo = getApplicationStatusInfo(offer.applicationStatus);
      if (statusInfo) {
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusInfo.badgeClass}`}>
            {statusInfo.icon}
            {statusInfo.text}
          </span>
        );
      }
      return null;
    }

    // Pour IM et Employer, afficher le statut de vérification
    if (offer.verificationStatus === 'APPROVED') {
      return (
        <span className="inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs leading-4 font-semibold text-emerald-700">
          {t('im.approved')}
        </span>
      );
    } else if (offer.verificationStatus === 'REJECTED') {
      return (
        <span className="inline-block rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs leading-4 font-semibold text-red-700">
          {t('im.rejected')}
        </span>
      );
    } else {
      return (
        <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs leading-4 font-semibold text-amber-700">
          {t('im.pending')}
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="text-center p-6">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-sm font-medium text-slate-500">{t('common.loading')}</p>
      </div>
    );
  }

  if (displayedOffers.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-sm font-medium text-slate-500">{isEmployer ? t('dashboard.noOffers') : t('im.internshipOffersSectionEmpty')}</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 z-50 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-xl shadow-slate-200">
      {error}
    </div>
    )}
      {isHistory && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>

          {t('dashboard.internshipApplications.viewOnlyMode')}
        </div>
      )}

      <div className="min-w-full">
        <div className="divide-y divide-slate-100">
          {displayedOffers.map((offer, index) => (
            <div
              key={offer.id || index}
              className={`p-6 hover:bg-slate-50 transition-colors ${
                ((isEmployer && changeCursorIfApproved) || (!isEmployer && !isStudent)) && offer.verificationStatus === 'APPROVED' && selectOffer
                  ? 'cursor-pointer group' 
                  : ''
              }`}
              onClick={() => {
                if (isEmployer && changeCursorIfApproved && offer.verificationStatus === 'APPROVED' && selectOffer) {
                  selectOffer(offer);
                } else if (!isEmployer && !isStudent && offer.verificationStatus === 'APPROVED' && selectOffer) {
                  // Pour IM, rendre la carte cliquable
                  selectOffer(offer);
                }
              }}
            >
                <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">{offer.title}</h3>
                      {/* Icône d'œil qui apparaît au hover pour IM et Employeur sur les offres approuvées */}
                      {((!isEmployer && !isStudent) || (isEmployer && changeCursorIfApproved)) && offer.verificationStatus === 'APPROVED' && selectOffer && (
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          {offer.address}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                          {offer.startDate} - {offer.endDate}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {offer.duration} {t('internship.weeks')}
                        </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {offer.session ? (() => {
                          const parts = offer.session.split(/[-\s]+/);
                          const year = parts[1] || '';
                          return t('common.winterSession', { year });
                        })() : ''}
                      </div>
                      </div>
                      {offer.salary > 0 && (
                        <div className="mt-2">
                          <span
                          className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs leading-4 font-semibold text-emerald-700">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                            </svg>
                            ${offer.salary}{t('internship.perHour')}
                          </span>
                        </div>
                      )}
                      {
                        isEmployer && (() => {
                          const count = Array.isArray(numbersOfApplications)
                            ? numbersOfApplications[index]
                            : (numbersOfApplications instanceof Map ? numbersOfApplications.get(offer.id) || 0 : 0);
                          return count > 0 && (
                            <div className="mt-2">
                              <span
                              className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs leading-4 font-semibold text-indigo-700">
                                {t('internship.thereIs') + count + t('internship.applicationsOnThisInternshipOffer')}
                              </span>
                            </div>
                          );
                        })()
                      }
                      {
                        isEmployer && unseenApplicationsCount && acceptedUnseenApplicationsLargerThanZero(offer.id) && (
                          <div className="mt-2">
                            <span
                            className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs leading-4 font-semibold text-emerald-700">
                              {unseenApplicationsCount!.get(offer.id)?.studentsWhoAcceptedTheOffer} {t("dashboard.studentsWhoAcceptedTheOfferMessage")}
                            </span>
                          </div>
                        )
                      }
                      {
                        isEmployer && unseenApplicationsCount && rejectedUnseenApplicationsLargerThanZero(offer.id) && (
                          <div className="mt-2">
                            <span
                            className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs leading-4 font-semibold text-red-700">
                              {unseenApplicationsCount!.get(offer.id)?.studentsWhoRejectedTheOffer} {t("dashboard.studentsWhoRejectedTheOfferMessage")}
                            </span>
                          </div>
                        )
                      }
                    </div>
                  <div className="ml-4">
                      {getStatusBadge(offer)}
                  </div>
                </div>

                <div className="space-y-3">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{t('internship.description')}</h4>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{offer.description}</p>
                </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{t('internship.program')}</h4>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{offer.program}</p>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 mb-1">{t('internship.requirements')}</h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">{offer.requiredSkills}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {!isHistory && (
                        <OfferActionButtons
                          offer={offer}
                          isStudent={isStudent}
                          isEmployer={isEmployer}
                          cvStatus={cvStatus}
                          onApply={handleApplyClick}
                          onAccept={(offer) => {
                            setSelectedOfferToRespond(offer);
                            setConfirmationType('ACCEPT_OFFER');
                          }}
                          onReject={(offer) => {
                            setSelectedOfferToRespond(offer);
                            setConfirmationType('REJECT_OFFER');
                          }}
                          onViewContract={handleViewContract}
                          onValidate={handleValidateOffer}
                          onSelect={selectOffer}
                          loadingContract={loadingContract}
                        />
                      )}
                      {isStudent && (
                        <OfferSecondaryActions
                          offer={offer}
                          isStudent={isStudent}
                          onAccept={(offer) => {
                            setSelectedOfferToRespond(offer);
                            setConfirmationType('ACCEPT_OFFER');
                          }}
                          onReject={(offer) => {
                            setSelectedOfferToRespond(offer);
                            setConfirmationType('REJECT_OFFER');
                          }}
                          onViewContract={handleViewContract}
                          loadingContract={loadingContract}
                        />
                      )}
                    </div>
                </div>
                {/* Affichage de la raison de rejet si applicable */}
                {offer.verificationStatus === 'REJECTED' && offer.rejectionReason && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <h4 className="text-sm font-semibold text-red-800 mb-1">{t('dashboard.rejectionReason')}</h4>
                      <p className="text-sm font-medium text-red-700">{offer.rejectionReason}</p>
                  </div>
                )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-xl shadow-slate-200 max-w-md">
            ✓ {successMessage}
          </div>
        )}

        {/* Validation Modal */}
        {selectedOffer && (
          <OfferValidationModal
            offer={selectedOffer}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedOffer(null);
            }}
            onValidationSuccess={handleValidationSuccess}
          />
        )}

        

        {/* Apply Modal */}
        <ApplyOfferModal
          offer={selectedOfferToApply}
          isOpen={isApplyModalOpen}
          onClose={handleApplyClose}
          onApply={handleApplySubmit}
          error={applyError}
        />

        {selectedOfferToRespond && isStudent && <RespondToOfferModal
                            offer={selectedOfferToRespond}
                            mode={confirmationType}
                            onClose={() => setSelectedOfferToRespond(null)}
                            onSubmit={() => respondToOffer(selectedOfferToRespond, confirmationType === "ACCEPT_OFFER")}></RespondToOfferModal>}
        
        {selectedContract && (
          <InternshipContractDetailsModal
            contract={selectedContract}
            onClose={() => setSelectedContract(null)}
            onContractUpdate={async () => {
              // Recharger le contrat après signature
              if (selectedContract.internshipOfferId) {
                try {
                  const response = await studentAPI.getInternshipContract(selectedContract.internshipOfferId);
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
      </div>
    </>
  );
}
