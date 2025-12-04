import { useTranslation } from 'react-i18next';
import type { SiteAssessment, InternshipContract, SiteAssessmentOptions, OverallSiteAppreciation, Recommendation } from '~/interfaces';
import { useEffect, useState } from "react";
import { professorAPI } from "~/services/ProfessorAPI";
import { userAPI } from "~/services/UserAPI";
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
    { key: 'tasksConformity', label: t('siteAssessment.criteria.tasksConformity') },
    { key: 'welcomeMeasures', label: t('siteAssessment.criteria.welcomeMeasures') },
    { key: 'supervisionTime', label: t('siteAssessment.criteria.supervisionTime') },
    { key: 'workEnvironmentSafety', label: t('siteAssessment.criteria.workEnvironmentSafety') },
    { key: 'workClimate', label: t('siteAssessment.criteria.workClimate') },
    { key: 'publicTransportAccess', label: t('siteAssessment.criteria.publicTransportAccess') },
    { key: 'salary', label: t('siteAssessment.criteria.salary') },
    { key: 'supervisorCommunication', label: t('siteAssessment.criteria.supervisorCommunication') },
    { key: 'equipmentAdequacy', label: t('siteAssessment.criteria.equipmentAdequacy') },
    { key: 'workload', label: t('siteAssessment.criteria.workload') },
  ];

  const assessmentOptions: AssessmentOption[] = [
    { value: 'COMPLETELY_AGREE', label: t('siteAssessment.ratings.COMPLETELY_AGREE') },
    { value: 'PARTIALLY_AGREE', label: t('siteAssessment.ratings.PARTIALLY_AGREE') },
    { value: 'PARTIALLY_DISAGREE', label: t('siteAssessment.ratings.PARTIALLY_DISAGREE') },
    { value: 'COMPLETELY_DISAGREE', label: t('siteAssessment.ratings.COMPLETELY_DISAGREE') },
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
    hoursPerWeekFirstMonth: undefined,
    hoursPerWeekSecondMonth: undefined,
    hoursPerWeekThirdMonth: undefined,
    variableWorkShifts: undefined,
    workShiftTimes: '',
    professorName: userAPI.getUserName() || `${contract.professorFirstName || ''} ${contract.professorLastName || ''}`.trim(),
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
      'COMPLETELY_AGREE': t('siteAssessment.options.COMPLETELY_AGREE'),
      'PARTIALLY_AGREE': t('siteAssessment.options.PARTIALLY_AGREE'),
      'PARTIALLY_DISAGREE': t('siteAssessment.options.PARTIALLY_DISAGREE'),
      'COMPLETELY_DISAGREE': t('siteAssessment.options.COMPLETELY_DISAGREE'),
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
    // Vérifier que les heures par semaine sont remplies
    if (formData.hoursPerWeekFirstMonth === undefined ||
        formData.hoursPerWeekSecondMonth === undefined ||
        formData.hoursPerWeekThirdMonth === undefined) {
      return false;
    }
    // Vérifier que les heures de quarts de travail sont remplies si variableWorkShifts est true
    if (formData.variableWorkShifts === true) {
      const lines = (formData.workShiftTimes || '').split('\n');
      // Au moins une ligne doit être remplie
      const hasAtLeastOneShift = lines.some(line => line.trim() !== '');
      if (!hasAtLeastOneShift) {
        return false;
      }
    }
    // Vérifier que le salaire horaire est rempli si le critère salary est évalué
    if (formData.siteAssessment['salary'] &&
        (!formData.siteAssessmentComments['salaryHourlyRate'] ||
         formData.siteAssessmentComments['salaryHourlyRate'].trim() === '')) {
      return false;
    }
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

      // Format workShiftTimes with hyphen separator: "12:12-13:24"
      const workShiftTimesFormatted = formData.workShiftTimes
        ? formData.workShiftTimes.replace(/ to /g, '-')
        : '';

      const assessmentData = {
        ...formData,
        workShiftTimes: workShiftTimesFormatted,
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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
            {/* Affichage du salaire horaire si présent */}
            {siteAssessment.siteAssessmentComments?.['salaryHourlyRate'] && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">{t('siteAssessment.salaryPerHour')}</p>
                <p className="text-sm text-gray-900">{siteAssessment.siteAssessmentComments['salaryHourlyRate']} {t('siteAssessment.salary')}</p>
              </div>
            )}
          </div>

          {/* Heures par semaine */}
          {(siteAssessment.hoursPerWeekFirstMonth !== undefined || 
            siteAssessment.hoursPerWeekSecondMonth !== undefined || 
            siteAssessment.hoursPerWeekThirdMonth !== undefined) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('siteAssessment.hoursPerWeek')}
              </h3>
              <div className="space-y-2">
                {siteAssessment.hoursPerWeekFirstMonth !== undefined && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">{t('siteAssessment.hoursPerWeekFirstMonth')}</p>
                    <p className="text-sm text-gray-900">{siteAssessment.hoursPerWeekFirstMonth} {t('siteAssessment.hoursPerWeekSuffix')}</p>
                  </div>
                )}
                {siteAssessment.hoursPerWeekSecondMonth !== undefined && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">{t('siteAssessment.hoursPerWeekSecondMonth')}</p>
                    <p className="text-sm text-gray-900">{siteAssessment.hoursPerWeekSecondMonth} {t('siteAssessment.hoursPerWeekSuffix')}</p>
                  </div>
                )}
                {siteAssessment.hoursPerWeekThirdMonth !== undefined && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">{t('siteAssessment.hoursPerWeekThirdMonth')}</p>
                    <p className="text-sm text-gray-900">{siteAssessment.hoursPerWeekThirdMonth} {t('siteAssessment.hoursPerWeekSuffix')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quarts de travail variables */}
          {siteAssessment.variableWorkShifts !== undefined && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('siteAssessment.variableShifts')}
              </h3>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-900 mb-2">
                  {siteAssessment.variableWorkShifts ? t('siteAssessment.yes') : t('siteAssessment.no')}
                </p>
                {siteAssessment.variableWorkShifts && siteAssessment.workShiftTimes && (
                  <div className="space-y-1">
                    {siteAssessment.workShiftTimes.split('\n').filter(line => line.trim()).map((line, idx) => (
                      <p key={idx} className="text-sm text-gray-900">{line}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

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
            {/* Champ spécial pour le salaire horaire */}
            {formData.siteAssessment['salary'] && (
              <div className={`mt-4 border rounded-lg p-4 ${
                submitAttempted && (!formData.siteAssessmentComments['salaryHourlyRate'] || 
                                    formData.siteAssessmentComments['salaryHourlyRate'].trim() === '')
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200'
              }`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('siteAssessment.salaryPerHour')} <span className="text-red-500">*</span>
                  {submitAttempted && (!formData.siteAssessmentComments['salaryHourlyRate'] ||
                                       formData.siteAssessmentComments['salaryHourlyRate'].trim() === '') && (
                    <span className="ml-2 text-xs text-red-600 font-normal">
                      ({t('siteAssessment.notCompleted')})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.siteAssessmentComments['salaryHourlyRate'] || ''}
                  onChange={(e) => handleCommentChange('salaryHourlyRate', e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                  placeholder={t('siteAssessment.salaryPerHourPlaceholder')}
                  required
                />
              </div>
            )}
          </div>

          {/* Heures par semaine */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.hoursPerWeek')}
            </h3>
            <div className="space-y-3">
              <div className={`border rounded-lg p-4 ${
                submitAttempted && formData.hoursPerWeekFirstMonth === undefined
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200'
              }`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('siteAssessment.hoursPerWeekFirstMonth')} <span className="text-red-500">*</span>
                  {submitAttempted && formData.hoursPerWeekFirstMonth === undefined && (
                    <span className="ml-2 text-xs text-red-600 font-normal">
                      ({t('siteAssessment.notCompleted')})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.hoursPerWeekFirstMonth ?? ''}
                  onChange={(e) => handleInputChange('hoursPerWeekFirstMonth', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>
              <div className={`border rounded-lg p-4 ${
                submitAttempted && formData.hoursPerWeekSecondMonth === undefined
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200'
              }`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('siteAssessment.hoursPerWeekSecondMonth')} <span className="text-red-500">*</span>
                  {submitAttempted && formData.hoursPerWeekSecondMonth === undefined && (
                    <span className="ml-2 text-xs text-red-600 font-normal">
                      ({t('siteAssessment.notCompleted')})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.hoursPerWeekSecondMonth ?? ''}
                  onChange={(e) => handleInputChange('hoursPerWeekSecondMonth', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>
              <div className={`border rounded-lg p-4 ${
                submitAttempted && formData.hoursPerWeekThirdMonth === undefined
                  ? 'border-red-300 bg-red-50' 
                  : 'border-gray-200'
              }`}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('siteAssessment.hoursPerWeekThirdMonth')} <span className="text-red-500">*</span>
                  {submitAttempted && formData.hoursPerWeekThirdMonth === undefined && (
                    <span className="ml-2 text-xs text-red-600 font-normal">
                      ({t('siteAssessment.notCompleted')})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={formData.hoursPerWeekThirdMonth ?? ''}
                  onChange={(e) => handleInputChange('hoursPerWeekThirdMonth', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>
            </div>
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

          {/* Quarts de travail variables */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t('siteAssessment.variableShifts')}
            </h3>
            <div>
              <div className="flex gap-4 mb-3">
                <button
                  type="button"
                  onClick={() => handleInputChange('variableWorkShifts', true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.variableWorkShifts === true
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('siteAssessment.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('variableWorkShifts', false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.variableWorkShifts === false
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t('siteAssessment.no')}
                </button>
              </div>
              {formData.variableWorkShifts === true && (
                <div className={`border rounded-lg p-4 ${
                  submitAttempted && !formData.workShiftTimes?.split('\n').some(line => line.trim() !== '')
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-200'
                }`}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('siteAssessment.workShiftTimes')} <span className="text-red-500">*</span>
                    {submitAttempted && !formData.workShiftTimes?.split('\n').some(line => line.trim() !== '') && (
                      <span className="ml-2 text-xs text-red-600 font-normal">
                        ({t('siteAssessment.notCompleted')})
                      </span>
                    )}
                  </label>
                  <div className="space-y-3">
                    {[1, 2, 3].map((num) => {
                      const lines = (formData.workShiftTimes || "").split("\n");
                      const currentLine = lines[num - 1] || "";

                      // Parse time values - handle formats: "15:40 to 18:30", "15:40 18:30", or "15:40-18:30"
                      let fromValue = "";
                      let toValue = "";

                      if (currentLine.includes(" to ")) {
                        // Old format with "to"
                        const parts = currentLine.split(" to ").map((part) => part.trim());
                        fromValue = parts[0] || "";
                        toValue = parts[1] || "";
                      } else if (currentLine.includes("-")) {
                        // New format with hyphen
                        const parts = currentLine.split("-").map((part) => part.trim());
                        fromValue = parts[0] || "";
                        toValue = parts[1] || "";
                      } else {
                        // Format with just space
                        const parts = currentLine.trim().split(/\s+/);
                        fromValue = parts[0] || "";
                        toValue = parts[1] || "";
                      }

                      return (
                        <div key={num} className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 whitespace-nowrap">
                            {num}:
                          </span>

                          {/* FROM INPUT */}
                          <input
                            type="time"
                            value={fromValue}
                            max={toValue || undefined}
                            onChange={(e) => {
                              const newFrom = e.target.value;
                              const updatedLines = [...lines];
                              while (updatedLines.length < num) {
                                updatedLines.push('');
                              }
                              updatedLines[num - 1] = newFrom || toValue ? `${newFrom} to ${toValue}` : '';
                              handleInputChange("workShiftTimes", updatedLines.join("\n"));
                            }}
                            className="text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={num === 1}
                          />

                          <span className="text-sm text-gray-700">
                            {t("siteAssessment.workShiftTimesTo")}
                          </span>

                          {/* TO INPUT */}
                          <input
                            type="time"
                            value={toValue}
                            min={fromValue || undefined}
                            onChange={(e) => {
                              const newTo = e.target.value;
                              const updatedLines = [...lines];
                              while (updatedLines.length < num) {
                                updatedLines.push('');
                              }
                              updatedLines[num - 1] = fromValue || newTo ? `${fromValue} to ${newTo}` : '';
                              handleInputChange("workShiftTimes", updatedLines.join("\n"));
                            }}
                            className="text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required={num === 1}
                          />
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>
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
                  {t('siteAssessment.passwordSignature')} <span className="text-red-500">*</span>
                  {submitAttempted && (!formData.signature || formData.signature.trim() === '') && (
                    <span className="ml-2 text-xs text-red-600 font-normal">
                      ({t('siteAssessment.notCompleted')})
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  value={formData.signature}
                  onChange={(e) => handleInputChange('signature', e.target.value)}
                  className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                  placeholder={t('siteAssessment.passwordSignaturePlaceholder')}
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
