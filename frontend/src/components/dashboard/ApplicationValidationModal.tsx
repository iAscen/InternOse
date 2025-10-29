import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { internshipManagerAPI } from '~/services/InternshipManagerAPI';
import type { Cv } from '~/interfaces';
import PdfViewer from './PdfViewer.client';

interface ApplicationValidationModalProps {
  cv: Cv;
  isOpen: boolean;
  onClose: () => void;
  onValidationSuccess: () => void;
}

export default function ApplicationValidationModalProps({
  cv,
  isOpen,
  onClose
}: ApplicationValidationModalProps) {
  const { t } = useTranslation();
  //Peut etre utile pour la story EQ6-14, mais effacer si pas necessaire
  //const [isValidating, setIsValidating] = useState(false);
  //const [validationType, setValidationType] = useState<'approve' | 'reject' | null>(null);
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
          const blobUrl = URL.createObjectURL(response.data);
          setCvUrl(blobUrl);
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
  }, [isOpen, cv.id]);

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
    // methode pour la validation de l'application, effacer si vous voulez
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
    //setValidationType(null);
    setError(null);

    if (cvUrl && cvUrl.startsWith('blob:')) {
      console.log('Revoking blob URL:', cvUrl);
      URL.revokeObjectURL(cvUrl);
    }
    setCvUrl('/CVtest.pdf');

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
              {t('dashboard.internshipApplications.validateApplication')}
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
                {/*<div className="flex items-center">*/}
                {/*  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">*/}
                {/*    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                {/*      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />*/}
                {/*    </svg>*/}
                {/*  </div>*/}
                {/*  <div>*/}
                {/*    <p className="text-sm font-medium text-gray-900">{cv.email}</p>*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>
            </div>

            {/* CV File Information */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('im.cvDetails')}</h4>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex items-center">
                  {/*<div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">*/}
                  {/*  <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                  {/*    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />*/}
                  {/*  </svg>*/}
                  {/*</div>*/}
                  {/*<div>*/}
                  {/*  <p className="text-sm font-medium text-gray-900">{cv.cvFileName}</p>*/}
                  {/*</div>*/}
                </div>
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
                {cv.applicationDate && (
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{new Date(cv.applicationDate).toLocaleDateString()}</p>
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
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${cv.applicationStatus === 'ACCEPTED' ? 'bg-green-100' :
                      cv.applicationStatus === 'REJECTED' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                      <svg className={`w-3 h-3 ${cv.applicationStatus === 'ACCEPTED' ? 'text-green-600' :
                        cv.applicationStatus === 'REJECTED' ? 'text-red-600' :
                          'text-yellow-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${cv.applicationStatus === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      cv.applicationStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {cv.applicationStatus === 'ACCEPTED' ? t('im.approved') : 
                       cv.applicationStatus === 'REJECTED' ? t('im.rejected') : 
                       t('im.pending')}
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

            {/*Les boutons pour la validation vont la*/}
            
            {
            /*
             

            */
            }
            
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