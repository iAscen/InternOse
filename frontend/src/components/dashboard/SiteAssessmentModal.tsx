import { useTranslation } from 'react-i18next';
import type { SiteAssessment, InternshipContract, SiteAssessmentOptions, OverallSiteAppreciation, Recommendation } from '~/interfaces';
import { useEffect, useState } from "react";
import { professorAPI } from "~/services/ProfessorAPI";
import AssessmentModalLayout from './AssessmentModalLayout';
import AssessmentCriteriaSection, { type AssessmentCriterion, type AssessmentOption } from './AssessmentCriteriaSection';
import AssessmentViewSection from './AssessmentViewSection';
import AssessmentFormFooter from './AssessmentFormFooter';

interface SiteAssessmentModalProps {
  contract: InternshipContract;
  onClose: () => void;
  siteAssessment?: SiteAssessment | null;
}

export default function SiteAssessmentModal({
  contract,
  onClose,
  siteAssessment: initialAssessment
}: SiteAssessmentModalProps) {
  const { t } = useTranslation();
  const [siteAssessment, setSiteAssessment] = useState<SiteAssessment | null>(initialAssessment || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Critères d'évaluation du milieu de stage
  const assessmentCriteria: AssessmentCriterion[] = [
    { key: 'Accueil et intégration', label: t('siteAssessment.criteria.welcome') },
    { key: 'Qualité de l\'encadrement', label: t('siteAssessment.criteria.supervision') },
    { key: 'Pertinence des tâches', label: t('siteAssessment.criteria.tasks') },
    { key: 'Clarté des objectifs', label: t('siteAssessment.criteria.objectives') },
    { key: 'Communication', label: t('siteAssessment.criteria.communication') },
    { key: 'Conformité académique', label: t('siteAssessment.criteria.academicConformity') },
  ];

  const assessmentOptions: AssessmentOption[] = [
    { value: 'EXCELLENT', label: t('siteAssessment.ratings.EXCELLENT') },
    { value: 'VERY_GOOD', label: t('siteAssessment.ratings.VERY_GOOD') },
    { value: 'GOOD', label: t('siteAssessment.ratings.GOOD') },
    { value: 'SATISFACTORY', label: t('siteAssessment.ratings.SATISFACTORY') },
    { value: 'UNSATISFACTORY', label: t('siteAssessment.ratings.UNSATISFACTORY') },
    { value: 'NOT_APPLICABLE', label: t('siteAssessment.ratings.NOT_APPLICABLE') },
  ];

  const initialSiteAssessment = assessmentCriteria.reduce((acc) => acc, {} as Record<string, SiteAssessmentOptions>);

  const [formData, setFormData] = useState<SiteAssessment>({
    studentName: `${contract.studentFirstName || ''} ${contract.studentLastName || ''}`.trim(),
    companyName: contract.employerCompany || '',
    supervisorName: contract.supervisorName || '',
    internshipPosition: contract.internshipOfferTitle || '',
    internshipDuration: contract.startDate && contract.endDate 
      ? `${new Date(contract.startDate).toLocaleDateString('fr-CA')} - ${new Date(contract.endDate).toLocaleDateString('fr-CA')}`
      : '',
    siteAssessment: initialSiteAssessment,
    siteAssessmentComments: {},
    overallSiteAppreciation: 'GOOD',
    generalComments: '',
    recommendation: 'RECOMMEND',
    academicConformity: '',
    professorName: `${contract.professorFirstName || ''} ${contract.professorLastName || ''}`.trim(),
    signature: '',
    assessmentDate: '',
  });

  useEffect(() => {
    const loadAssessment = async () => {
      // Afficher le formulaire immédiatement
      setShowForm(true);
      
      if (initialAssessment) {
        setSiteAssessment(initialAssessment);
        setShowForm(false);
        return;
      }

      if (contract.professorId && contract.id) {
        try {
          // Charger en arrière-plan sans bloquer l'affichage
          const response = await professorAPI.findSiteAssessment(contract.professorId, contract.id);
          if (response.success && response.data) {
            setSiteAssessment(response.data);
            setShowForm(false);
          }
        } catch (err) {
          console.error('Error loading assessment:', err);
          // Le formulaire reste affiché
        }
      }
    };
    loadAssessment();
  }, [contract.professorId, contract.id, initialAssessment]);

  const getAssessmentLabel = (value: SiteAssessmentOptions): string => {
    const labels: Record<SiteAssessmentOptions, string> = {
      'EXCELLENT': t('siteAssessment.options.EXCELLENT'),
      'VERY_GOOD': t('siteAssessment.options.VERY_GOOD'),
      'GOOD': t('siteAssessment.options.GOOD'),
      'SATISFACTORY': t('siteAssessment.options.SATISFACTORY'),
      'UNSATISFACTORY': t('siteAssessment.options.UNSATISFACTORY'),
      'NOT_APPLICABLE': t('siteAssessment.options.NOT_APPLICABLE'),
    };
    return labels[value] || value;
  };

  const getAppreciationLabel = (value: OverallSiteAppreciation): string => {
    const labels: Record<OverallSiteAppreciation, string> = {
      'EXCELLENT': t('siteAssessment.appreciationOptions.EXCELLENT'),
      'VERY_GOOD': t('siteAssessment.appreciationOptions.VERY_GOOD'),
      'GOOD': t('siteAssessment.appreciationOptions.GOOD'),
      'SATISFACTORY': t('siteAssessment.appreciationOptions.SATISFACTORY'),
      'UNSATISFACTORY': t('siteAssessment.appreciationOptions.UNSATISFACTORY'),
    };
    return labels[value] || value;
  };

  const getRecommendationLabel = (value: Recommendation): string => {
    const labels: Record<Recommendation, string> = {
      'STRONGLY_RECOMMEND': t('siteAssessment.recommendationOptions.STRONGLY_RECOMMEND'),
      'RECOMMEND': t('siteAssessment.recommendationOptions.RECOMMEND'),
      'RECOMMEND_WITH_RESERVATIONS': t('siteAssessment.recommendationOptions.RECOMMEND_WITH_RESERVATIONS'),
      'DO_NOT_RECOMMEND': t('siteAssessment.recommendationOptions.DO_NOT_RECOMMEND'),
    };
    return labels[value] || value;
  };

  const handleInputChange = (field: keyof SiteAssessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAssessmentChange = (criterion: string, value: SiteAssessmentOptions) => {
    setFormData(prev => ({
      ...prev,
      siteAssessment: {
        ...prev.siteAssessment,
        [criterion]: value,
      },
    }));
  };

  const handleCommentChange = (criterion: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      siteAssessmentComments: {
        ...prev.siteAssessmentComments,
        [criterion]: value,
      },
    }));
  };

  const isFormValid = (): boolean => {
    if (!formData.signature) {
      return false;
    }
    // Vérifier que tous les critères sont évalués
    const missingCriteria = assessmentCriteria.filter(
      criterion => !formData.siteAssessment[criterion.key]
    );
    return missingCriteria.length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitAttempted(true);

    if (!isFormValid()) {
      setError(t('siteAssessment.errors.incompleteForm'));
      return;
    }

    if (!contract.professorId || !contract.id) {
      setError(t('siteAssessment.errors.missingInfo'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const assessmentData = {
        ...formData,
        assessmentDate: new Date().toISOString().split('T')[0],
      };

      const response = await professorAPI.saveSiteAssessment(
        contract.professorId,
        contract.id,
        assessmentData
      );

      if (response.success && response.data) {
        setSiteAssessment(response.data);
        setShowForm(false);
      } else {
        setError(response.error || t('siteAssessment.errors.submissionError'));
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(t('siteAssessment.errors.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <AssessmentModalLayout
      title={t('siteAssessment.title')}
      subtitle={contract.employerCompany || t('siteAssessment.assessment')}
      onClose={onClose}
      loading={false}
      footer={
        showForm && !siteAssessment ? (
          <AssessmentFormFooter
            error={error}
            loading={loading}
            onClose={onClose}
            onSubmit={() => handleSubmit()}
            submitLabel={t('siteAssessment.submit')}
          />
        ) : (
          <div className="flex justify-end p-6 flex-shrink-0 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              {t('common.close')}
            </button>
          </div>
        )
      }
    >
      {siteAssessment && !showForm ? (
        <>
          {/* Informations générales */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.generalInformation')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('siteAssessment.studentName')}</p>
                <p className="text-sm text-gray-900">{siteAssessment.studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('siteAssessment.companyName')}</p>
                <p className="text-sm text-gray-900">{siteAssessment.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('siteAssessment.supervisorName')}</p>
                <p className="text-sm text-gray-900">{siteAssessment.supervisorName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('siteAssessment.internshipPosition')}</p>
                <p className="text-sm text-gray-900">{siteAssessment.internshipPosition}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('siteAssessment.internshipDuration')}</p>
                <p className="text-sm text-gray-900">{siteAssessment.internshipDuration}</p>
              </div>
            </div>
          </div>

          {/* Évaluations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.assessmentCriteria')}
            </h3>
            <AssessmentViewSection
              criteria={assessmentCriteria}
              values={siteAssessment.siteAssessment}
              comments={siteAssessment.siteAssessmentComments}
              getLabel={(value) => getAssessmentLabel(value as SiteAssessmentOptions)}
              options={assessmentOptions.map((o) => o.value)}
            />
          </div>

          {/* Appréciation globale */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.overallAppreciation')}
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg mb-3">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('siteAssessment.appreciation')}</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {([
                  'EXCELLENT',
                  'VERY_GOOD',
                  'GOOD',
                  'SATISFACTORY',
                  'UNSATISFACTORY',
                ] as OverallSiteAppreciation[]).map((opt) => (
                  <div
                    key={opt}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-center select-none ${
                      siteAssessment.overallSiteAppreciation === opt
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    title={getAppreciationLabel(opt)}
                  >
                    {getAppreciationLabel(opt)}
                  </div>
                ))}
              </div>
            </div>
            {siteAssessment.generalComments && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">{t('siteAssessment.generalComments')}</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {siteAssessment.generalComments}
                </p>
              </div>
            )}
          </div>

          {/* Recommandation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.recommendation')}
            </h3>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">{t('siteAssessment.recommendationLabel')}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {([
                  'STRONGLY_RECOMMEND',
                  'RECOMMEND',
                  'RECOMMEND_WITH_RESERVATIONS',
                  'DO_NOT_RECOMMEND',
                ] as Recommendation[]).map((opt) => (
                  <div
                    key={opt}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-center select-none ${
                      siteAssessment.recommendation === opt
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    title={getRecommendationLabel(opt)}
                  >
                    {getRecommendationLabel(opt)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Conformité académique */}
          {siteAssessment.academicConformity && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('siteAssessment.academicConformity')}
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {siteAssessment.academicConformity}
                </p>
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.signature')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('siteAssessment.professorName')}</p>
                <p className="text-sm text-gray-900">{siteAssessment.professorName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('siteAssessment.assessmentDate')}</p>
                <p className="text-sm text-gray-900">
                  {siteAssessment.assessmentDate 
                    ? formatDate(siteAssessment.assessmentDate)
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.generalInformation')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('siteAssessment.studentName')}
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('siteAssessment.companyName')}
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('siteAssessment.supervisorName')}
                </label>
                <input
                  type="text"
                  value={formData.supervisorName}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('siteAssessment.internshipPosition')}
                </label>
                <input
                  type="text"
                  value={formData.internshipPosition}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('siteAssessment.internshipDuration')}
                </label>
                <input
                  type="text"
                  value={formData.internshipDuration}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Critères d'évaluation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.assessmentCriteria')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('siteAssessment.assessmentCriteriaSubtitle')}
            </p>
            <AssessmentCriteriaSection
              criteria={assessmentCriteria}
              options={assessmentOptions}
              values={formData.siteAssessment}
              comments={formData.siteAssessmentComments}
              onValueChange={(key, value) => handleAssessmentChange(key, value as SiteAssessmentOptions)}
              onCommentChange={handleCommentChange}
              submitAttempted={submitAttempted}
              i18nPrefix="siteAssessment"
              useButtons={true}
              getLabel={(value) => getAssessmentLabel(value as SiteAssessmentOptions)}
            />
          </div>

          {/* Appréciation globale */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.overallAppreciation')}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('siteAssessment.appreciation')} <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  {[
                    { value: 'EXCELLENT' as OverallSiteAppreciation, label: t('siteAssessment.appreciationOptions.EXCELLENT') },
                    { value: 'VERY_GOOD' as OverallSiteAppreciation, label: t('siteAssessment.appreciationOptions.VERY_GOOD') },
                    { value: 'GOOD' as OverallSiteAppreciation, label: t('siteAssessment.appreciationOptions.GOOD') },
                    { value: 'SATISFACTORY' as OverallSiteAppreciation, label: t('siteAssessment.appreciationOptions.SATISFACTORY') },
                    { value: 'UNSATISFACTORY' as OverallSiteAppreciation, label: t('siteAssessment.appreciationOptions.UNSATISFACTORY') },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('overallSiteAppreciation', option.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.overallSiteAppreciation === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('siteAssessment.generalComments')}
                </label>
                <textarea
                  value={formData.generalComments}
                  onChange={(e) => handleInputChange('generalComments', e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                  rows={4}
                  placeholder={t('siteAssessment.commentsPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Recommandation */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.recommendation')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { value: 'STRONGLY_RECOMMEND' as Recommendation, label: t('siteAssessment.recommendationOptions.STRONGLY_RECOMMEND') },
                { value: 'RECOMMEND' as Recommendation, label: t('siteAssessment.recommendationOptions.RECOMMEND') },
                { value: 'RECOMMEND_WITH_RESERVATIONS' as Recommendation, label: t('siteAssessment.recommendationOptions.RECOMMEND_WITH_RESERVATIONS') },
                { value: 'DO_NOT_RECOMMEND' as Recommendation, label: t('siteAssessment.recommendationOptions.DO_NOT_RECOMMEND') },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('recommendation', option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.recommendation === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conformité académique */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.academicConformity')}
            </h3>
            <textarea
              value={formData.academicConformity}
              onChange={(e) => handleInputChange('academicConformity', e.target.value)}
              className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
              rows={4}
              placeholder={t('siteAssessment.academicConformityPlaceholder')}
            />
          </div>

          {/* Signature */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.signature')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('siteAssessment.professorName')}
                </label>
                <input
                  type="text"
                  value={formData.professorName}
                  onChange={(e) => handleInputChange('professorName', e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                  disabled
                />
              </div>
              <div className={`border rounded-lg p-4 ${
                submitAttempted && (!formData.signature || formData.signature.trim() === '')
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200'
              }`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('siteAssessment.signature')} <span className="text-red-500">*</span>
                  {submitAttempted && (!formData.signature || formData.signature.trim() === '') && (
                    <span className="ml-2 text-xs text-red-600 font-normal">
                      ({t('siteAssessment.notCompleted')})
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.signature}
                  onChange={(e) => handleInputChange('signature', e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </AssessmentModalLayout>
  );
}
