import {useTranslation} from "react-i18next";
import {useForm} from "~/hooks";
import FormInput from "~/components/FormInput";
import ProgramSelector from "~/components/ProgramSelector";

interface FilterMenuOffersProps {
  applyFilters: Function;
  userRole: 'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER';
  isHistory?: boolean;
  availableSessions?: string[];
  selectedSession?: string;
  activeTab?: string; // Pour savoir quel onglet est actif et adapter les filtres
}

export default function FilterMenuOffers({applyFilters, userRole, isHistory = false, availableSessions = [], selectedSession = '', activeTab}: FilterMenuOffersProps) {
  const {t} = useTranslation();

  const getInitialFormData = () => {
    switch (userRole) {
      case 'INTERNSHIP_MANAGER':
        return {
          program: "",
          title: "",
          session: ""
        };
      case 'STUDENT':
        return {
          program: "",
          jobTitle: "",
          minSalary: "",
          maxSalary: "",
          startDateFrom: "",
          startDateTo: ""
        };
      case 'EMPLOYER':
        if (isHistory) {
          return {
            program: "",
            title: ""
          };
        }
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
      const program = formData.program != "" ? formData.program : undefined;
      const title = formData.title != "" ? formData.title : undefined;
      applyFilters([program, title]);
    } else if (userRole === 'STUDENT') {
      const program = formData.program != "" ? formData.program : undefined;
      const jobTitle = formData.jobTitle != "" ? formData.jobTitle : undefined;
      const minSalary = formData.minSalary != "" ? formData.minSalary : undefined;
      const maxSalary = formData.maxSalary != "" ? formData.maxSalary : undefined;
      const startDateFrom = formData.startDateFrom != "" ? formData.startDateFrom : undefined;
      const startDateTo = formData.startDateTo != "" ? formData.startDateTo : undefined;
      applyFilters([program, jobTitle, minSalary, maxSalary, startDateFrom, startDateTo]);
    } else if (userRole === 'EMPLOYER') {
      if (isHistory) {
        // Pour l'historique, on envoie seulement [program, title] (pas de status, pas de session)
        const program = formData.program != "" ? formData.program : undefined;
        const title = formData.title != "" ? formData.title : undefined;
        applyFilters([program, title]);
      } else {
        // Pour les onglets "offers" et "approved-offers", on envoie [status, program]
        // Le status est ignoré car l'onglet détermine déjà le statut
        // La session n'est pas dans le filtre car elle n'est disponible que dans l'historique
        const status = formData.status != "" ? formData.status : undefined;
        const program = formData.program != "" ? formData.program : undefined;
        applyFilters([status, program]);
      }
    }
  }

  const renderFilters = () => {
    if (userRole === 'INTERNSHIP_MANAGER') {
      return (
        <>
          <ProgramSelector onChange={handleSelectChange} value={formData.program}/>
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
          <ProgramSelector onChange={handleSelectChange} value={formData.program}/>
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
      if (isHistory) {
        // Pour l'historique, seulement program et title (pas de status, pas de session)
        return (
          <>
            <ProgramSelector onChange={handleSelectChange} value={formData.program}/>
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
      }
      // Pour l'EMPLOYER, on n'affiche le filtre par statut que si on n'est pas dans un onglet spécifique
      // Les onglets "offers" et "approved-offers" filtrent déjà par statut
      const showStatusFilter = activeTab !== 'offers' && activeTab !== 'approved-offers';
      // Le filtre par session n'est disponible que dans l'onglet "history"
      const showSessionFilter = isHistory;
      
      return (
        <>
          {showStatusFilter && (
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
                <option value="PENDING" className="text-gray-900 bg-white">{t('dashboard.pending')}</option>
                <option value="APPROVED" className="text-gray-900 bg-white">{t('dashboard.validated')}</option>
                <option value="REJECTED" className="text-gray-900 bg-white">{t('dashboard.rejected')}</option>
              </select>
            </div>
          )}
          <ProgramSelector onChange={handleSelectChange} value={formData.program}/>
        </>
      );
    }
    return null;
  };

  return (
    <div className="absolute end-0 z-10 mt-2 w-96 rounded-lg shadow-xl max-h-[600px] ltr:origin-top-right rtl:origin-top-left">
      <div className="rounded-lg bg-white py-2.5 ring-1 ring-black/5 max-h-[600px] overflow-y-auto">
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
    </div>
  )
}
