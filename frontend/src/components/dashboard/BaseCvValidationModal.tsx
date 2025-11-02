import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { internshipManagerAPI } from '~/services/InternshipManagerAPI';
import type { Cv } from '~/interfaces';
import PdfViewer from './PdfViewer.client';

interface BaseCvValidationModalProps {
  cv: Cv;
  isOpen: boolean;
  onClose: () => void;
  onValidationSuccess: () => void;
  onValidate: (type: 'approve' | 'reject', comment?: string) => Promise<{ success: boolean; error?: string }>;
  isProcessed: (cv: Cv) => boolean;
  getStatusDisplay: (cv: Cv) => { label: string; color: string; bgColor: string; iconColor: string };
  titleKey: string;
  approveLabelKey: string;
  rejectLabelKey: string;
  confirmApproveKey: string;
  confirmRejectKey: string;
  rejectionCommentKey: string;
  rejectionCommentPlaceholderKey: string;
  alreadyProcessedKey: string;
  alreadyProcessedMessageKey: string;
  dateField?: 'applicationDate' | 'uploadedAt';
}

export default function BaseCvValidationModal({
  cv,
  isOpen,
  onClose,
  onValidationSuccess,
  onValidate,
  isProcessed,
  getStatusDisplay,
  titleKey,
  approveLabelKey,
  rejectLabelKey,
  confirmApproveKey,
  confirmRejectKey,
  rejectionCommentKey,
  rejectionCommentPlaceholderKey,
  alreadyProcessedKey,
  alreadyProcessedMessageKey,
  dateField = 'applicationDate'
}: BaseCvValidationModalProps) {
  const { t } = useTranslation();
  const [isValidating, setIsValidating] = useState(false);
  const [validationType, setValidationType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState<string>('/CVtest.pdf');
  const [isLoadingCv, setIsLoadingCv] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  // Load CV when modal opens
  useEffect(() => {
    const loadCv = async () => {
      if (!isOpen || !cv.id) {
        setCvUrl('/CVtest.pdf'); // Fallback to example PDF
        return;
      }

      setIsLoadingCv(true);
      setError(null);

      try {
        const response = await internshipManagerAPI.getCvBlob(cv.id);

        if (response.success && response.data) {
          // Check if the blob is actually a PDF (only for CV validation, not for applications)
          if (dateField === 'applicationDate' || response.data.type === 'application/pdf' || response.data.type === 'application/octet-stream') {
            const blobUrl = URL.createObjectURL(response.data);
            setCvUrl(blobUrl);
          } else {
            console.warn('Invalid blob type:', response.data.type);
            setError('Le CV n\'est pas un fichier PDF valide');
          }
        } else {
          console.warn('Failed to load CV:', response.error);
          setError(`Impossible de charger le CV: ${response.error}`);
        }
      } catch (err) {
        console.error('Error loading CV:', err);
        setError('Erreur lors du chargement du CV');
      } finally {
        setIsLoadingCv(false);
      }
    };

    loadCv();

    return () => {
      if (cvUrl && cvUrl.startsWith('blob:')) {
        URL.revokeObjectURL(cvUrl);
      }
    };
  }, [isOpen, cv.id, dateField]);

  useEffect(() => {
    if (isOpen && !isLoadingCv) {
      const timer = setTimeout(() => {
        setShowPdfViewer(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setShowPdfViewer(false);
    }
  }, [isOpen, isLoadingCv]);

  const handleValidation = async (type: 'approve' | 'reject') => {
    if (!cv.id) {
      setError('ID de l\'étudiant manquant');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const rejectionReason = type === 'reject' ? comment.trim() : undefined;
      const response = await onValidate(type, rejectionReason);

      if (response.success) {
        // Succès - fermer le modal et rafraîchir la liste
        setComment('');
        setValidationType(null);
        onValidationSuccess();
        onClose();
      } else {
        // Erreur
        setError(response.error || 'Erreur lors de la validation');
      }
    } catch (err) {
      console.error('Error validating:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setIsValidating(false);
    }
  };

  const handleDownload = async () => {
    if (!cv.id) {
      setError('ID de l\'étudiant manquant');
      return;
    }

    try {
      const response = await internshipManagerAPI.getCvBlob(cv.id);
      
      if (response.success && response.data) {
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = cv.cvFileName || `cv_${cv.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        setError(response.error || 'Erreur lors du téléchargement du CV');
      }
    } catch (err) {
      console.error('Download error:', err);
      setError('Erreur lors du téléchargement du CV');
    }
  };

  const handleClose = () => {
    console.log('Closing CV validation modal - cleaning up...');

    setShowPdfViewer(false);
    setComment('');
    setValidationType(null);
    setError(null);

    if (cvUrl && cvUrl.startsWith('blob:')) {
      console.log('Revoking blob URL:', cvUrl);
      URL.revokeObjectURL(cvUrl);
    }
    setCvUrl('/CVtest.pdf');

    onClose();
  };

  if (!isOpen) return null;

  const statusDisplay = getStatusDisplay(cv);
  const dateValue = cv[dateField];
  const processed = isProcessed(cv);

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
              {t(titleKey)}
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
        <div className="flex h-[80vh]">
          {/* Left Panel - CV Information and Actions */}
          <div className="w-1/3 px-6 py-4 border-r border-gray-200 overflow-y-auto">
            {/* Student Information */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('im.studentInfo')}</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cv.firstName} {cv.lastName}</p>
                  </div>
                </div>
                {cv.email && (
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cv.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CV File Information */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('im.cvDetails')}</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                {cv.cvFileName && (
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cv.cvFileName}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cv.cvFileType || 'PDF'}</p>
                  </div>
                </div>
                {dateValue && (
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{new Date(dateValue).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Current Status */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('im.currentStatus')}</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${statusDisplay.bgColor}`}>
                      <svg className={`w-3 h-3 ${statusDisplay.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                      {statusDisplay.label}
                    </span>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="flex items-center px-3 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('cv-details.downloadCv')}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Rejection Reason */}
            {cv.rejectionReason && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">{t('cv.previousRejectionReason')}</h4>
                <p className="text-xs text-gray-700 leading-relaxed bg-red-50 p-2 rounded-lg border border-red-200">{cv.rejectionReason}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Validation Actions */}
            {!processed ? (
              <div className="space-y-3">
                {/* Approve Button */}
                <button
                  onClick={() => setValidationType('approve')}
                  disabled={isValidating}
                  className={`w-full flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${validationType === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                    } ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t(approveLabelKey)}
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => setValidationType('reject')}
                  disabled={isValidating}
                  className={`w-full flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium transition-colors ${validationType === 'reject'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                    } ${isValidating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t(rejectLabelKey)}
                </button>

                {/* Comment for Rejection */}
                {validationType === 'reject' && (
                  <div className="mt-4">
                    <label htmlFor="rejection-comment" className="block text-sm font-medium text-gray-700 mb-2">
                      {t(rejectionCommentKey)} <span className="text-gray-500">({t('common.optional')})</span>
                    </label>
                    <textarea
                      id="rejection-comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder={t(rejectionCommentPlaceholderKey)}
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
                        validationType === 'approve' ? t(confirmApproveKey) : t(confirmRejectKey)
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Message for already processed */
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">
                    {t(alreadyProcessedKey)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {(() => {
                    // Get the status label to interpolate in the message
                    const statusDisplay = getStatusDisplay(cv);
                    const statusLabel = statusDisplay.label.toLowerCase();
                    return t(alreadyProcessedMessageKey, { status: statusLabel });
                  })()}
                </p>
              </div>
            )}
          </div>

          {/* Right Panel - PDF Viewer */}
          <div className="flex-1 bg-gray-100">
            {isLoadingCv ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement du CV...</p>
                </div>
              </div>
            ) : showPdfViewer ? (
              <PdfViewer
                fileUrl={cvUrl}
                onCleanup={() => {
                  console.log('PDF viewer cleanup completed for modal');
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p>PDF viewer fermé</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

