import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '~/services/apiService';
import type { Cv } from '~/interfaces';

interface CvValidationModalProps {
  cv: Cv;
  isOpen: boolean;
  onClose: () => void;
  onValidationSuccess: () => void;
}

export default function CvValidationModal({
  cv,
  isOpen,
  onClose,
  onValidationSuccess
}: CvValidationModalProps) {
  const { t } = useTranslation();
  const [isValidating, setIsValidating] = useState(false);
  const [validationType, setValidationType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleValidation = async (type: 'approve' | 'reject') => {
    if (!cv.studentId) {
      setError('ID de l\'étudiant manquant');
      return;
    }

    setIsValidating(true);
    setError(null);

    console.log('🚀 Starting CV validation:', {
      studentId: cv.studentId,
      type,
      approved: type === 'approve',
      comment: type === 'reject' ? comment : undefined
    });

    try {
      const response = await apiService.validateCv(
        cv.studentId,
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
        console.error('❌ CV Validation failed:', response.error);
        setError(response.error || 'Erreur lors de la validation du CV');
      }
    } catch (err) {
      console.error('❌ CV Validation error:', err);
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
        className="bg-gray-50 rounded-lg shadow-2xl border border-gray-200 max-w-6xl w-full mx-4 max-h-[100vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('im.validateCv')}
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
          {/* CV Details */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-3">{cv.firstName} {cv.lastName}</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                {cv.email}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {cv.cvFileName}
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {cv.cvFileType}
              </div>
              {cv.uploadedAt && (
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {t('cv.uploadedAt')}: {new Date(cv.uploadedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t('cv.currentStatus')}</h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cv.cvStatus === 'APPROVED' ? 'bg-green-100 text-green-800' :
              cv.cvStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
              {cv.cvStatus}
            </span>
          </div>

          {/* Existing Rejection Reason */}
          {cv.rejectionReason && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">{t('cv.previousRejectionReason')}</h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-red-50 p-3 rounded-lg border border-red-200">{cv.rejectionReason}</p>
            </div>
          )}

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
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${validationType === 'approve'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                } ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('im.approveCv')}
            </button>

            {/* Reject Button */}
            <button
              onClick={() => setValidationType('reject')}
              disabled={isValidating}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${validationType === 'reject'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                } ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('im.rejectCv')}
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
                  className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${validationType === 'approve'
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
