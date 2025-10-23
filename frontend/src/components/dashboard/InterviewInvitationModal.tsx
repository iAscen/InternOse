import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Cv, InternshipOffer, CreateInterviewInvitationRequest } from '~/interfaces';

interface InterviewInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Cv;
  internshipOffer: InternshipOffer;
  onInvitationSent?: (invitation: CreateInterviewInvitationRequest) => void;
}

export default function InterviewInvitationModal({
  isOpen,
  onClose,
  student,
  internshipOffer,
  onInvitationSent
}: InterviewInvitationModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    interviewDate: '',
    interviewTime: '',
    interviewMode: 'IN_PERSON' as 'ONLINE' | 'IN_PERSON',
    location: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.interviewDate) {
      newErrors.interviewDate = t('interviewInvitation.errors.dateRequired');
    }

    if (!formData.interviewTime) {
      newErrors.interviewTime = t('interviewInvitation.errors.timeRequired');
    }

    if (formData.interviewMode === 'IN_PERSON' && !formData.location.trim()) {
      newErrors.location = t('interviewInvitation.errors.locationRequired');
    }

    if (formData.interviewMode === 'ONLINE' && !formData.location.trim()) {
      newErrors.location = t('interviewInvitation.errors.meetingLinkRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Combiner la date et l'heure en format ISO
      const interviewDateTime = `${formData.interviewDate}T${formData.interviewTime}:00`;
      
      const invitation: CreateInterviewInvitationRequest = {
        studentId: student.id!,
        internshipOfferId: internshipOffer.id!,
        interviewDate: interviewDateTime,
        interviewMode: formData.interviewMode,
        location: formData.location.trim() || undefined,
        message: formData.message.trim() || undefined
      };

      // TODO: Appel API pour envoyer la convocation
      console.log('Sending invitation:', invitation);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onInvitationSent) {
        onInvitationSent(invitation);
      }

      // Réinitialiser le formulaire
      setFormData({
        interviewDate: '',
        interviewTime: '',
        interviewMode: 'IN_PERSON',
        location: '',
        message: ''
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      setErrors({ submit: t('interviewInvitation.errors.sendFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    // Limiter le message à 500 caractères
    if (field === 'message' && value.length > 500) {
      return;
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleModeChange = (mode: 'ONLINE' | 'IN_PERSON') => {
    setFormData(prev => ({ 
      ...prev, 
      interviewMode: mode,
      location: '' // Réinitialiser le lieu
    }));
    setErrors(prev => ({ ...prev, location: '' }));
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-300 bg-gray-100 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('interviewInvitation.title')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('interviewInvitation.subtitle', { 
                  studentName: `${student.firstName} ${student.lastName}`,
                  offerTitle: internshipOffer.title 
                })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="space-y-6">
            {/* Date et heure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interviewInvitation.date')} *
                </label>
                <input
                  type="date"
                  value={formData.interviewDate}
                  onChange={(e) => handleInputChange('interviewDate', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                    errors.interviewDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.interviewDate && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.interviewDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('interviewInvitation.time')} *
                </label>
                <input
                  type="time"
                  value={formData.interviewTime}
                  onChange={(e) => handleInputChange('interviewTime', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 ${
                    errors.interviewTime ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                />
                {errors.interviewTime && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.interviewTime}
                  </p>
                )}
              </div>
            </div>

            {/* Mode de l'entrevue */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('interviewInvitation.mode')} *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.interviewMode === 'IN_PERSON' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="interviewMode"
                    value="IN_PERSON"
                    checked={formData.interviewMode === 'IN_PERSON'}
                    onChange={() => handleModeChange('IN_PERSON')}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    formData.interviewMode === 'IN_PERSON' 
                      ? 'border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.interviewMode === 'IN_PERSON' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{t('interviewInvitation.inPerson')}</div>
                    <div className="text-sm text-gray-500">Rencontre physique</div>
                  </div>
                </label>
                
                <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.interviewMode === 'ONLINE' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="interviewMode"
                    value="ONLINE"
                    checked={formData.interviewMode === 'ONLINE'}
                    onChange={() => handleModeChange('ONLINE')}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    formData.interviewMode === 'ONLINE' 
                      ? 'border-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {formData.interviewMode === 'ONLINE' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{t('interviewInvitation.online')}</div>
                    <div className="text-sm text-gray-500">Visioconférence</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Lieu ou lien de réunion */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.interviewMode === 'ONLINE' 
                  ? t('interviewInvitation.meetingLink') 
                  : t('interviewInvitation.location')
                } *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {formData.interviewMode === 'ONLINE' ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={formData.interviewMode === 'ONLINE' 
                    ? t('interviewInvitation.meetingLinkPlaceholder')
                    : t('interviewInvitation.locationPlaceholder')
                  }
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 ${
                    errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                />
              </div>
              {errors.location && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.location}
                </p>
              )}
            </div>

            {/* Message personnalisé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('interviewInvitation.message')}
                <span className="text-gray-500 font-normal ml-1">(optionnel)</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder={t('interviewInvitation.messagePlaceholder')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors hover:border-gray-400 resize-none text-gray-900 placeholder-gray-500 bg-white"
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {formData.message.length}/500
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('interviewInvitation.sending')}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {t('interviewInvitation.send')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
