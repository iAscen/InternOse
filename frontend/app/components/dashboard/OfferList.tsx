import { useTranslation } from 'react-i18next';
import type { InternshipOffer } from '~/interfaces';

interface OfferListProps {
  isEmployer: boolean;
  loading: boolean;
  offers: InternshipOffer[];
}

export default function OfferList({ isEmployer, loading, offers }: OfferListProps) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.myOffers')}</h2>
        </div>
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md">
        { isEmployer &&
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.myOffers')}</h2>
          </div>
        }
        <div className="p-6 text-center text-gray-500">
          <p>{isEmployer ? t('dashboard.noOffers') : t('im.internshipOffersSectionEmpty')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      { isEmployer &&
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.myOffers')}</h2>
        </div>
      }

      <div className="divide-y divide-gray-200">
        {offers.map((offer, index) => (
          <div key={offer.id || index} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{offer.jobTitle}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {offer.address}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {offer.startDate} - {offer.endDate}
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {offer.duration} {t('internship.weeks')}
                      </div>
                    </div>
                    {offer.salary > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          ${offer.salary}{t('internship.perHour')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      offer.validee 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {offer.validee ? t('dashboard.validated') : t('dashboard.pending')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{t('internship.description')}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{offer.taskDescription}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{t('internship.requirements')}</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{offer.qualifications}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
