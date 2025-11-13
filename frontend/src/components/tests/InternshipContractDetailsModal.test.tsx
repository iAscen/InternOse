import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import InternshipContractDetailsModal from '../dashboard/InternshipContractDetailsModal';
import type { InternshipContract } from '~/interfaces';
import { userAPI } from '~/services/UserAPI';
import { studentAPI } from '~/services/StudentAPI';
import { employerAPI } from '~/services/EmployerAPI';

vi.mock('~/services/UserAPI', () => ({
  userAPI: {
    getUserRole: vi.fn()
  }
}));

vi.mock('~/services/StudentAPI', () => ({
  studentAPI: {
    signContract: vi.fn()
  }
}));

vi.mock('~/services/EmployerAPI', () => ({
  employerAPI: {
    signContract: vi.fn()
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('InternshipContractDetailsModal', () => {
  const mockOnClose = vi.fn();
  const mockOnContractUpdate = vi.fn();

  const mockContract: InternshipContract = {
    id: 1,
    startDate: '2024-07-01',
    endDate: '2024-12-31',
    weeklyHours: 35,
    tasks: 'Assist with software development and testing',
    educationalObjectives: 'Gain practical experience in Java and Spring Boot',
    supervisorName: 'Jane Doe',
    supervisorTitle: 'Senior Developer',
    supervisorEmail: 'jane.doe@example.com',
    supervisorPhone: '+1-555-123-4567',
    isSignedStudent: false,
    isSignedEmployer: false,
    isSignedInternshipManager: false,
    studentId: 5,
    studentFirstName: 'John',
    studentLastName: 'Smith',
    employerId: 2,
    employerCompany: 'Tech Corp',
    internshipOfferId: 10,
    internshipOfferTitle: 'Software Developer Internship'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Student signing contract', () => {
    it('should allow student to view contract details before signing', () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      expect(screen.getByText('Software Developer Internship')).toBeInTheDocument();
      expect(screen.getByText(/John/)).toBeInTheDocument();
      expect(screen.getByText(/Smith/)).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Assist with software development and testing')).toBeInTheDocument();
      expect(screen.getByText('Gain practical experience in Java and Spring Boot')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should show sign button for student when contract is waiting for student signature', () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      expect(screen.getByText('internshipContract.sign')).toBeInTheDocument();
    });

    it('should successfully sign contract as student and update status', async () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');
      vi.mocked(studentAPI.signContract).mockResolvedValue({ success: true });

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      const signButton = screen.getByText('internshipContract.sign');
      fireEvent.click(signButton);

      await waitFor(() => {
        expect(studentAPI.signContract).toHaveBeenCalledWith(mockContract.internshipOfferId);
        expect(mockOnContractUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should display error when student signing fails due to technical issue', async () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');
      vi.mocked(studentAPI.signContract).mockResolvedValue({
        success: false,
        error: 'Error signing contract'
      });

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      const signButton = screen.getByText('internshipContract.sign');
      fireEvent.click(signButton);

      await waitFor(() => {
        expect(screen.getByText('Error signing contract')).toBeInTheDocument();
      });

      expect(mockOnContractUpdate).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not show sign button when student has already signed', () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');

      const signedContract = { ...mockContract, isSignedStudent: true };

      render(
        <InternshipContractDetailsModal
          contract={signedContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      expect(screen.queryByText('internshipContract.sign')).not.toBeInTheDocument();
    });
  });

  describe('Employer signing contract', () => {
    it('should allow employer to view contract details before signing', () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('EMPLOYER');

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      expect(screen.getByText('Software Developer Internship')).toBeInTheDocument();
      expect(screen.getByText(/John/)).toBeInTheDocument();
      expect(screen.getByText(/Smith/)).toBeInTheDocument();
      expect(screen.getByText('Assist with software development and testing')).toBeInTheDocument();
      expect(screen.getByText('Gain practical experience in Java and Spring Boot')).toBeInTheDocument();
    });

    it('should show sign button for employer when contract is waiting for employer signature', () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('EMPLOYER');

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      expect(screen.getByText('internshipContract.sign')).toBeInTheDocument();
    });

    it('should successfully sign contract as employer and update status', async () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('EMPLOYER');
      vi.mocked(employerAPI.signContract).mockResolvedValue({ success: true });

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      const signButton = screen.getByText('internshipContract.sign');
      fireEvent.click(signButton);

      await waitFor(() => {
        expect(employerAPI.signContract).toHaveBeenCalledWith(
          mockContract.internshipOfferId,
          mockContract.studentId
        );
        expect(mockOnContractUpdate).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should display error when employer signing fails due to technical issue', async () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('EMPLOYER');
      vi.mocked(employerAPI.signContract).mockResolvedValue({
        success: false,
        error: 'Signing failed'
      });

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      const signButton = screen.getByText('internshipContract.sign');
      fireEvent.click(signButton);

      await waitFor(() => {
        expect(screen.getByText('Signing failed')).toBeInTheDocument();
      });
    });

    it('should not show sign button when employer has already signed', () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('EMPLOYER');

      const signedContract = { ...mockContract, isSignedEmployer: true };

      render(
        <InternshipContractDetailsModal
          contract={signedContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      expect(screen.queryByText('internshipContract.sign')).not.toBeInTheDocument();
    });
  });

  describe('Signature status display', () => {
    it('should display signature status for all parties', () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');

      render(
        <InternshipContractDetailsModal
          contract={mockContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      const notSignedElements = screen.getAllByText('internshipContract.notSigned');
      expect(notSignedElements).toHaveLength(3);
    });

    it('should show when all three signatures are completed', () => {
      vi.mocked(userAPI.getUserRole).mockReturnValue('STUDENT');

      const fullySignedContract = {
        ...mockContract,
        isSignedStudent: true,
        isSignedEmployer: true,
        isSignedInternshipManager: true
      };

      render(
        <InternshipContractDetailsModal
          contract={fullySignedContract}
          onClose={mockOnClose}
          onContractUpdate={mockOnContractUpdate}
        />
      );

      const signedElements = screen.getAllByText('internshipContract.signed');
      expect(signedElements).toHaveLength(3);
    });
  });
});
