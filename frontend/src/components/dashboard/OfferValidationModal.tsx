import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { internshipManagerAPI } from '~/services/InternshipManagerAPI';
import type { InternshipOffer } from '~/interfaces';

interface OfferValidationModalProps {
  offer: InternshipOffer;
  isOpen: boolean;
  onClose: () => void;
  onValidationSuccess: () => void;
}

export default function OfferValidationModal({ 
  offer, 
  isOpen, 
  onClose, 
  onValidationSuccess 
}: OfferValidationModalProps) {
  const { t } = useTranslation();
  const [isValidating, setIsValidating] = useState(false);
  const [validationType, setValidationType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleValidation = async (type: 'approve' | 'reject') => {
    if (!offer.id) {
      setError('ID de l\'offre manquant');
      return;
    }
    
    setIsValidating(true);
    setError(null);

    console.log('🚀 Starting validation:', { 
      offerId: offer.id, 
      type, 
      approved: type === 'approve',
      comment: type === 'reject' ? comment : undefined 
    });

    try {
      const response = await internshipManagerAPI.validateInternshipOffer(
        offer.id, 
        type === 'approve', 
        type === 'reject' ? comment : undefined
      );

      console.log('🚀 Validation response:', response);

      if (response.success) {
        console.log('✅ Validation successful');
        onValidationSuccess();
        onClose();
        // Reset form
        setComment('');
        setValidationType(null);
      } else {
        console.error('❌ Validation failed:', response.error);
        setError(response.error || 'Erreur lors de la validation');
      }
    } catch (err) {
      console.error('❌ Validation error:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    setComment('');
    setValidationType(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div 
        className="bg-gray-50 rounded-lg shadow-2xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('im.validateOffer')}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Offer Details */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">{offer.title}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {offer.address}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {offer.startDate} - {offer.endDate}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {offer.duration} {t('internship.weeks')}
              </div>
              {offer.salary > 0 && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  ${offer.salary}{t('internship.perHour')}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t('internship.description')}</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{offer.description}</p>
          </div>

          {/* Requirements */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t('internship.requirements')}</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{offer.requiredSkills}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Validation Actions */}
          <div className="space-y-4">
            {/* Approve Button */}
            <button
              onClick={() => setValidationType('approve')}
              disabled={isValidating}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${
                validationType === 'approve'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
              } ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('im.approveOffer')}
            </button>

            {/* Reject Button */}
            <button
              onClick={() => setValidationType('reject')}
              disabled={isValidating}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${
                validationType === 'reject'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
              } ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('im.rejectOffer')}
            </button>

            {/* Comment for Rejection */}
            {validationType === 'reject' && (
              <div className="mt-4">
                <label htmlFor="rejection-comment" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('im.rejectionReason')} <span className="text-gray-500">({t('common.optional')})</span>
                </label>
                <textarea
                  id="rejection-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  placeholder={t('im.rejectionReasonPlaceholder')}
                />
              </div>
            )}

            {/* Action Buttons */}
            {validationType && (
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setValidationType(null)}
                  disabled={isValidating}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => handleValidation(validationType)}
                  disabled={isValidating}
                  className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${
                    validationType === 'approve'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isValidating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('common.processing')}
                    </div>
                  ) : (
                    validationType === 'approve' ? t('im.confirmApprove') : t('im.confirmReject')
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
