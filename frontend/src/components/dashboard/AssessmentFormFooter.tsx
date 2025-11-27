import { useTranslation } from 'react-i18next';

interface AssessmentFormFooterProps {
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
}

export default function AssessmentFormFooter({
  error,
  loading,
  onClose,
  onSubmit,
  submitLabel,
}: AssessmentFormFooterProps) {
  const { t } = useTranslation();

  return (
    <div className="flex justify-between gap-3 p-6 flex-shrink-0 border-t border-gray-200 bg-gray-50">
      <div className="flex-1 flex items-center">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-300 rounded-lg px-4 py-2 max-w-2xl">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {t('common.cancel')}
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t('common.submitting') || 'Soumission en cours...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

