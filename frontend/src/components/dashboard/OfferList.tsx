import {useEffect, useState, type Dispatch, type SetStateAction} from 'react';
import {useTranslation} from 'react-i18next';
import type {InternshipOffer, UnseenApplicationsCount} from '~/interfaces';
import OfferValidationModal from './OfferValidationModal';
import ApplyOfferModal from './ApplyOfferModal';
import {studentAPI} from '~/services/StudentAPI';
import {userAPI} from '~/services/UserAPI';
import RespondToOfferModal from './RespondToOfferModal';
import { employerAPI } from '~/services/EmployerAPI';

interface OfferListProps {
  isStudent: boolean;
  isEmployer: boolean;
  loading: boolean;
  offers: InternshipOffer[];
  numbersOfApplications: number[];
  onOfferValidation?: () => void; // Callback pour rafraîchir la liste après validation
  onApplicationSuccess?: (offerId: number) => void; // Callback pour rafraîchir après candidature réussie
  cvStatus?: 'none' | 'pending' | 'approved' | 'rejected'; // Statut du CV de l'étudiant
  changeCursorIfApproved?: boolean; // Pour changer le curseur sur les offres approuvées
  selectOffer?: (offer: InternshipOffer) => void;
  unseenApplicationsCount?: Map<number, UnseenApplicationsCount> // Callback pour sélectionner une offre
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

  const respondToOffer = (offer: InternshipOffer, acceptOffer: boolean) => {
    console.log("Respond to offer")
    studentAPI.respondToOffer(offer.id, acceptOffer)
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
    if (isStudent) {
      return null
    }

    if (offer.verificationStatus === 'APPROVED') {
      return (
        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
          {t('im.approved')}
        </span>
      );
    } else if (offer.verificationStatus === 'REJECTED') {
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.myOffers')}</h2>
        </div>
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        {isEmployer &&
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.myOffers')}</h2>
          </div>
        }
        <div className="p-6 text-center text-gray-500">
          <p>{isEmployer ? t('dashboard.noOffers') : t('im.internshipOffersSectionEmpty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {isEmployer &&
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.myOffers')}</h2>
        </div>
      }

      <div className="divide-y divide-gray-200">
        {offers.map((offer, index) => (
          <div
            key={offer.id || index}
            className={`p-6 hover:bg-gray-50 transition-colors ${changeCursorIfApproved && offer.verificationStatus === 'APPROVED' ? 'cursor-pointer' : ''}`}
            onClick={() => {
              if (isEmployer && changeCursorIfApproved && offer.verificationStatus === 'APPROVED' && selectOffer) {
                selectOffer(offer);
              }
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                    </div>
                    {offer.salary > 0 && (
                      <div className="mt-2">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                          </svg>
                          ${offer.salary}{t('internship.perHour')}
                        </span>
                      </div>
                    )}
                    {
                      isEmployer && numbersOfApplications[index] > 0 && (
                        <div className="mt-2">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {t('internship.thereIs') + numbersOfApplications[index] + t('internship.applicationsOnThisInternshipOffer')}
                          </span>
                        </div>
                      )
                    }
                    {
                      isEmployer && unseenApplicationsCount && acceptedUnseenApplicationsLargerThanZero(offer.id) && (
                        <div className="mt-2">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {unseenApplicationsCount!.get(offer.id)?.studentsWhoAcceptedTheOffer}
                          </span>
                        </div>
                      )
                    }
                    {
                      isEmployer && unseenApplicationsCount && rejectedUnseenApplicationsLargerThanZero(offer.id) && (
                        <div className="mt-2">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {unseenApplicationsCount!.get(offer.id)?.studentsWhoRejectedTheOffer}
                          </span>
                        </div>
                      )
                    }
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    {getStatusBadge(offer)}
                    {!isEmployer && !isStudent && (!offer.verificationStatus || offer.verificationStatus === 'PENDING') && (
                      <button
                        onClick={() => handleValidateOffer(offer)}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {t('im.validateOffer')}
                      </button>
                    )}
                    {isStudent && offer.verificationStatus === 'APPROVED' && (
                      cvStatus === 'approved' ? (
                        offer.applicationStatus ? (
                          <button
                            disabled
                            className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md cursor-not-allowed ${
                              offer.applicationStatus === 'PENDING_INTERVIEW'
                                ? 'text-blue-700 bg-blue-100'
                                : offer.applicationStatus === 'ACCEPTED' || offer.applicationStatus === 'ACCEPTED_BY_STUDENT'
                                  ? 'text-green-700 bg-green-100'
                                  : offer.applicationStatus === 'REJECTED' || offer.applicationStatus === 'REJECTED_BY_STUDENT'
                                    ? 'text-red-700 bg-red-100'
                                    : 'text-green-700 bg-green-100'
                            }`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {offer.applicationStatus === 'PENDING_INTERVIEW'
                              ? 'Entrevue en attente'
                              : offer.applicationStatus === 'APPROVED'
                                ? 'Candidature acceptée'
                                : offer.applicationStatus === 'ACCEPTED_BY_STUDENT'
                                    ? 'Offre de stage acceptée'
                                    : offer.applicationStatus === 'REJECTED' || offer.applicationStatus === "REJECTED_BY_STUDENT"
                                      ? 'Candidature refusée'
                                      : 'Candidature envoyée'
                            }
                          </button>
                        ) : (
                          <button
                            onClick={() => handleApplyClick(offer)}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            {t('student.apply')}
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-md cursor-not-allowed"
                          title={cvStatus === 'none' ? 'Téléversez un CV pour postuler' : 'Votre CV doit être approuvé pour postuler'}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {t('student.apply')}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{t('internship.description')}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{offer.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{t('internship.program')}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{offer.program}</p>
              </div>
              <div className='flex'>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{t('internship.requirements')}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{offer.requiredSkills}</p>
                </div>
                {offer.applicationStatus === "APPROVED" && <div className="flex gap-1 mt-4 ms-auto text-sm">
                        <button onClick={() => {setSelectedOfferToRespond(offer); setConfirmationType('ACCEPT_OFFER')}} className="rounded-sm px-2 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer">
                            Accepter
                        </button>
                        <button onClick={() => {setSelectedOfferToRespond(offer); setConfirmationType('REJECT_OFFER')}} className="rounded-sm px-2 bg-red-500 text-white hover:bg-red-600 hover:cursor-pointer">
                            Refuser
                        </button>
                    </div>}
              </div>
              {/* Affichage de la raison de rejet si applicable */}
              {offer.verificationStatus === 'REJECTED' && offer.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-red-800 mb-1">{t('dashboard.rejectionReason')}</h4>
                  <p className="text-sm text-red-700">{offer.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div
          className="fixed top-4 right-4 z-50 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-lg shadow-lg max-w-md">
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
    </div>
  );
}
