package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
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
        assertFalse(internshipOfferDTOS.getFirst().isValidee());
    }

    @Test
    void sortByDomain() {
        when(internshipOfferDAO.findInternshipsBy(null, null, null))
            .thenReturn(List.of(
                InternshipOffer.builder().program("Informatique").validationStatus(DocumentStatus.APPROVED)
                    .build(),
                InternshipOffer.builder().program("Biologie").validationStatus(DocumentStatus.APPROVED).build(),
                InternshipOffer.builder().program("Architecture").validationStatus(DocumentStatus.APPROVED)
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
            .validationStatus(DocumentStatus.PENDING)
            .build();
        when(internshipOfferDAO.findInternshipOfferById(offerId)).thenReturn(existing);

        internshipManagerService.validateInternshipOffer(offerId, true, "any comment should be ignored on approve");

        ArgumentCaptor<InternshipOffer> captor = ArgumentCaptor.forClass(InternshipOffer.class);
        verify(internshipOfferDAO, times(1)).save(captor.capture());
        InternshipOffer saved = captor.getValue();

        assertEquals(DocumentStatus.APPROVED, saved.getValidationStatus(), "Status must be 'approuvé' on approval");
        assertNull(saved.getRejectionReason(), "Rejection reason must be cleared on approval");
    }

    @Test
    void rejectInternshipOffer() {
        Long offerId = 2L;
        String rejectionComment = "Détails insufficient dans la description";
        InternshipOffer existing = InternshipOffer.builder()
            .id(offerId)
            .rejectionReason(null)
            .validationStatus(DocumentStatus.PENDING)
            .build();
        when(internshipOfferDAO.findInternshipOfferById(offerId)).thenReturn(existing);

        internshipManagerService.validateInternshipOffer(offerId, false, rejectionComment);

        ArgumentCaptor<InternshipOffer> captor = ArgumentCaptor.forClass(InternshipOffer.class);
        verify(internshipOfferDAO, times(1)).save(captor.capture());
        InternshipOffer saved = captor.getValue();

        assertTrue(saved.isValidee());
        assertEquals(DocumentStatus.REJECTED, saved.getValidationStatus());
        assertEquals(rejectionComment, saved.getRejectionReason());
    }

    @Test
    void validationInternshipOfferNotFound() {
        Long missingId = 999L;
        when(internshipOfferDAO.findInternshipOfferById(missingId)).thenReturn(null);

        assertThrows(ResourceNotFoundException.class,
            () -> internshipManagerService.validateInternshipOffer(missingId, true, null));

        verify(internshipOfferDAO, never()).save(any());
    }

    @Test
    public void validationInternshipOfferAlreadyValidated() {
        // Arrange
        Long offerId = 3L;
        InternshipOffer existing = InternshipOffer.builder()
            .id(offerId)
            .validationStatus(DocumentStatus.APPROVED) // Déjà traitée
            .build();
        when(internshipOfferDAO.findInternshipOfferById(offerId)).thenReturn(existing);

        // Act & Assert
        try {
            internshipManagerService.validateInternshipOffer(offerId, true, null);
            assertThat(false).isTrue();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).isEqualTo("This offer has already been validated");
        }

        verify(internshipOfferDAO, never()).save(any());
    }

    private List<InternshipOffer> getInformatiqueInternships() {
        return List.of(
            InternshipOffer.builder()
                .validationStatus(DocumentStatus.APPROVED)
                .jobTitle("Software Intern")
                .program("Informatique")
                .build(),
            InternshipOffer.builder()
                .validationStatus(DocumentStatus.PENDING)
                .jobTitle("Software Senior")
                .program("Informatique")
                .build(),
            InternshipOffer.builder()
                .validationStatus(DocumentStatus.APPROVED)
                .jobTitle("Software Senior")
                .program("Informatique")
                .build());
    }

    private List<Student> createTestStudents() {
        Student student1 = Student.builder()
            .firstName("Alice")
            .lastName("Johnson")
            .cvStatus(DocumentStatus.APPROVED)
            .cvUploadedAt(LocalDateTime.now().minusDays(2))
            .build();
        student1.setId(1L);

        Student student2 = Student.builder()
            .firstName("Bob")
            .lastName("Smith")
            .cvStatus(DocumentStatus.PENDING)
            .cvUploadedAt(LocalDateTime.now().minusDays(1))
            .build();
        student2.setId(2L);

        return List.of(student1, student2);
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Approbation")
    public void testValidateStudentCV_Approve() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setCvStatus(DocumentStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);

        // Act
        internshipManagerService.validateStudentCV(studentId, true, null);

        // Assert
        assertThat(student.getCvStatus()).isEqualTo(DocumentStatus.APPROVED);
        assertThat(student.getCvValidatedAt()).isNotNull();
        assertThat(student.getCvRejectionReason()).isNull();
        verify(studentDAO, times(1)).save(student);
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Refus")
    public void testValidateStudentCV_Reject() {
        // Arrange
        Long studentId = 1L;
        String rejectionReason = "CV incomplet";
        Student student = createTestStudents().get(0);
        student.setCvStatus(DocumentStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);

        // Act
        internshipManagerService.validateStudentCV(studentId, false, rejectionReason);

        // Assert
        assertThat(student.getCvStatus()).isEqualTo(DocumentStatus.REJECTED);
        assertThat(student.getCvValidatedAt()).isNotNull();
        assertThat(student.getCvRejectionReason()).isEqualTo(rejectionReason);
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
            internshipManagerService.validateStudentCV(studentId, true, null);
            assertThat(false).isTrue(); // Ne devrait pas arriver ici
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).isEqualTo("Étudiant non trouvé");
        }
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - L'etudiant n'a pas de CV")
    public void testValidateStudentCV_NoCV() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setCvStatus(DocumentStatus.NONE);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        // Act & Assert
        try {
            internshipManagerService.validateStudentCV(studentId, true, null);
            assertThat(false).isTrue();
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).isEqualTo("Cet etudiant n'a pas de CV");
        }
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - CV déjà traité")
    public void testValidateStudentCV_AlreadyProcessed() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setCvStatus(DocumentStatus.APPROVED); // Déjà traité
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        // Act & Assert
        try {
            internshipManagerService.validateStudentCV(studentId, true, null);
            assertThat(false).isTrue(); // Ne devrait pas arriver ici
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).isEqualTo("Ce CV a déjà été traité");
        }
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Refus avec raison vide")
    public void testValidateStudentCV_RejectWithEmptyReason() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setCvStatus(DocumentStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);

        // Act
        internshipManagerService.validateStudentCV(studentId, false, "");

        // Assert
        assertThat(student.getCvStatus()).isEqualTo(DocumentStatus.REJECTED);
        assertThat(student.getCvValidatedAt()).isNotNull();
        assertThat(student.getCvRejectionReason()).isEqualTo("");
        verify(studentDAO, times(1)).save(student);
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Approbation avec raison")
    public void testValidateStudentCV_ApproveWithReason() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().get(0);
        student.setCvStatus(DocumentStatus.PENDING);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));
        when(studentDAO.save(any(Student.class))).thenReturn(student);

        // Act
        internshipManagerService.validateStudentCV(studentId, true, "CV excellent");

        // Assert
        assertThat(student.getCvStatus()).isEqualTo(DocumentStatus.APPROVED);
        assertThat(student.getCvValidatedAt()).isNotNull();
        assertThat(student.getCvRejectionReason()).isNull(); // Doit être null pour approbation
        verify(studentDAO, times(1)).save(student);
    }
}