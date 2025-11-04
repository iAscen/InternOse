import { useTranslation } from "react-i18next";
import type { InternshipOffer, StudentApplication } from "~/interfaces";

interface OfferConfirmationModalProps {
    offer: InternshipOffer,
    mode: 'REJECT_OFFER' | 'ACCEPT_OFFER',
    onClose: () => void,
    onSubmit: () => void
}

export default function RespondToOfferModal({offer, mode, onClose, onSubmit}: OfferConfirmationModalProps) {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("dashboard.confirmYourDecisionMessage")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Détails de l'offre */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.title}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📍 {offer.address}</p>
              <p>⏱ {offer.duration} {t("internship.weeks")} | 📅 {offer.startDate}</p>
              {offer.salary > 0 && <p>💰 {offer.salary}$/h</p>}
            </div>
          </div>

          {/* Formulaire de candidature */}
          <form /*onSubmit={handleSubmit}*/>
            {/* Information importante */}
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
              {mode === "REJECT_OFFER" && (
                <p className="text-sm text-gray-700 font-semibold">
                    {t("dashboard.refuseOfferConfirmationMessage")}
                </p>
               )}
                {mode === "ACCEPT_OFFER" && (
                <p className="text-sm text-gray-700 font-semibold">
                    {t("dashboard.acceptOfferConfirmationMessage")}
                </p>
                )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={onSubmit}
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {t("common.confirm")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}