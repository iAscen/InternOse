import {useTranslation} from "react-i18next";
import {useForm} from "~/hooks";
import FormSection from "~/components/FormSection";
import FormInput from "~/components/FormInput";

interface FilterMenuOffersProps {
    applyFilters: Function;
}

export default function FilterMenuOffers({ applyFilters }: FilterMenuOffersProps) {
    const { t } = useTranslation();

    const {formData, handleChange} = useForm({
        status: "",
        program: "",
        title: ""
    });

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        handleChange({
            target: { name, value }
        } as React.ChangeEvent<HTMLInputElement>);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const status = formData.status != "" ? formData.status : undefined;
        const program = formData.program != "" ? formData.program : undefined;
        const title = formData.title != "" ? formData.title : undefined;
        applyFilters([status, program, title]);
    }

    return (
        <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-3 mb-3">
                        <FormSection title={t('im.filterAccordingTo')}>
                            <div className="mb-3">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('im.status')}
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleSelectChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                                >
                                    <option value="" className="text-gray-900 bg-white">{t('im.allStatuses')}</option>
                                    <option value="false" className="text-gray-900 bg-white">{t('dashboard.pending')}</option>
                                    <option value="true" className="text-gray-900 bg-white">{t('dashboard.validated')}</option>
                                </select>
                            </div>
                            <FormInput
                                className={"mb-3"}
                                id={"program"}
                                name={"program"}
                                type={"text"}
                                label={t('im.program')}
                                placeholder={t('im.placeholderSE')} // Temporaire
                                value={formData.program}
                                onChange={handleChange}
                                required={false}
                            />
                            <FormInput
                                className={"mb-3"}
                                id={"title"}
                                name={"title"}
                                type={"text"}
                                label={t('im.title')}
                                placeholder={t('im.placeholderDev')}
                                value={formData.title}
                                onChange={handleChange}
                                required={false}
                            />
                        </FormSection>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                        <button type="submit" className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            {t('im.applyFilters')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
