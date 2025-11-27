import { useTranslation } from 'react-i18next';

export interface AssessmentCriterion {
  key: string;
  label: string;
}

export interface AssessmentOption {
  value: string;
  label: string;
}

interface AssessmentCriteriaSectionProps {
  criteria: AssessmentCriterion[];
  options: AssessmentOption[];
  values: Record<string, string>;
  comments: Record<string, string>;
  onValueChange: (criterionKey: string, value: string) => void;
  onCommentChange: (criterionKey: string, value: string) => void;
  submitAttempted: boolean;
  i18nPrefix: string;
  useButtons?: boolean;
  getLabel: (value: string) => string;
}

export default function AssessmentCriteriaSection({
  criteria,
  options,
  values,
  comments,
  onValueChange,
  onCommentChange,
  submitAttempted,
  i18nPrefix,
  useButtons = true,
  getLabel,
}: AssessmentCriteriaSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {criteria.map((criterion) => {
        const currentValue = values[criterion.key] || '';
        const isNotDone = !currentValue;
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
                  ({t(`${i18nPrefix}.notCompleted`)})
                </span>
              )}
            </label>

            {useButtons ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onValueChange(criterion.key, option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentValue === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <select
                value={currentValue}
                onChange={(e) => onValueChange(criterion.key, e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  showNotDone ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">{t(`${i18nPrefix}.selectOption`)}</option>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            <textarea
              value={comments[criterion.key] || ''}
              onChange={(e) => onCommentChange(criterion.key, e.target.value)}
              placeholder={t(`${i18nPrefix}.${i18nPrefix === 'internshipAssessment' ? 'commentsOptional' : 'commentPlaceholder'}`)}
              rows={2}
              className="text-black w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder:text-gray-500"
            />
          </div>
        );
      })}
    </div>
  );
}

