import {useTranslation} from "react-i18next";

interface ProgramSelectorProps {
    onChange: Function;
}

export default function ProgramSelector({ onChange }: ProgramSelectorProps) {
    const { t } = useTranslation();

    // Seulement les programmes **techniques** offerts par Cégep André-Laurendeau
    // https://claurendeau.qc.ca/programmes/explorez-nos-programmes
    const programs = [
        <>{t("programSelector.programs.410A1")}</>,
        <>{t("programSelector.programs.180A0")}</>,
        <>{t("programSelector.programs.180B0")}</>,
        <>{t("programSelector.programs.410G0")}</>,
        <>{t("programSelector.programs.322A1")}</>,
        <>{t("programSelector.programs.420B0")}</>,
        <>{t("programSelector.programs.388A1")}</>,
        <>{t("programSelector.programs.221A0")}</>,
        <>{t("programSelector.programs.221D0")}</>,
        <>{t("programSelector.programs.221B0")}</>,
        <>{t("programSelector.programs.243D0")}</>,
        <>{t("programSelector.programs.244A0")}</>
    ];
    const programCodes: string[] = [
        "410A1",
        "180A0",
        "180B0",
        "410G0",
        "322A1",
        "420B0",
        "388A1",
        "221A0",
        "221D0",
        "221B0",
        "243D0",
        "244A0"
    ];

    return (
        <div className="mb-3">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                {t('programSelector.label')}
            </label>
            <select
                id="program"
                name="program"
                onChange={() => onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            >
                <option hidden className="text-gray-900 bg-white">{t('programSelector.placeholder')}</option>
                {programs.map((program, index) => (
                    <option key={index} value={programCodes[index]} className="text-gray-900 bg-white">{program}</option>
                ))}
            </select>
        </div>
    );
}
