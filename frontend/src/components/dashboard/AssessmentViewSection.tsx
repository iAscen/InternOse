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
}

export default function AssessmentViewSection({
  criteria,
  values,
  comments,
  getLabel,
}: AssessmentViewSectionProps) {
  return (
    <div className="space-y-3">
      {Object.entries(values).map(([key, value]) => (
        <div key={key} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {criteria.find(c => c.key === key)?.label || key}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {getLabel(value)}
            </span>
          </div>
          {comments[key] && (
            <p className="text-sm text-gray-600 mt-1">
              {comments[key]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

