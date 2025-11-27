import { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { InternshipContract } from "~/interfaces";
import DashboardLayout from "./DashboardLayout";
import DashboardHeader from "./DashboardHeader";
import DashboardSection from "./DashboardSection";
import { professorAPI } from "../../services/ProfessorAPI";
import { userAPI } from "../../services/UserAPI";
import StatisticsCard from "~/components/dashboard/StatisticsCard";
import ProfessorStudentDetailsModal from "./ProfessorStudentDetailsModal";
import ProfessorStudentList from "./ProfessorStudentList";
import ProfessorSortMenu from "./ProfessorSortMenu";
import ProfessorFilterMenu from "./ProfessorFilterMenu";
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
    program?: string;
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
    if (filters.company || filters.status || filters.program) {
      filtered = filterProfessorContracts(filtered, {
        company: filters.company,
        status: filters.status,
        program: filters.program,
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

  const handleFilterChange = (filterType: 'company' | 'status' | 'program', value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (value === '') {
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = value;
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({});
    setSortBy('');
    setSortOrder('asc');
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || sortBy !== '';

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab} error={error}>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
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
          )}

          {/* Students Tab */}
          {activeTab === 'etudiants' && (
        <>
          <DashboardHeader subtitle="professor.myStudentsSubtitle" />
          
          <DashboardSection
            title="professor.myStudents"
            showSort={true}
            showFilter={true}
            loading={loading}
            emptyMessage={contracts.length === 0 ? 'professor.noStudentFound' : undefined}
            emptySubMessage={contracts.length === 0 ? 'professor.noContractsMessage' : undefined}
            sortMenuRef={sortMenuRef}
            filterMenuRef={filterMenuRef}
            sortMenu={
              showSortMenu ? (
                <ProfessorSortMenu onSortChange={handleSortChange} />
              ) : undefined
            }
            filterMenu={
              showFilterMenu ? (
                <ProfessorFilterMenu
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={clearFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              ) : undefined
            }
            onSortToggle={() => {
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
            onFilterToggle={() => {
              setShowSortMenu(false);
              setShowFilterMenu(!showFilterMenu);
            }}
          >
            {filteredAndSortedContracts.length === 0 && contracts.length > 0 ? (
              <div className="text-center p-6 text-sm font-medium text-slate-500">
                        <p className="text-slate-700">{t('professor.noStudentFound')}</p>
                      </div>
                    ) : (
              <ProfessorStudentList
                contracts={filteredAndSortedContracts}
                onContractSelect={setSelectedContract}
                getStatusBadgeColor={getStatusBadgeColor}
                getContractStatus={getContractStatus}
                formatDate={formatDate}
              />
            )}
          </DashboardSection>
                  </>
                )}

      {/* Student Details Modal */}
      {selectedContract && (
        <ProfessorStudentDetailsModal
          contract={selectedContract}
          isOpen={!!selectedContract}
          onClose={() => setSelectedContract(null)}
        />
      )}
    </DashboardLayout>
  );
}
