import { useState } from "react";
import type { InternshipOffer } from "~/interfaces";

interface ApplyOfferModalProps {
  offer: InternshipOffer | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (coverLetter: string) => void;
  error?: string;
}

export default function ApplyOfferModal({ offer, isOpen, onClose, onApply, error }: ApplyOfferModalProps) {
  const [coverLetter, setCoverLetter] = useState("");

  if (!isOpen || !offer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(coverLetter);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Postuler à cette offre
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.jobTitle}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>📍 {offer.address}</p>
              <p>⏱ {offer.duration} semaines | 📅 {offer.startDate}</p>
              {offer.salary > 0 && <p>💰 {offer.salary}$/h</p>}
            </div>
          </div>

          {/* Formulaire de candidature */}
          <form onSubmit={handleSubmit}>
            {/* Information sur le CV */}
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              ✓ Votre CV sera automatiquement joint à votre candidature.
            </div>

            {/* Lettre de motivation (optionnelle) */}
            <div className="mb-6">
              <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                Lettre de motivation (optionnelle)
              </label>
              <textarea
                id="coverLetter"
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 bg-white"
                placeholder="Expliquez pourquoi vous êtes intéressé par cette offre..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Ajoutez une lettre de motivation pour vous démarquer (recommandé mais non obligatoire)
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                ⚠ {error}
              </div>
            )}

            {/* Boutons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Confirmer ma candidature
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

