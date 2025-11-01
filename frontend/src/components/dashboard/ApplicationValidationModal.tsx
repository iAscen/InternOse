import { useTranslation } from 'react-i18next';
import { employerAPI } from '~/services/EmployerAPI';
import type { Cv, InternshipOffer } from '~/interfaces';
import BaseCvValidationModal from './BaseCvValidationModal';

interface ApplicationValidationModalProps {
  cv: Cv;
  internshipOffer: InternshipOffer;
  isOpen: boolean;
  onClose: () => void;
  onValidationSuccess: () => void;
}

export default function ApplicationValidationModal({
  cv,
  internshipOffer,
  isOpen,
  onClose,
  onValidationSuccess
}: ApplicationValidationModalProps) {
  const { t } = useTranslation();

  const handleValidate = async (type: 'approve' | 'reject', comment?: string) => {
    if (!internshipOffer.id || !cv.id) {
      return {
        success: false,
        error: t('dashboard.internshipApplications.missingIds')
      };
    }

    const status = type === 'approve' ? 'APPROVED' : 'REJECTED';
    const response = await employerAPI.updateApplicationStatus(
      internshipOffer.id,
      cv.id,
      status,
      comment
    );

    if (response.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: response.error || t('dashboard.internshipApplications.validationError')
      };
    }
  };

  const isProcessed = (cv: Cv) => {
    return cv.applicationStatus === 'ACCEPTED' || 
           cv.applicationStatus === 'APPROVED' || 
           cv.applicationStatus === 'REJECTED';
  };

  const getStatusDisplay = (cv: Cv) => {
    const isApproved = cv.applicationStatus === 'ACCEPTED' || cv.applicationStatus === 'APPROVED';
    const isRejected = cv.applicationStatus === 'REJECTED';
    
    if (isApproved) {
      return {
        label: t('im.approved'),
        color: 'bg-green-100 text-green-800',
        bgColor: 'bg-green-100',
        iconColor: 'text-green-600'
      };
    } else if (isRejected) {
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
      titleKey="dashboard.internshipApplications.validateApplication"
      approveLabelKey="dashboard.internshipApplications.acceptApplication"
      rejectLabelKey="dashboard.internshipApplications.rejectApplication"
      confirmApproveKey="dashboard.internshipApplications.acceptApplication"
      confirmRejectKey="dashboard.internshipApplications.confirmReject"
      rejectionCommentKey="dashboard.internshipApplications.rejectionComment"
      rejectionCommentPlaceholderKey="dashboard.internshipApplications.rejectionCommentPlaceholder"
      alreadyProcessedKey="dashboard.internshipApplications.alreadyProcessed"
      alreadyProcessedMessageKey="dashboard.internshipApplications.alreadyProcessedMessage"
      dateField="applicationDate"
    />
  );
}