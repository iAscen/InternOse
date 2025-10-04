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
        domain: "",
        title: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const status = formData.status != "" ? formData.status : undefined;
        const domain = formData.domain != "" ? formData.domain : undefined;
        const title = formData.title != "" ? formData.title : undefined;
        applyFilters([status, domain, title]);
    }

    return (
        <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center space-x-3 mb-3">
                        <FormSection title={t('im.filterAccordingTo')}>
                            <FormInput
                                className={"mb-3"}
                                id={"status"}
                                name={"status"}
                                type={"text"}
                                label={t('im.status')}
                                placeholder={t('im.placeholderPending')}
                                value={formData.status}
                                onChange={handleChange}
                                required={false}
                            />
                            <FormInput
                                className={"mb-3"}
                                id={"domain"}
                                name={"domain"}
                                type={"text"}
                                label={t('im.domain')}
                                placeholder={t('im.placeholderCS')}
                                value={formData.domain}
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
