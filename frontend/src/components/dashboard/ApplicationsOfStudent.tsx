import { useState } from "react";
import { useTranslation } from "react-i18next";
import type {StudentApplication} from "~/interfaces";

interface ApplicationsOfStudentProps {
    applications: StudentApplication[]
}

export default function ApplicationsOfStudent({applications}: ApplicationsOfStudentProps) {
    const { t } = useTranslation();

    const getApplicationDate = (application: StudentApplication) => {
        const isoString = "2025-11-01T18:06:37.31557";
        const date = new Date(isoString);
        const formatted = date.toISOString().split("T")[0];
        return formatted
    }

    return (
        <div className="bg-white rounded-lg shadow-md pb-6">
            <div className="px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-900">Mes candidatures</h2>
            </div>
    
          <div className="divide-y divide-gray-200 shadow-lg rounded-lg ms-6 me-6">
            {applications.map((application, index) => (
              <div 
                className={`p-6 hover:bg-gray-50 transition-colors`}
                key={index}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{application.internshipOfferTitle}</h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {application.internshipOfferAddress}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {application.internshipOfferStartDate} - {application.internshipOfferEndDate}
                          </div>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {application.internshipOfferDuration} {t('internship.weeks')}
                          </div>
                        </div>
                      </div>
                      
                        {/*Ici vas le bout manquant*/}

                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">{t('employer.date')}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{getApplicationDate(application)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
}

{/*
<div className="ml-4 flex flex-col items-end space-y-2">
                        {getStatusBadge(offer)}
                        {!isEmployer && !isStudent && (!offer.verificationStatus || offer.verificationStatus === 'PENDING') && (
                          <button
                            onClick={() => handleValidateOffer(offer)}
                            className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {t('im.validateOffer')}
                          </button>
                        )}
                          {isStudent && offer.verificationStatus === 'APPROVED' && (
                              cvStatus === 'approved' ? (
                                  offer.applicationStatus ? (
                                      <button
                                          disabled
                                          className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md cursor-not-allowed ${
                                              offer.applicationStatus === 'PENDING_INTERVIEW' 
                                                  ? 'text-blue-700 bg-blue-100' 
                                                  : offer.applicationStatus === 'ACCEPTED'
                                                  ? 'text-green-700 bg-green-100'
                                                  : offer.applicationStatus === 'REJECTED'
                                                  ? 'text-red-700 bg-red-100'
                                                  : 'text-green-700 bg-green-100'
                                          }`}
                                      >
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          {offer.applicationStatus === 'PENDING_INTERVIEW' 
                                              ? 'Entrevue en attente'
                                              : offer.applicationStatus === 'ACCEPTED'
                                              ? 'Candidature acceptée'
                                              : offer.applicationStatus === 'REJECTED'
                                              ? 'Candidature refusée'
                                              : 'Candidature envoyée'
                                          }
                                      </button>
                                  ) : (
                                      <button
                                          onClick={() => handleApplyClick(offer)}
                                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                                      >
                                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          {t('student.apply')}
                                      </button>
                                  )
                              ) : (
                                  <button
                                      disabled
                                      className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-500 bg-gray-100 rounded-md cursor-not-allowed"
                                      title={cvStatus === 'none' ? 'Téléversez un CV pour postuler' : 'Votre CV doit être approuvé pour postuler'}
                                  >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {t('student.apply')}
                                  </button>
                              )
                          )}
                      </div>
*/}