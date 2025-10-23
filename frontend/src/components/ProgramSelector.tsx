import {useTranslation} from "react-i18next";
import type {ChangeEventHandler} from "react";
import { programs } from "~/constants/programs";

interface ProgramSelectorProps {
  onChange: ChangeEventHandler;
  value?: string;
}

export default function ProgramSelector({onChange, value}: ProgramSelectorProps) {
  const {t} = useTranslation();

  return (
    <div className="mb-3">
      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
        {t('programSelector.label')}
      </label>
      <select
        id="program"
        name="program"
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
      >
        <option value="" className="text-gray-900 bg-white">{t('programSelector.placeholder')}</option>
        {programs.map((program, index) => (
          <option key={index} value={program.id} className="text-gray-900 bg-white">{t(program.key)}</option>
        ))}
      </select>
    </div>
  );
}
