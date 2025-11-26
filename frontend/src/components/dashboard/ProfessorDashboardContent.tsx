import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { InternshipContract } from "~/interfaces";
import DashboardSidebar from "./DashboardSidebar";
import { professorAPI } from "../../services/ProfessorAPI";
import { userAPI } from "../../services/UserAPI";
import StatisticsCard from "~/components/dashboard/StatisticsCard";
import ProfessorStudentDetailsModal from "./ProfessorStudentDetailsModal";
import { useClickOutside } from "~/hooks";
import { sortContracts, filterProfessorContracts } from "~/utils/filterUtils";

export default function ProfessorDashboardContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('etudiants');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState<InternshipContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<InternshipContract | null>(null);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<{
    company?: string;
    status?: string;
  }>({});

  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(sortMenuRef, () => setShowSortMenu(false));
  useClickOutside(filterMenuRef, () => setShowFilterMenu(false));

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = await userAPI.getProfessorIdFromJWT();

      if (userId) {
        const response = await professorAPI.findInternshipContracts(userId);

        if (response.success && response.data) {
          setContracts(response.data);
        } else {
          setError(response.error ?? t('professor.contractsNotFound'));
        }
      } else {
        setError(t('professor.contractsNotFound'));
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      setError(t('professor.contractsNotFound'));
    } finally {
      setLoading(false);
    }
  };

  const statsIcons = {
    total: (
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
      </svg>
    ),
  };

  const getProfessorStats = () => {
    return {
      students: contracts.length
    };
  };

  const stats = getProfessorStats();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getContractStatus = (contract: InternshipContract): string => {
    const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
    if (allSigned) {
      return t('professor.contractFullySigned');
    }
    const anySigned = contract.isSignedStudent || contract.isSignedEmployer || contract.isSignedInternshipManager;
    if (anySigned) {
      return t('professor.contractPartiallySigned');
    }
    return t('professor.contractPending');
  };

  const getStatusBadgeColor = (contract: InternshipContract): string => {
    const allSigned = contract.isSignedStudent && contract.isSignedEmployer && contract.isSignedInternshipManager;
    if (allSigned) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    const anySigned = contract.isSignedStudent || contract.isSignedEmployer || contract.isSignedInternshipManager;
    if (anySigned) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Apply filters and sorting
  const filteredAndSortedContracts = useMemo(() => {
    let filtered = contracts;

    // Apply filters
    if (filters.company || filters.status) {
      filtered = filterProfessorContracts(filtered, {
        company: filters.company,
        status: filters.status,
      });
    }

    // Apply sorting
    if (sortBy) {
      filtered = sortContracts(filtered, sortBy, sortOrder === 'asc');
    }

    return filtered;
  }, [contracts, filters, sortBy, sortOrder]);

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setShowSortMenu(false);
  };

  const handleFilterChange = (filterType: 'company' | 'status', value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === '') {
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = value;
      }
      return newFilters;
    });
    setShowFilterMenu(false);
  };

  const clearFilters = () => {
    setFilters({});
    setSortBy('');
    setSortOrder('asc');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || sortBy !== '';

  return (
    <div className="mx-auto flex min-h-screen w-full min-w-[320px] flex-col bg-slate-100 lg:ps-96">
      <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main id="page-content" className="flex max-w-full flex-auto flex-col pt-20 lg:pt-0 bg-slate-100">
        <div className="mx-auto w-full xl:max-w-7xl bg-slate-100">
          {error && (
            <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              <div className="mx-auto px-4 sm:px-0 pt-4 pb-8 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {t('professor.dashboard')}
                  </h1>
                  <p className="text-base sm:text-lg font-semibold text-slate-700 leading-relaxed">
                    {t('professor.nbStudents')}: {stats.students}
                  </p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 md:gap-6">
                  <div className="sm:col-span-6 xl:col-span-3">
                    <StatisticsCard
                      title={t('professor.nbStudents')}
                      value={stats.students}
                      icon={statsIcons.total}
                      bgColor="bg-blue-100"
                      iconColor="text-blue-600"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Students Tab */}
          {activeTab === 'etudiants' && (
            <div className="mx-auto px-4 sm:px-0 pt-4 pb-8 sm:max-w-2xl md:max-w-3xl lg:max-w-5xl xl:max-w-7xl">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {t('professor.myStudents')}
                  </h1>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <p className="text-slate-600">{t('professor.loading')}</p>
                  </div>
                ) : filteredAndSortedContracts.length === 0 && contracts.length === 0 ? (
                  <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                    <p className="text-slate-700 text-lg mb-2">{t('professor.noStudentFound')}</p>
                    <p className="text-slate-500 text-sm">{t('professor.noContractsMessage')}</p>
                  </div>
                ) : (
                  <>
                    {/* Filters and Sort Controls */}
                    <div className="mb-6 flex flex-wrap gap-3 items-center">
                      <div className="relative" ref={sortMenuRef}>
                        <button
                          onClick={() => setShowSortMenu(!showSortMenu)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                          </svg>
                          {t('professor.sortBy')}
                          {sortBy && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                              {sortBy === 'name' ? t('professor.sortByName') :
                               sortBy === 'company' ? t('professor.sortByCompany') :
                               sortBy === 'status' ? t('professor.sortByStatus') :
                               sortBy === 'startdate' ? t('professor.sortByStartDate') : ''}
                            </span>
                          )}
                        </button>
                        {showSortMenu && (
                          <div className="absolute top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                            <button
                              onClick={() => handleSortChange('name')}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700"
                            >
                              {t('professor.sortByName')}
                            </button>
                            <button
                              onClick={() => handleSortChange('company')}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700"
                            >
                              {t('professor.sortByCompany')}
                            </button>
                            <button
                              onClick={() => handleSortChange('status')}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700"
                            >
                              {t('professor.sortByStatus')}
                            </button>
                            <button
                              onClick={() => handleSortChange('startdate')}
                              className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm text-slate-700"
                            >
                              {t('professor.sortByStartDate')}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="relative" ref={filterMenuRef}>
                        <button
                          onClick={() => setShowFilterMenu(!showFilterMenu)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                          </svg>
                          {t('professor.filterBy')}
                          {hasActiveFilters && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                              {Object.keys(filters).length}
                            </span>
                          )}
                        </button>
                        {showFilterMenu && (
                          <div className="absolute top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                            <div className="p-2">
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                {t('professor.filterByCompany')}
                              </label>
                              <input
                                type="text"
                                value={filters.company || ''}
                                onChange={(e) => handleFilterChange('company', e.target.value)}
                                placeholder={t('professor.filterByCompany')}
                                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                            </div>
                            <div className="p-2 border-t border-slate-200">
                              <label className="block text-xs font-medium text-slate-600 mb-1">
                                {t('professor.filterByStatus')}
                              </label>
                              <select
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">{t('professor.allStatuses')}</option>
                                <option value="fullySigned">{t('professor.contractFullySigned')}</option>
                                <option value="pendingSignatures">{t('professor.contractPending')}</option>
                              </select>
                            </div>
                            {hasActiveFilters && (
                              <div className="p-2 border-t border-slate-200">
                                <button
                                  onClick={clearFilters}
                                  className="w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                  {t('common.clear') || 'Effacer les filtres'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 underline"
                        >
                          {t('common.clear') || 'Effacer'}
                        </button>
                      )}
                    </div>

                    {/* Students List */}
                    {filteredAndSortedContracts.length === 0 ? (
                      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                        <p className="text-slate-700">{t('professor.noStudentFound')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAndSortedContracts.map((contract) => (
                          <div
                            key={contract.id}
                            className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
                          >
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-4">
                                  <div>
                                    <h3 className="text-xl font-semibold text-slate-900 mb-1">
                                      {contract.studentFirstName} {contract.studentLastName}
                                    </h3>
                                    {contract.internshipOfferTitle && (
                                      <p className="text-sm text-slate-600 mb-2">
                                        {contract.internshipOfferTitle}
                                      </p>
                                    )}
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(contract)}`}>
                                    {getContractStatus(contract)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  {contract.employerCompany && (
                                    <div>
                                      <label className="text-xs font-medium text-slate-500 uppercase">
                                        {t('professor.companyName')}
                                      </label>
                                      <p className="text-sm text-slate-900 mt-1">{contract.employerCompany}</p>
                                    </div>
                                  )}
                                  <div>
                                    <label className="text-xs font-medium text-slate-500 uppercase">
                                      {t('professor.period')}
                                    </label>
                                    <p className="text-sm text-slate-900 mt-1">
                                      {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                                    </p>
                                  </div>
                                  {contract.supervisorName && (
                                    <div>
                                      <label className="text-xs font-medium text-slate-500 uppercase">
                                        {t('professor.supervisorName')}
                                      </label>
                                      <p className="text-sm text-slate-900 mt-1">{contract.supervisorName}</p>
                                    </div>
                                  )}
                                  {contract.supervisorEmail && (
                                    <div>
                                      <label className="text-xs font-medium text-slate-500 uppercase">
                                        {t('professor.supervisorEmail')}
                                      </label>
                                      <p className="text-sm text-slate-900 mt-1">
                                        <a href={`mailto:${contract.supervisorEmail}`} className="text-indigo-600 hover:text-indigo-800">
                                          {contract.supervisorEmail}
                                        </a>
                                      </p>
                                    </div>
                                  )}
                                  {contract.supervisorPhone && (
                                    <div>
                                      <label className="text-xs font-medium text-slate-500 uppercase">
                                        {t('professor.supervisorPhone')}
                                      </label>
                                      <p className="text-sm text-slate-900 mt-1">
                                        <a href={`tel:${contract.supervisorPhone}`} className="text-indigo-600 hover:text-indigo-800">
                                          {contract.supervisorPhone}
                                        </a>
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex-shrink-0">
                                <button
                                  onClick={() => setSelectedContract(contract)}
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium whitespace-nowrap"
                                >
                                  {t('professor.viewDetails')}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
            </div>
          )}
        </div>
      </main>

      {/* Student Details Modal */}
      {selectedContract && (
        <ProfessorStudentDetailsModal
          contract={selectedContract}
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </div>
  );
}
