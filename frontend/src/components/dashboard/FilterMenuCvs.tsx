import {useTranslation} from "react-i18next";
import {useForm} from "~/hooks";
import FormSection from "~/components/FormSection";

interface FilterMenuOffersProps {
    applyFilters: Function;
}

export default function FilterMenuOffers({ applyFilters }: FilterMenuOffersProps) {
    const { t } = useTranslation();

    const {formData, handleChange} = useForm({
        status: ""
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
        applyFilters([status, undefined, undefined]);
    }

    return (
        <div className="absolute end-0 z-10 mt-2 w-64 rounded-lg shadow-xl ltr:origin-top-right rtl:origin-top-left">
            <div className="rounded-lg bg-white py-2.5 ring-1 ring-black/5">
                <div className="px-4 py-2">
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
                                    <option value="pending" className="text-gray-900 bg-white">{t('dashboard.pending')}</option>
                                    <option value="approved" className="text-gray-900 bg-white">{t('dashboard.validated')}</option>
                                </select>
                            </div>
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
        </div>
    )
}
