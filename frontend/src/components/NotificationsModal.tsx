import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { InternshipContract, Professor } from "~/interfaces";
import { internshipManagerAPI } from "~/services/InternshipManagerAPI";
import type { Notification } from "~/interfaces";

interface NotificationsModal {
    onClose: () => void,
    notifications: Notification[],
    error: String | null,
    onNotificationDeletionButtonClick: (notificationId: number) => void
}

export function NotificationsModal(
    {
    onClose,
    notifications,
    error,
    onNotificationDeletionButtonClick
    }: NotificationsModal) {
    
    const { t } = useTranslation()

    const formatDateTime = (dateTimeString: string) => {
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      const formattedDate = date.toLocaleDateString('fr-CA', { year: 'numeric', month: 'long', day: 'numeric' });
      const formattedTime =
        date.getHours().toString().padStart(2, '0') + ':' +
        date.getMinutes().toString().padStart(2, '0') + ':' +
        date.getSeconds().toString().padStart(2, '0');

      return formattedDate + " " + formattedTime
    };

    return <>
        <div
        className="fixed inset-0 backdrop-blur-[2px] flex items-center justify-center z-[100]"
        onClick={onClose}
        > 
        <div onClick={(e) => e.stopPropagation()} className="p-6 overflow-y-auto flex-1 w-1">

            <div className="mb-6 bg-gray-100 w-3/4 m-auto">
                <h2 className="text-xl p-3 font-semibold bg-gray-200 text-gray-900 mb-4">
                {t('navigation.notifications')}
                </h2>
                <div>
                    {!error && notifications.map((notification) => 
                        <div key={notification.id}>
                            <div className="text-gray-900 flex pb-2 ps-3 pe-3">
                                <div>  
                                    {notification.message}
                                </div>

                                <div className="ms-auto flex justify-end">
                                    <span className="me-2">{formatDateTime(notification.createdAt)}</span>
                                    
                                    <button onClick={() => onNotificationDeletionButtonClick(notification.id)}
                                        className="w-7 h-7 bg-red-600 flex items-center justify-center rounded-md hover:bg-red-700 active:translate-y-px"
                                        aria-label="Close"
                                        >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                                            <path d="M6 6 L18 18 M6 18 L18 6" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            <hr className="border-t border-gray-300" />
                        </div>
                    )}

                    { notifications.length < 1 && !error &&
                        <div className="text-gray-900 pb-3 text-center">{t('navigation.noNotificationsFound')}</div>
                    }

                    {
                        error && <div className="text-red-600 font-medium text-center pb-3">{error}</div>
                    }
                </div>
            </div>

        </div>
    </div>
    </>
}