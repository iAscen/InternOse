import {useTranslation} from "react-i18next";
import {useForm} from "~/hooks";
import FormInput from "~/components/FormInput";

interface FilterMenuContractsProps {
  applyFilters: Function;
}

export default function FilterMenuContracts({applyFilters}: FilterMenuContractsProps) {
  const {t} = useTranslation();

  const {formData, handleChange} = useForm({
    status: "",
    title: ""
  });

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {name, value} = e.target;

    handleChange({
      target: {name, value}
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const status = formData.status != "" ? formData.status : undefined;
    const title = formData.title != "" ? formData.title : undefined;
    applyFilters([status, title]);
  };

  return (
    <div className="absolute end-0 z-[100] mt-2 w-96 rounded-lg shadow-xl max-h-[600px] ltr:origin-top-right rtl:origin-top-left">
      <div className="rounded-lg bg-white py-2.5 ring-1 ring-black/5 max-h-[600px] overflow-y-auto">
        <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('im.filterAccordingTo')}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="mb-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                {t('im.status')}
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || ""}
                onChange={handleSelectChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
              >
                <option value="" className="text-gray-900 bg-white">{t('im.allStatuses')}</option>
                <option value="fullySigned" className="text-gray-900 bg-white">{t('internshipContract.fullySigned')}</option>
                <option value="pendingSignatures" className="text-gray-900 bg-white">{t('internshipContract.pendingSignatures')}</option>
              </select>
            </div>
            <FormInput
              className={"mb-3"}
              id={"title"}
              name={"title"}
              type={"text"}
              label={t('im.title')}
              placeholder={t('im.placeholderDev')}
              value={formData.title || ""}
              onChange={handleChange}
              required={false}
            />
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4">
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              {t('im.applyFilters')}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

