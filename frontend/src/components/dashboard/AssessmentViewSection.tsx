import { useTranslation } from 'react-i18next';

export interface AssessmentCriterion {
  key: string;
  label: string;
}

interface AssessmentViewSectionProps {
  criteria: AssessmentCriterion[];
  values: Record<string, string>;
  comments: Record<string, string>;
  getLabel: (value: string) => string;
  options?: string[];
}

export default function AssessmentViewSection({
  criteria,
  values,
  comments,
  getLabel,
  options,
}: AssessmentViewSectionProps) {
  return (
    <div className="space-y-3">
      {criteria.map((criterion) => {
        const key = criterion.key;
        const value = values[key] || '';
        return (
          <div key={key} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {criterion.label}
              </span>
              {!options && (
                <span className="text-sm font-semibold text-blue-600">
                  {value ? getLabel(value) : ''}
                </span>
              )}
            </div>

            {options && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-2">
                {options.map((opt) => (
                  <div
                    key={opt}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-center select-none ${
                      value === opt
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                    title={getLabel(opt)}
                  >
                    {getLabel(opt)}
                  </div>
                ))}
              </div>
            )}

            {comments[key] && (
              <p className="text-sm text-gray-600 mt-1">
                {comments[key]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

