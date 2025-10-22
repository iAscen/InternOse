import {useTranslation} from "react-i18next";
import {useForm} from "~/hooks";
import FormInput from "~/components/FormInput";
import ProgramSelector from "~/components/ProgramSelector";

interface FilterMenuOffersProps {
  applyFilters: Function;
  userRole: 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER';
}

export default function FilterMenuOffers({applyFilters, userRole}: FilterMenuOffersProps) {
  const {t} = useTranslation();

  // Define form data based on user role
  const getInitialFormData = () => {
    switch (userRole) {
      case 'INTERNSHIP_MANAGER':
        return {
          status: "",
          program: "",
          title: ""
        };
      case 'STUDENT':
        return {
          program: "",
          location: "",
          jobTitle: "",
          company: "",
          minSalary: "",
          maxSalary: "",
          minDuration: "",
          maxDuration: "",
          startDateFrom: "",
          startDateTo: ""
        };
      case 'EMPLOYER':
        return {
          status: "",
          program: ""
        };
      default:
        return {};
    }
  };

  const {formData, handleChange} = useForm(getInitialFormData());

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const {name, value} = e.target;
    handleChange({
      target: {name, value}
    } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (userRole === 'INTERNSHIP_MANAGER') {
      const status = formData.status != "" ? formData.status : undefined;
      const program = formData.program != "" ? formData.program : undefined;
      const title = formData.title != "" ? formData.title : undefined;
      applyFilters([status, program, title]);
    } else if (userRole === 'STUDENT') {
      const program = formData.program != "" ? formData.program : undefined;
      const location = formData.location != "" ? formData.location : undefined;
      const jobTitle = formData.jobTitle != "" ? formData.jobTitle : undefined;
      const company = formData.company != "" ? formData.company : undefined;
      const minSalary = formData.minSalary != "" ? formData.minSalary : undefined;
      const maxSalary = formData.maxSalary != "" ? formData.maxSalary : undefined;
      const minDuration = formData.minDuration != "" ? formData.minDuration : undefined;
      const maxDuration = formData.maxDuration != "" ? formData.maxDuration : undefined;
      const startDateFrom = formData.startDateFrom != "" ? formData.startDateFrom : undefined;
      const startDateTo = formData.startDateTo != "" ? formData.startDateTo : undefined;
      applyFilters([program, location, jobTitle, company, minSalary, maxSalary, minDuration, maxDuration, startDateFrom, startDateTo]);
    } else if (userRole === 'EMPLOYER') {
      const status = formData.status != "" ? formData.status : undefined;
      const program = formData.program != "" ? formData.program : undefined;
      applyFilters([status, program]);
    }
  }

  // Render filters based on user role
  const renderFilters = () => {
    if (userRole === 'INTERNSHIP_MANAGER') {
      return (
        <>
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
              <option value="false" className="text-gray-900 bg-white">{t('dashboard.pending')}</option>
              <option value="true" className="text-gray-900 bg-white">{t('dashboard.validated')}</option>
            </select>
          </div>
          <ProgramSelector onChange={handleSelectChange}/>
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
        </>
      );
    } else if (userRole === 'STUDENT') {
      return (
        <>
          <ProgramSelector onChange={handleSelectChange}/>
          <FormInput
            className={"mb-3"}
            id={"location"}
            name={"location"}
            type={"text"}
            label={t('student.location')}
            placeholder={t('student.locationPlaceholder')}
            value={formData.location || ""}
            onChange={handleChange}
            required={false}
          />
          <FormInput
            className={"mb-3"}
            id={"jobTitle"}
            name={"jobTitle"}
            type={"text"}
            label={t('student.jobTitle')}
            placeholder={t('student.jobTitlePlaceholder')}
            value={formData.jobTitle || ""}
            onChange={handleChange}
            required={false}
          />
          <FormInput
            className={"mb-3"}
            id={"company"}
            name={"company"}
            type={"text"}
            label={t('student.company')}
            placeholder={t('student.companyPlaceholder')}
            value={formData.company || ""}
            onChange={handleChange}
            required={false}
          />
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('student.salaryRange')}
            </label>
            <div className="flex gap-2">
              <FormInput
                id={"minSalary"}
                name={"minSalary"}
                type={"number"}
                label=""
                placeholder={t('student.min')}
                value={formData.minSalary || ""}
                onChange={handleChange}
                required={false}
              />
              <FormInput
                id={"maxSalary"}
                name={"maxSalary"}
                type={"number"}
                label=""
                placeholder={t('student.max')}
                value={formData.maxSalary || ""}
                onChange={handleChange}
                required={false}
              />
            </div>
          </div>
          <div className="mb-3">
            <div className="flex gap-2">
              <FormInput
                id={"minDuration"}
                name={"minDuration"}
                type={"number"}
                label={t('student.minWeeks')}
                placeholder={t('student.minWeeks')}
                value={formData.minDuration || ""}
                onChange={handleChange}
                required={false}
              />
              <FormInput
                id={"maxDuration"}
                name={"maxDuration"}
                type={"number"}
                label={t('student.maxWeeks')}
                placeholder={t('student.maxWeeks')}
                value={formData.maxDuration || ""}
                onChange={handleChange}
                required={false}
              />
            </div>
          </div>
          <div className="mb-3">
            <div className="flex gap-2">
              <FormInput
                id={"startDateFrom"}
                name={"startDateFrom"}
                type={"date"}
                label={t('student.dateFrom')}
                placeholder={t('student.dateFrom')}
                value={formData.startDateFrom || ""}
                onChange={handleChange}
                required={false}
              />
              <FormInput
                id={"startDateTo"}
                name={"startDateTo"}
                type={"date"}
                label={t('student.dateTo')}
                placeholder={t('student.dateTo')}
                value={formData.startDateTo || ""}
                onChange={handleChange}
                required={false}
              />
            </div>
          </div>
        </>
      );
    } else if (userRole === 'EMPLOYER') {
      return (
        <>
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
              <option value="false" className="text-gray-900 bg-white">{t('dashboard.pending')}</option>
              <option value="true" className="text-gray-900 bg-white">{t('dashboard.validated')}</option>
            </select>
          </div>
          <ProgramSelector onChange={handleSelectChange}/>
        </>
      );
    }
    return null;
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-y-auto">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('im.filterAccordingTo')}</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {renderFilters()}
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
  )
}
