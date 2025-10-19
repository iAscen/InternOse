package cal.ose.internose.service;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InternshipManagerServiceTest {
    @Mock
    private InternshipOfferDAO internshipOfferDAO;
    @Mock
    private StudentDAO studentDAO;
    @InjectMocks
    private InternshipManagerService internshipManagerService;

    @Test
    void findInternshipsBy() {
        when(internshipOfferDAO.findInternshipsBy("%Informatique%", null, null))
            .thenReturn(getInformatiqueInternships());

        List<InternshipOfferDTO> internshipOfferDTOS = internshipManagerService
            .findInternshipsBy("Informatique", null, null, "status");

        assertEquals(3, internshipOfferDTOS.size());
        assertEquals("Informatique", internshipOfferDTOS.getFirst().getProgram());
        assertFalse(internshipOfferDTOS.getFirst().isVerified());
    }

    @Test
    void sortByDomain() {
        when(internshipOfferDAO.findInternshipsBy(null, null, null))
            .thenReturn(List.of(
                InternshipOffer.builder().program("Informatique").validationStatus(VerificationStatus.APPROVED)
                    .build(),
                InternshipOffer.builder().program("Biologie").validationStatus(VerificationStatus.APPROVED).build(),
                InternshipOffer.builder().program("Architecture").validationStatus(VerificationStatus.APPROVED)
                    .build()));

        List<InternshipOfferDTO> result = internshipManagerService
            .findInternshipsBy(null, null, null, null);

        assertEquals(3, result.size());
        assertEquals("Architecture", result.get(0).getProgram());
        assertEquals("Biologie", result.get(1).getProgram());
        assertEquals("Informatique", result.get(2).getProgram());
    }

    @Test
    void findInternshipsByNothingFound() {
        when(internshipOfferDAO.findInternshipsBy("%non%", null, null))
            .thenReturn(List.of());

        List<InternshipOfferDTO> internshipOfferDTOS = internshipManagerService
            .findInternshipsBy("non", null, null, null);

        assertEquals(0, internshipOfferDTOS.size());
    }

    @Test
    void approveInternshipOffer() {
        Long offerId = 1L;
        InternshipOffer existing = InternshipOffer.builder()
            .id(offerId)
            .validationStatus(VerificationStatus.PENDING)
            .build();
        when(internshipOfferDAO.findInternshipOfferById(offerId)).thenReturn(existing);

        internshipManagerService.verifyInternshipOffer(offerId, true, "any comment should be ignored on approve");

        ArgumentCaptor<InternshipOffer> captor = ArgumentCaptor.forClass(InternshipOffer.class);
        verify(internshipOfferDAO, times(1)).save(captor.capture());
        InternshipOffer saved = captor.getValue();

        assertEquals(VerificationStatus.APPROVED, saved.getVerificationStatus(), "Status must be 'approuvé' on approval");
        assertNull(saved.getRejectionReason(), "Rejection reason must be cleared on approval");
    }

    @Test
    void rejectInternshipOffer() {
        Long offerId = 2L;
        String rejectionComment = "Détails insufficient dans la description";
        InternshipOffer existing = InternshipOffer.builder()
            .id(offerId)
            .rejectionReason(null)
            .validationStatus(VerificationStatus.PENDING)
            .build();
        when(internshipOfferDAO.findInternshipOfferById(offerId)).thenReturn(existing);

        internshipManagerService.verifyInternshipOffer(offerId, false, rejectionComment);

        ArgumentCaptor<InternshipOffer> captor = ArgumentCaptor.forClass(InternshipOffer.class);
        verify(internshipOfferDAO, times(1)).save(captor.capture());
        InternshipOffer saved = captor.getValue();

        assertTrue(saved.isVerified());
        assertEquals(VerificationStatus.REJECTED, saved.getVerificationStatus());
        assertEquals(rejectionComment, saved.getRejectionReason());
    }

    @Test
    void validationInternshipOfferNotFound() {
        Long missingId = 999L;
        when(internshipOfferDAO.findInternshipOfferById(missingId)).thenReturn(null);

        assertThrows(ResourceNotFoundException.class,
            () -> internshipManagerService.verifyInternshipOffer(missingId, true, null));

        verify(internshipOfferDAO, never()).save(any());
    }

    @Test
    public void validationInternshipOfferAlreadyValidated() {
        // Arrange
        Long offerId = 3L;
        InternshipOffer existing = InternshipOffer.builder()
            .id(offerId)
            .validationStatus(VerificationStatus.APPROVED) // Déjà traitée
            .build();
        when(internshipOfferDAO.findInternshipOfferById(offerId)).thenReturn(existing);

        // Act & Assert
        try {
            internshipManagerService.verifyInternshipOffer(offerId, true, null);
            assertThat(false).isTrue();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).isEqualTo("This offer has already been validated");
        }

        verify(internshipOfferDAO, never()).save(any());
    }

    private List<InternshipOffer> getInformatiqueInternships() {
        return List.of(
            InternshipOffer.builder()
                .validationStatus(VerificationStatus.APPROVED)
                .jobTitle("Software Intern")
                .program("Informatique")
                .build(),
            InternshipOffer.builder()
                .validationStatus(VerificationStatus.PENDING)
                .jobTitle("Software Senior")
                .program("Informatique")
                .build(),
            InternshipOffer.builder()
                .validationStatus(VerificationStatus.APPROVED)
                .jobTitle("Software Senior")
                .program("Informatique")
                .build());
    }

    private List<Student> createTestStudents() {
        Student student1 = Student.builder()
            .firstName("Alice")
            .lastName("Johnson")
            .cvStatus(VerificationStatus.APPROVED)
            .cvUploadedAt(LocalDateTime.now().minusDays(2))
            .build();
        student1.setId(1L);

        Student student2 = Student.builder()
            .firstName("Bob")
            .lastName("Smith")
            .cvStatus(VerificationStatus.PENDING)
            .cvUploadedAt(LocalDateTime.now().minusDays(1))
            .build();
        student2.setId(2L);

        return List.of(student1, student2);
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Approbation")
    public void testVerifyResume_Approve() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);

        // Act
        internshipManagerService.verifyResume(studentId, true, null);

        // Assert
        assertThat(student.getResumeVerificationStatus()).isEqualTo(VerificationStatus.APPROVED);
        assertThat(student.getResumeVerifiedDate()).isNotNull();
        assertThat(student.getResumeRejectionReason()).isNull();
        verify(studentDAO, times(1)).save(student);
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Refus")
    public void testVerifyResume_Reject() {
        // Arrange
        Long studentId = 1L;
        String rejectionReason = "CV incomplet";
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);

        // Act
        internshipManagerService.verifyResume(studentId, false, rejectionReason);

        // Assert
        assertThat(student.getResumeVerificationStatus()).isEqualTo(VerificationStatus.REJECTED);
        assertThat(student.getResumeVerifiedDate()).isNotNull();
        assertThat(student.getResumeRejectionReason()).isEqualTo(rejectionReason);
        verify(studentDAO, times(1)).save(student);
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Étudiant non trouvé")
    public void testValidateStudentCV_StudentNotFound() {
        // Arrange
        Long studentId = 999L;
        when(studentDAO.findById(studentId)).thenReturn(Optional.empty());

        // Act & Assert
        try {
            internshipManagerService.verifyResume(studentId, true, null);
            assertThat(false).isTrue(); // Ne devrait pas arriver ici
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).isEqualTo("Étudiant non trouvé");
        }
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - CV déjà traité")
    public void testVerifyResume_AlreadyProcessed() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.APPROVED); // Déjà traité
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        // Act & Assert
        try {
            internshipManagerService.verifyResume(studentId, true, null);
            assertThat(false).isTrue(); // Ne devrait pas arriver ici
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).isEqualTo("Ce CV a déjà été traité");
        }
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Refus avec raison vide")
    public void testVerifyResume_RejectWithEmptyReason() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);

        // Act
        internshipManagerService.verifyResume(studentId, false, "");

        // Assert
        assertThat(student.getResumeVerificationStatus()).isEqualTo(VerificationStatus.REJECTED);
        assertThat(student.getResumeVerifiedDate()).isNotNull();
        assertThat(student.getResumeRejectionReason()).isEqualTo("");
        verify(studentDAO, times(1)).save(student);
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Approbation avec raison")
    public void testVerifyResume_ApproveWithReason() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setResumeVerificationStatus(VerificationStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);

        // Act
        internshipManagerService.verifyResume(studentId, true, "CV excellent");

        // Assert
        assertThat(student.getResumeVerificationStatus()).isEqualTo(VerificationStatus.APPROVED);
        assertThat(student.getResumeVerifiedDate()).isNotNull();
        assertThat(student.getResumeRejectionReason()).isNull(); // Doit être null pour approbation
        verify(studentDAO, times(1)).save(student);
    }
}