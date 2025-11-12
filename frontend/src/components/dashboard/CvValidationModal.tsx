import { useTranslation } from 'react-i18next';
import { internshipManagerAPI } from '~/services/InternshipManagerAPI';
import type { Cv } from '~/interfaces';
import BaseCvValidationModal from './BaseCvValidationModal';

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

  const handleValidate = async (type: 'approve' | 'reject', comment?: string) => {
    if (!cv.id) {
      return {
        success: false,
        error: 'ID de l\'étudiant manquant'
      };
    }

      const response = await internshipManagerAPI.validateCv(
        cv.id,
        type === 'approve',
      comment
      );

      if (response.success) {
      return { success: true };
      } else {
      return {
        success: false,
        error: response.error || 'Erreur lors de la validation du CV'
      };
    }
  };

  const isProcessed = (cv: Cv) => {
    const statusLower = cv.cvStatus?.toLowerCase();
    return statusLower === 'approved' || statusLower === 'rejected';
  };

  const getStatusDisplay = (cv: Cv) => {
    const statusLower = cv.cvStatus?.toLowerCase();
    
    if (statusLower === 'approved') {
      return {
        label: t('im.approved'),
        color: 'bg-green-100 text-green-800',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    } else if (statusLower === 'rejected') {
      return {
        label: t('im.rejected'),
        color: 'bg-red-100 text-red-800',
        bgColor: 'bg-red-100',
        iconColor: 'text-red-600'
      };
      } else {
      return {
        label: t('im.pending'),
        color: 'bg-yellow-100 text-yellow-800',
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600'
      };
    }
  };

  return (
    <BaseCvValidationModal
      cv={cv}
      isOpen={isOpen}
      onClose={onClose}
      onValidationSuccess={onValidationSuccess}
      onValidate={handleValidate}
      isProcessed={isProcessed}
      getStatusDisplay={getStatusDisplay}
      titleKey="im.validateCv"
      approveLabelKey="im.approveCv"
      rejectLabelKey="im.rejectCv"
      confirmApproveKey="im.confirmApprove"
      confirmRejectKey="im.confirmReject"
      rejectionCommentKey="im.rejectionReason"
      rejectionCommentPlaceholderKey="im.rejectionReasonPlaceholder"
      alreadyProcessedKey="im.cvAlreadyProcessed"
      alreadyProcessedMessageKey="im.cvAlreadyProcessedMessage"
      dateField="uploadedAt"
    />
  );
}
