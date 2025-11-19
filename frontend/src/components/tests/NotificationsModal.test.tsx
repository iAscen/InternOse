import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { userAPI } from '~/services/UserAPI';
import type { Notification } from '~/interfaces';
import { NotificationsModal } from '../NotificationsModal';

vi.mock('~/services/UserAPI', () => ({
  userAPI: {
    getUserRole: vi.fn()
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('ProfessorListModal', () => {
  const mockOnClose = vi.fn();
  const mockOnNotificationDeletionButtonClick = vi.fn()

  const notification: Notification = {
    id: 1,
    message: "Message",
    type: "type",
    createdAt: "2025-11-19T14:30:15",
    checked: false
  }

  const notifications: Notification[] = [
    notification
  ]

 let error: string | null = null

  it('should display an error that says notifications failed to load', () => {
    error = 'Notifications loading error'

    render(<NotificationsModal
        onClose={mockOnClose}
        onNotificationDeletionButtonClick={mockOnNotificationDeletionButtonClick}
        notifications={notifications}
        error={error}
    ></NotificationsModal>)

    const errorMessage = screen.getAllByText(error)
    expect(errorMessage).toHaveLength(1)
    const notification = screen.queryAllByText('Message');
    expect(notification).toHaveLength(0)
  }),

  it('should display a notification', () => {
    vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');
    
    render(<NotificationsModal
        onClose={mockOnClose}
        onNotificationDeletionButtonClick={mockOnNotificationDeletionButtonClick}
        notifications={notifications}
        error={null}
    ></NotificationsModal>)

    const notification = screen.getAllByText('Message');
    expect(notification).toHaveLength(1)
  }),

  it('should display a message that says you have no notifications', () => {
    vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');
    
    render(<NotificationsModal
        onClose={mockOnClose}
        onNotificationDeletionButtonClick={mockOnNotificationDeletionButtonClick}
        notifications={[]}
        error={null}
    ></NotificationsModal>)

    const notFoundMessage = screen.getAllByText('navigation.noNotificationsFound');
    expect(notFoundMessage).toHaveLength(1)
    const notification = screen.queryAllByText('Message');
    expect(notification).toHaveLength(0)
  })
})