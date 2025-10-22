import {useTranslation} from "react-i18next";
import type {ChangeEventHandler} from "react";

interface ProgramSelectorProps {
  onChange: ChangeEventHandler;
  value?: string;
}

export default function ProgramSelector({onChange, value}: ProgramSelectorProps) {
  const {t} = useTranslation();

  // Seulement les programmes **techniques** offerts par Cégep André-Laurendeau
  // https://claurendeau.qc.ca/programmes/explorez-nos-programmes
  const programs = [
    { id: "410.A1", name: t("programSelector.programs.410A1") },
    { id: "180.A0", name: t("programSelector.programs.180A0") },
    { id: "180.B0", name: t("programSelector.programs.180B0") },
    { id: "410.G0", name: t("programSelector.programs.410G0") },
    { id: "322.A1", name: t("programSelector.programs.322A1") },
    { id: "420.B0", name: t("programSelector.programs.420B0") },
    { id: "388.A1", name: t("programSelector.programs.388A1") },
    { id: "221.A0", name: t("programSelector.programs.221A0") },
    { id: "221.D0", name: t("programSelector.programs.221D0") },
    { id: "221.B0", name: t("programSelector.programs.221B0") },
    { id: "243.D0", name: t("programSelector.programs.243D0") },
    { id: "244.A0", name: t("programSelector.programs.244A0") }
  ];

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
          <option key={index} value={program.id} className="text-gray-900 bg-white">{program.name}</option>
        ))}
      </select>
    </div>
  );
}
