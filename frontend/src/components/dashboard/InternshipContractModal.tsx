import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {Cv, InternshipOffer} from "~/interfaces";

interface InternshipContractModalData {
  studentId?: number;
  internshipOfferId: number;
  startDate: string;
  endDate: string;
  weeklyHours: string;
  tasks: string;
  educationalObjectives: string;
  supervisorName: string;
  supervisorTitle: string;
  supervisorEmail: string;
  supervisorPhone: string;
}

interface InternshipContractModalProps {
  student: Cv;
  internshipOffer: InternshipOffer;
  studentId?: number; // remove
  internshipOfferId?: number; //todo remove
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

export default function InternshipContractModal({
  student,
  internshipOffer,
  studentId,
  internshipOfferId,
  onSubmit,
  onCancel
}: InternshipContractModalProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<InternshipContractModalData>({
    studentId: student.id,
    internshipOfferId: internshipOffer.id,
    startDate: '',
    endDate: '',
    weeklyHours: '',
    tasks: '',
    educationalObjectives: '',
    supervisorName: '',
    supervisorTitle: '',
    supervisorEmail: '',
    supervisorPhone: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = t('internshipContract.errors.startDateRequired');
    }

    if (!formData.endDate) {
      newErrors.endDate = t('internshipContract.errors.endDateRequired');
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = t('internshipContract.errors.endDateAfterStart');
    }

    if (!formData.weeklyHours) {
      newErrors.weeklyHours = t('internshipContract.errors.weeklyHoursRequired');
    } else if (parseInt(formData.weeklyHours) <= 0) {
      newErrors.weeklyHours = t('internshipContract.errors.weeklyHoursPositive');
    } else if (parseInt(formData.weeklyHours) > 168) {
      newErrors.weeklyHours = t('internshipContract.errors.weeklyHoursMax');
    }

    if (!formData.tasks.trim()) {
      newErrors.tasks = t('internshipContract.errors.tasksRequired');
    } else if (formData.tasks.length > 1000) {
      newErrors.tasks = t('internshipContract.errors.tasksMaxLength');
    }

    if (!formData.educationalObjectives.trim()) {
      newErrors.educationalObjectives = t('internshipContract.errors.educationalObjectivesRequired');
    } else if (formData.educationalObjectives.length > 1000) {
      newErrors.educationalObjectives = t('internshipContract.errors.educationalObjectivesMaxLength');
    }

    if (!formData.supervisorName.trim()) {
      newErrors.supervisorName = t('internshipContract.errors.supervisorNameRequired');
    }

    if (!formData.supervisorTitle.trim()) {
      newErrors.supervisorTitle = t('internshipContract.errors.supervisorTitleRequired');
    }

    if (!formData.supervisorEmail.trim()) {
      newErrors.supervisorEmail = t('internshipContract.errors.supervisorEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supervisorEmail)) {
      newErrors.supervisorEmail = t('internshipContract.errors.supervisorEmailInvalid');
    }

    if (!formData.supervisorPhone.trim()) {
      newErrors.supervisorPhone = t('internshipContract.errors.supervisorPhoneRequired');
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.supervisorPhone)) {
      newErrors.supervisorPhone = t('internshipContract.errors.supervisorPhoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof InternshipContractModalData, value: string) => {
    // limit 1000 characters
    if ((field === 'tasks' || field === 'educationalObjectives') && value.length > 1000) {
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const contractData = {
        studentId,
        internshipOfferId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        weeklyHours: parseInt(formData.weeklyHours),
        tasks: formData.tasks.trim(),
        educationalObjectives: formData.educationalObjectives.trim(),
        supervisorName: formData.supervisorName.trim(),
        supervisorTitle: formData.supervisorTitle.trim(),
        supervisorEmail: formData.supervisorEmail.trim(),
        supervisorPhone: formData.supervisorPhone.trim()
      };

      if (onSubmit) {
        await onSubmit(contractData);
      }

      // reset form
      setFormData({
        studentId: student.id,
        internshipOfferId: internshipOffer.id,
        startDate: '',
        endDate: '',
        weeklyHours: '',
        tasks: '',
        educationalObjectives: '',
        supervisorName: '',
        supervisorTitle: '',
        supervisorEmail: '',
        supervisorPhone: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error creating contract:', error);
      setErrors({ submit: 'Erreur lors de la création du contrat' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      studentId: student.id,
      internshipOfferId: internshipOffer.id,
      startDate: '',
      endDate: '',
      weeklyHours: '',
      tasks: '',
      educationalObjectives: '',
      supervisorName: '',
      supervisorTitle: '',
      supervisorEmail: '',
      supervisorPhone: ''
    });
    setErrors({});
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-50"
      onClick={onCancel}
    >

     <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}>

        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('internshipContract.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('internshipContract.subtitle', {
                studentName: `${student.firstName} ${student.lastName}`,
                offerTitle: internshipOffer.title
              })}
            </p>
          </div>
          <button
            onClick={() => {
              if (onCancel) {
                onCancel()
              }
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">

          <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('internshipContract.title')}
              </h2>
              <p className="text-gray-600">
                {t('internshipContract.description')}
              </p>
            </div>

            {errors.submit && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('internshipContract.internshipPeriod')}</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* date debut */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('internshipContract.startDate')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.startDate || internshipOffer.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      min="2025-01-01"
                      className={`text-black w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.startDate}
                      </p>
                    )}
                  </div>

                  {/* date fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('internshipContract.endDate')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.endDate || internshipOffer.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      min={formData.startDate || "2025-01-01"}
                      className={`text-black w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.endDate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.endDate}
                      </p>
                    )}
                  </div>

                  {/* heures hebdomadaires */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('internshipContract.weeklyHours')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.weeklyHours}
                      onChange={(e) => handleInputChange('weeklyHours', e.target.value)}
                      min="1"
                      max="168"
                      placeholder={t('internshipContract.weeklyHoursPlaceholder')}
                      className={`text-black w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.weeklyHours ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.weeklyHours && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.weeklyHours}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* section taches */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('internshipContract.tasks')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.tasks}
                  onChange={(e) => handleInputChange('tasks', e.target.value)}
                  placeholder={t('internshipContract.tasksPlaceholder')}
                  rows={5}
                  className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                    errors.tasks ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.tasks && (
                      <p className="text-red-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.tasks}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm ${formData.tasks.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
              {formData.tasks.length}/1000
            </span>
                </div>
              </div>

              {/* section objectifs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('internshipContract.educationalObjectives')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.educationalObjectives}
                  onChange={(e) => handleInputChange('educationalObjectives', e.target.value)}
                  placeholder={t('internshipContract.educationalObjectivesPlaceholder')}
                  rows={5}
                  className={`text-black w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                    errors.educationalObjectives ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.educationalObjectives && (
                      <p className="text-red-500 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.educationalObjectives}
                      </p>
                    )}
                  </div>
                  <span className={`text-sm ${formData.educationalObjectives.length > 900 ? 'text-red-500' : 'text-gray-500'}`}>
              {formData.educationalObjectives.length}/1000
            </span>
                </div>
              </div>

              {/* section superviseur */}
              <div className="bg-gray-50 p-5 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('internshipContract.supervisorInfo')}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('internshipContract.supervisorName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.supervisorName}
                      onChange={(e) => handleInputChange('supervisorName', e.target.value)}
                      placeholder={t('internshipContract.supervisorNamePlaceholder')}
                      className={`text-black w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.supervisorName ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.supervisorName && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.supervisorName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('internshipContract.supervisorTitle')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.supervisorTitle}
                      onChange={(e) => handleInputChange('supervisorTitle', e.target.value)}
                      placeholder={t('internshipContract.supervisorTitlePlaceholder')}
                      className={`text-black w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.supervisorTitle ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.supervisorTitle && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.supervisorTitle}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('internshipContract.supervisorEmail')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.supervisorEmail}
                      onChange={(e) => handleInputChange('supervisorEmail', e.target.value)}
                      placeholder={t('internshipContract.supervisorEmailPlaceholder')}
                      className={`text-black w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.supervisorEmail ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.supervisorEmail && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.supervisorEmail}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('internshipContract.supervisorPhone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.supervisorPhone}
                      onChange={(e) => handleInputChange('supervisorPhone', e.target.value)}
                      placeholder={t('internshipContract.supervisorPhonePlaceholder')}
                      className={`text-black w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.supervisorPhone ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    />
                    {errors.supervisorPhone && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.supervisorPhone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('internshipContract.creating')}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t('internshipContract.createContract')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>


    </div>

  );
}
