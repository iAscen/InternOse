import { useTranslation } from 'react-i18next';
import type { InternshipOffer } from '~/interfaces';

interface OfferActionButtonsProps {
  offer: InternshipOffer;
  isStudent: boolean;
  isEmployer: boolean;
  cvStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  onApply?: (offer: InternshipOffer) => void;
  onAccept?: (offer: InternshipOffer) => void;
  onReject?: (offer: InternshipOffer) => void;
  onViewContract?: (offer: InternshipOffer) => void;
  onValidate?: (offer: InternshipOffer) => void;
  onSelect?: (offer: InternshipOffer) => void;
  loadingContract?: boolean;
  isHistory?: boolean;
}

export default function OfferActionButtons({
  offer,
  isStudent,
  isEmployer,
  cvStatus,
  onApply,
  onAccept,
  onReject,
  onViewContract,
  onValidate,
  onSelect,
  loadingContract = false,
  isHistory = false,
}: OfferActionButtonsProps) {
  const { t } = useTranslation();

  // Helper pour obtenir les informations de statut
  const getStatusInfo = (status: string | undefined) => {
    if (!status) return null;
    
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
          badgeClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
      case 'ACCEPTED_BY_STUDENT':
        return {
          text: t('im.acceptedByStudent'),
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
      default:
        return null;
    }
  };

  // Actions principales (en haut à droite de la carte)
  const renderPrimaryActions = () => {
    // Pour IM - Validation d'offre (hide when isHistory)
    if (!isEmployer && !isStudent && !isHistory) {
      if (!offer.verificationStatus || offer.verificationStatus === 'PENDING') {
        return (
          <button
            onClick={() => onValidate?.(offer)}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('im.validateOffer')}
          </button>
        );
      }
      // Pour les offres approuvées, on ne montre plus le bouton "Entente de stage"
      // La carte entière est cliquable (géré dans OfferList.tsx)
      if (offer.verificationStatus === 'APPROVED') {
        return null;
      }
    }

    // Pour Student - Postuler (seulement si pas encore postulé)
    if (isStudent && offer.verificationStatus === 'APPROVED') {
      if (cvStatus === 'approved') {
        if (!offer.applicationStatus) {
          // Bouton Postuler (seulement si pas encore postulé)
          return (
            <button
              onClick={() => onApply?.(offer)}
              className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('student.apply')}
            </button>
          );
        }
        // Si déjà postulé, ne rien afficher ici (le badge est dans getStatusBadge)
        return null;
      } else {
        // CV non approuvé - bouton désactivé
        return (
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
            title={cvStatus === 'none' ? t('student.cvRequiredMessage') : t('student.cvPendingMessage')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t('student.apply')}
          </button>
        );
      }
    }

    return null;
  };

  // Actions secondaires (en bas de la carte)
  const renderSecondaryActions = () => {
    if (!isStudent) return null;

    // Boutons Accepter/Refuser quand APPROVED ou PENDING_ACCEPTANCE
    if (offer.applicationStatus === 'APPROVED' || offer.applicationStatus === 'PENDING_ACCEPTANCE') {
      return (
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onAccept?.(offer)}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('common.accept')}
          </button>
          <button
            onClick={() => onReject?.(offer)}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('common.refuse')}
          </button>
        </div>
      );
    }

    // Bouton Voir l'entente quand PENDING_CONTRACT
    if (offer.applicationStatus === 'PENDING_CONTRACT') {
      return (
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onViewContract?.(offer)}
            disabled={loadingContract}
            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {loadingContract ? t('common.loading') : t('internshipContract.viewContract')}
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Actions principales - en haut à droite */}
      {renderPrimaryActions()}
    </>
  );
}

// Export séparé pour les actions secondaires
export function OfferSecondaryActions({
  offer,
  isStudent,
  onAccept,
  onReject,
  onViewContract,
  loadingContract = false,
}: {
  offer: InternshipOffer;
  isStudent: boolean;
  onAccept?: (offer: InternshipOffer) => void;
  onReject?: (offer: InternshipOffer) => void;
  onViewContract?: (offer: InternshipOffer) => void;
  loadingContract?: boolean;
}) {
  const { t } = useTranslation();

  if (!isStudent) return null;

  // Boutons Accepter/Refuser quand APPROVED ou PENDING_ACCEPTANCE
  if (offer.applicationStatus === 'APPROVED' || offer.applicationStatus === 'PENDING_ACCEPTANCE') {
    return (
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => onAccept?.(offer)}
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {t('common.accept')}
        </button>
        <button
          onClick={() => onReject?.(offer)}
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('common.refuse')}
        </button>
      </div>
    );
  }

  // Bouton Voir l'entente quand PENDING_CONTRACT
  if (offer.applicationStatus === 'PENDING_CONTRACT') {
    return (
      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => onViewContract?.(offer)}
          disabled={loadingContract}
          className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {loadingContract ? t('common.loading') : t('internshipContract.viewContract')}
        </button>
      </div>
    );
  }

  return null;
}

