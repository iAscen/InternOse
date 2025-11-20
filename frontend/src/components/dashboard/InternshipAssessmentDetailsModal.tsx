import { useTranslation } from 'react-i18next';
import type {InternAssessment, InternshipContract, AssessmentOptions, OverallInternAppreciation, FutureCollaboration} from '~/interfaces';
import {useEffect, useState} from "react";
import {employerAPI} from "~/services/EmployerAPI";
import ProgramSelector from "~/components/ProgramSelector";
import {userAPI} from "~/services/UserAPI";

interface InternshipAssessmentDetailsModalProps {
  contract: InternshipContract;
  onClose: () => void;
  internAssessment?: InternAssessment;
}

export default function InternshipAssessmentDetailsModal({
                                                           contract,
                                                           onClose,
                                                           internAssessment: initialAssessment
                                                         }: InternshipAssessmentDetailsModalProps) {
  const {t} = useTranslation();
  const [internAssessment, setInternAssessment] = useState<InternAssessment | undefined>(initialAssessment);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Critères d'évaluation
  const assessmentCriteria = [
    { key: 'PUNCTUALITY', label: 'Ponctualité et assiduité' },
    { key: 'ATTITUDE', label: 'Attitude et comportement professionnel' },
    { key: 'WORK_QUALITY', label: 'Qualité du travail et autonomie' },
    { key: 'FOLLOW_INSTRUCTIONS', label: 'Respect des consignes et capacité d\'apprentissage' },
    { key: 'TEAM_INTEGRATION', label: 'Intégration à l\'équipe' },
  ];

  // Initialize internAssessment with all criteria set to empty (not done)
  const initialInternAssessment = assessmentCriteria.reduce((acc, criterion) => {
    acc[criterion.key] = '' as AssessmentOptions;
    return acc;
  }, {} as Record<string, AssessmentOptions>);

  const [formData, setFormData] = useState<InternAssessment>({
    studentName: `${contract.studentFirstName} ${contract.studentLastName}`,
    studentProgram: '',
    companyName: contract.employerCompany || '',
    supervisorName: contract.supervisorName || '',
    supervisorTitle: contract.supervisorTitle || '',
    supervisorPhoneNumber: contract.supervisorPhone || '',
    internAssessment: initialInternAssessment,
    internAssessmentComments: {},
    overallInternAppreciation: 'FULLY_MEETS_EXPECTATIONS',
    appreciationComment: '',
    discussedWithTheIntern: false,
    weeklySupervisionHours: 0,
    futureCollaboration: 'MAYBE',
    academicPreparationAdequacy: '',
    signerName: '',
    signerTitle: '',
    signature: '',
    signatureDate: '',
  });

  useEffect(() => {
    const loadAssessment = async () => {
      if (!initialAssessment && contract.employerId && contract.id) {
        try {
          const response = await employerAPI.getInternAssessment(contract.employerId, contract.id);
          if (response.success && response.data) {
            setInternAssessment(response.data);
          } else {
            setShowForm(true);
          }
        } catch (err) {
          setShowForm(true);
        }
      }
    };
    loadAssessment();
  }, [contract.employerId, contract.id, initialAssessment]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getAssessmentLabel = (value: string) => {
    const labels: Record<string, string> = {
      'COMPLETELY_AGREE': 'Totalement d\'accord',
      'PARTIALLY_AGREE': 'Plutôt d\'accord',
      'PARTIALLY_DISAGREE': 'Plutôt en désaccord',
      'COMPLETELY_DISAGREE': 'Totalement en désaccord',
      'NOT_APPLICABLE': 'Non applicable'
    };
    return labels[value] || value;
  };

  const getAppreciationLabel = (value: string) => {
    const labels: Record<string, string> = {
      'GREATLY_EXCEEDS_EXPECTATIONS': 'Dépasse de beaucoup les attentes',
      'EXCEEDS_EXPECTATIONS': 'Dépasse les attentes',
      'FULLY_MEETS_EXPECTATIONS': 'Répond pleinement aux attentes',
      'PARTIALLY_MEETS_EXPECTATIONS': 'Répond partiellement aux attentes',
      'DOES_NOT_MEET_EXPECTATIONS': 'Ne répond pas aux attentes'
    };
    return labels[value] || value;
  };

  const getCollaborationLabel = (value: string) => {
    const labels: Record<string, string> = {
      'YES': 'Oui',
      'MAYBE': 'Peut-être',
      'NO': 'Non'
    };
    return labels[value] || value;
  };

  const handleAssessmentChange = (key: string, value: AssessmentOptions) => {
    setFormData(prev => ({
      ...prev,
      internAssessment: {
        ...prev.internAssessment,
        [key]: value,
      },
    }));
  };

  const handleCommentChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      internAssessmentComments: {
        ...prev.internAssessmentComments,
        [key]: value,
      },
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {value} = e.target;
    setFormData(prev => ({
      ...prev,
      studentProgram: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    // Check for missing or empty criteria
    const missingCriteria = assessmentCriteria.filter(
      criterion => !formData.internAssessment[criterion.key] || formData.internAssessment[criterion.key] === ''
    );

    if (missingCriteria.length > 0) {
      setError('Veuillez évaluer tous les critères obligatoires');
      return;
    }

    // Validate student program
    if (!formData.studentProgram || formData.studentProgram.trim() === '') {
      setError('Veuillez saisir le programme d\'études');
      return;
    }

    // Validate weekly supervision hours
    const hours = formData.weeklySupervisionHours;
    if (!isFinite(hours) || hours < 0) {
      setError('Veuillez fournir un nombre valide pour les heures de supervision hebdomadaire');
      return;
    }

    // Validate signer information
    if (!formData.signerName || !formData.signerTitle) {
      setError('Veuillez remplir les informations du signataire (nom et titre)');
      return;
    }

    setLoading(true);
    setError(null);

    const employerId = contract.employerId
    if (!employerId || !contract.id) {
      setError('Impossible de récupérer les informations nécessaires');
      setLoading(false);
      return;
    }
    if (!formData.signerName || !formData.signerTitle) {
      setError('Veuillez remplir les informations du signataire (nom et titre)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const employerId = await userAPI.getEmployerIdFromJWT();
      if (!employerId || !contract.id) {
        setError('Impossible de récupérer les informations nécessaires');
        return;
      }

      const assessmentData = {
        ...formData,
        signatureDate: new Date().toISOString(),
      };

      const response = await employerAPI.postInternAssessment(
        employerId,
        contract.id,
        assessmentData
      );

      if (response.success && response.data) {
        setInternAssessment(response.data);
        setShowForm(false);
      } else {
        setError(response.error || 'Erreur lors de la soumission de l\'évaluation');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gray-100 border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Évaluation du stagiaire</h2>
            <p className="text-sm text-gray-600 mt-1">
              {internAssessment?.studentName || 'Évaluation'}
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

        <div className="p-6 overflow-y-auto flex-1 relative">
          {internAssessment ? (
            <>
              {/* Informations générales */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Informations générales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nom du stagiaire</p>
                    <p className="text-sm text-gray-900">{internAssessment.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Programme d'études</p>
                    <p className="text-sm text-gray-900">{internAssessment.studentProgram}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nom de l'entreprise</p>
                    <p className="text-sm text-gray-900">{internAssessment.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nom du superviseur</p>
                    <p className="text-sm text-gray-900">{internAssessment.supervisorName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Titre du superviseur</p>
                    <p className="text-sm text-gray-900">{internAssessment.supervisorTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Téléphone du superviseur</p>
                    <p className="text-sm text-gray-900">{internAssessment.supervisorPhoneNumber}</p>
                  </div>
                </div>
              </div>

              {/* Évaluations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Évaluations des compétences
                </h3>
                <div className="space-y-3">
                  {Object.entries(internAssessment.internAssessment).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{key}</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {getAssessmentLabel(value)}
                        </span>
                      </div>
                      {internAssessment.internAssessmentComments[key] && (
                        <p className="text-sm text-gray-600 mt-1">
                          {internAssessment.internAssessmentComments[key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Appréciation globale */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Appréciation globale
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Appréciation</p>
                  <p className="text-base font-semibold text-blue-700">
                    {getAppreciationLabel(internAssessment.overallInternAppreciation)}
                  </p>
                </div>
                {internAssessment.appreciationComment && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Commentaires</p>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {internAssessment.appreciationComment}
                    </p>
                  </div>
                )}
              </div>

              {/* Détails supplémentaires */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Détails supplémentaires
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Discuté avec le stagiaire</p>
                    <p className="text-sm text-gray-900">
                      {internAssessment.discussedWithTheIntern ? 'Oui' : 'Non'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Heures de supervision par semaine</p>
                    <p className="text-sm text-gray-900">{internAssessment.weeklySupervisionHours} heures</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">Collaboration future</p>
                    <p className="text-sm text-gray-900">
                      {getCollaborationLabel(internAssessment.futureCollaboration)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Préparation académique */}
              {internAssessment.academicPreparationAdequacy && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Préparation académique
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {internAssessment.academicPreparationAdequacy}
                    </p>
                  </div>
                </div>
              )}

              {/* Signature */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Signature
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Nom du signataire</p>
                    <p className="text-sm text-gray-900">{internAssessment.signerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Titre du signataire</p>
                    <p className="text-sm text-gray-900">{internAssessment.signerTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Date de signature</p>
                    <p className="text-sm text-gray-900">{formatDate(internAssessment.signatureDate)}</p>
                  </div>
                  {internAssessment.signature && (
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Signature</p>
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <img
                          src={internAssessment.signature}
                          alt="Signature"
                          className="max-h-24 object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : showForm ? (
            <form onSubmit={handleSubmit}>
              {/* Informations générales */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <ProgramSelector onChange={handleSelectChange} value={formData.studentProgram}/>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heures de supervision par semaine <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={formData.weeklySupervisionHours}
                      onChange={(e) => setFormData({ ...formData, weeklySupervisionHours: parseFloat(e.target.value) })}
                      className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                      placeholder="Ex: 2"
                    />
                  </div>
                </div>
              </div>

              {/* Critères d'évaluation */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Critères d'évaluation</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Évaluez le stagiaire selon les critères suivants
                </p>

                <div className="space-y-6">
                  {assessmentCriteria.map((criterion) => {
                    const isNotDone = !formData.internAssessment[criterion.key] || formData.internAssessment[criterion.key] === '';
                    const showNotDone = submitAttempted && isNotDone;
                    return (
                      <div
                        key={criterion.key}
                        className={`border rounded-lg p-4 ${
                          showNotDone ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                          {criterion.label} <span className="text-red-500">*</span>
                          {showNotDone && (
                            <span className="ml-2 text-xs text-red-600 font-normal">
                              (Non complété)
                            </span>
                          )}
                        </label>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                          {[
                            { value: 'COMPLETELY_AGREE' as AssessmentOptions, label: 'Excellent (5)' },
                            { value: 'PARTIALLY_AGREE' as AssessmentOptions, label: 'Très bien (4)' },
                            { value: 'PARTIALLY_DISAGREE' as AssessmentOptions, label: 'Bien (3)' },
                            { value: 'COMPLETELY_DISAGREE' as AssessmentOptions, label: 'À améliorer (2)' },
                            { value: 'NOT_APPLICABLE' as AssessmentOptions, label: 'Non applicable' },
                          ].map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleAssessmentChange(criterion.key, option.value)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                formData.internAssessment[criterion.key] === option.value
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={formData.internAssessmentComments[criterion.key] || ''}
                          onChange={(e) => handleCommentChange(criterion.key, e.target.value)}
                          placeholder="Commentaires (optionnel)"
                          rows={2}
                          className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Appréciation globale */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appréciation globale</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appréciation générale du stagiaire <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.overallInternAppreciation}
                    onChange={(e) => setFormData({ ...formData, overallInternAppreciation: e.target.value as OverallInternAppreciation })}
                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="GREATLY_EXCEEDS_EXPECTATIONS">Dépasse de beaucoup les attentes</option>
                    <option value="EXCEEDS_EXPECTATIONS">Dépasse les attentes</option>
                    <option value="FULLY_MEETS_EXPECTATIONS">Répond pleinement aux attentes</option>
                    <option value="PARTIALLY_MEETS_EXPECTATIONS">Répond partiellement aux attentes</option>
                    <option value="DOES_NOT_MEET_EXPECTATIONS">Ne répond pas aux attentes</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Précisez votre appréciation
                  </label>
                  <textarea
                    value={formData.appreciationComment}
                    onChange={(e) => setFormData({ ...formData, appreciationComment: e.target.value })}
                    rows={4}
                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                    placeholder="Commentaires généraux sur le stagiaire..."
                  />
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="discussed"
                    checked={formData.discussedWithTheIntern}
                    onChange={(e) => setFormData({ ...formData, discussedWithTheIntern: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="discussed" className="ml-2 text-sm text-gray-700">
                    Cette évaluation a été discutée avec le stagiaire
                  </label>
                </div>
              </div>

              {/* Collaboration future */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Collaboration future</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    L'entreprise aimerait accueillir cet étudiant pour son prochain stage? <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    {[
                      { value: 'YES' as FutureCollaboration, label: 'Oui' },
                      { value: 'MAYBE' as FutureCollaboration, label: 'Peut-être' },
                      { value: 'NO' as FutureCollaboration, label: 'Non' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, futureCollaboration: option.value })}
                        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                          formData.futureCollaboration === option.value
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
                    La formation technique du stagiaire était-elle suffisante pour accomplir le mandat de stage?
                  </label>
                  <textarea
                    value={formData.academicPreparationAdequacy}
                    onChange={(e) => setFormData({ ...formData, academicPreparationAdequacy: e.target.value })}
                    rows={3}
                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                    placeholder="Commentaires sur la préparation académique..."
                  />
                </div>
              </div>

              {/* Signature */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Signature</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du signataire <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.signerName}
                      onChange={(e) => setFormData({ ...formData, signerName: e.target.value })}
                      className="text-black w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-500"
                      placeholder="Nom complet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du signataire <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.signerTitle}
                      onChange={(e) => setFormData({ ...formData, signerTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder:text-gray-500"
                      placeholder="Ex: Superviseur de stage"
                    />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Chargement...</p>
            </div>
          )}
        </div>

        <div className="flex justify-between gap-3 p-6 flex-shrink-0 border-t border-gray-200 bg-gray-50">
          {showForm && !internAssessment ? (
            <>
              {/* Error message on the left */}
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

              {/* Buttons on the right */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Soumission en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Soumettre l'évaluation
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-auto"
            >
              {t('common.close') || 'Fermer'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
