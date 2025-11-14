package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.exceptions.InternshipContractAlreadyExistsException;
import cal.ose.internose.service.exceptions.InternshipOfferNotAcceptedByStudentException;
import cal.ose.internose.service.exceptions.NoResumeUploadedException;
import cal.ose.internose.service.exceptions.ResumeAlreadyApprovedException;
import cal.ose.internose.utilities.SessionUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InternshipManagerServiceTest {
    @Mock
    private StudentApplicationDAO studentApplicationDAO;
    @Mock
    private InternshipContractDAO internshipContractDAO;
    @Mock
    private InternshipOfferDAO internshipOfferDAO;
    @Mock
    private StudentDAO studentDAO;
    @InjectMocks
    private InternshipManagerService internshipManagerService;

    @Test
    void findInternshipsBy() {
        when(internshipOfferDAO.findAllByProgramLikeAndTitleLikeAndSessionLike("%Informatique%", "%", "%"))
            .thenReturn(getInformatiqueInternships());

        List<InternshipOfferDTO> internshipOfferDTOS = internshipManagerService
            .findInternshipsBy(null, "Informatique", null, null, "status");

        assertEquals(3, internshipOfferDTOS.size());
        assertEquals("Informatique", internshipOfferDTOS.getFirst().getProgram());
        assertFalse(internshipOfferDTOS.getFirst().isVerified());
    }

    @Test
    void sortByDomain() {
        when(internshipOfferDAO.findAllByProgramLikeAndTitleLikeAndSessionLike("%", "%", "%"))
            .thenReturn(List.of(
                InternshipOffer.builder().program("Informatique").verificationStatus(VerificationStatus.APPROVED)
                    .build(),
                InternshipOffer.builder().program("Biologie").verificationStatus(VerificationStatus.APPROVED).build(),
                InternshipOffer.builder().program("Architecture").verificationStatus(VerificationStatus.APPROVED)
                    .build()));

        List<InternshipOfferDTO> result = internshipManagerService
            .findInternshipsBy(null, null, null, null, null);

        assertEquals(3, result.size());
        assertEquals("Architecture", result.get(0).getProgram());
        assertEquals("Biologie", result.get(1).getProgram());
        assertEquals("Informatique", result.get(2).getProgram());
    }

    @Test
    void findInternshipsByNothingFound() {
        when(internshipOfferDAO.findAllByProgramLikeAndTitleLikeAndSessionLike("%non%", "%", "%"))
            .thenReturn(List.of());

        List<InternshipOfferDTO> internshipOfferDTOS = internshipManagerService
            .findInternshipsBy(null, "non", null, null,null);

        assertEquals(0, internshipOfferDTOS.size());
    }

    @Test
    void approveInternshipOffer() throws ResumeAlreadyApprovedException {
        Long offerId = 1L;
        InternshipOffer existing = InternshipOffer.builder()
            .id(offerId)
            .verificationStatus(VerificationStatus.PENDING)
            .build();
        InternshipOffer savedOffer = InternshipOffer.builder()
            .id(offerId)
            .verificationStatus(VerificationStatus.APPROVED)
            .rejectionReason(null)
            .build();

        when(internshipOfferDAO.findById(offerId)).thenReturn(Optional.of(existing));
        when(internshipOfferDAO.save(any(InternshipOffer.class))).thenReturn(savedOffer);

        internshipManagerService.verifyInternshipOffer(offerId, true, "any comment should be ignored on approve");

        ArgumentCaptor<InternshipOffer> captor = ArgumentCaptor.forClass(InternshipOffer.class);
        verify(internshipOfferDAO, times(1)).save(captor.capture());
        InternshipOffer saved = captor.getValue();

        assertEquals(VerificationStatus.APPROVED, saved.getVerificationStatus(), "Status must be 'approuvé' on approval");
        assertNull(saved.getRejectionReason(), "Rejection reason must be cleared on approval");
    }

    @Test
    void rejectInternshipOffer() throws ResumeAlreadyApprovedException {
        Long offerId = 2L;
        String rejectionComment = "Détails insufficient dans la description";
        InternshipOffer existing = InternshipOffer.builder()
            .id(offerId)
            .rejectionReason(null)
            .verificationStatus(VerificationStatus.PENDING)
            .build();
        InternshipOffer savedOffer = InternshipOffer.builder()
            .id(offerId)
            .verificationStatus(VerificationStatus.REJECTED)
            .rejectionReason(rejectionComment)
            .build();

        when(internshipOfferDAO.findById(offerId)).thenReturn(Optional.of(existing));
        when(internshipOfferDAO.save(any(InternshipOffer.class))).thenReturn(savedOffer);

        internshipManagerService.verifyInternshipOffer(offerId, false, rejectionComment);

        ArgumentCaptor<InternshipOffer> captor = ArgumentCaptor.forClass(InternshipOffer.class);
        verify(internshipOfferDAO, times(1)).save(captor.capture());
        InternshipOffer saved = captor.getValue();

        assertNotSame(VerificationStatus.PENDING, saved.getVerificationStatus());
        assertEquals(VerificationStatus.REJECTED, saved.getVerificationStatus());
        assertEquals(rejectionComment, saved.getRejectionReason());
    }

    @Test
    void validationInternshipOfferNotFound() {
        Long missingId = 999L;
        when(internshipOfferDAO.findById(missingId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
            () -> internshipManagerService.verifyInternshipOffer(missingId, true, null));

        verify(internshipOfferDAO, never()).save(any());
    }

    @Test
    public void validationInternshipOfferAlreadyValidated() {
        // Arrange
        Long offerId = 3L;
        InternshipOffer existing = InternshipOffer.builder()
            .id(offerId)
            .verificationStatus(VerificationStatus.APPROVED) // Déjà traitée
            .build();
        when(internshipOfferDAO.findById(offerId)).thenReturn(Optional.of(existing));

        // Act & Assert
        try {
            internshipManagerService.verifyInternshipOffer(offerId, true, null);
            assertThat(false).isTrue();
        } catch (RuntimeException | ResumeAlreadyApprovedException e) {
            assertThat(e.getMessage()).isEqualTo("Ce CV est déjà vérifié.");
        }

        verify(internshipOfferDAO, never()).save(any());
    }

    private List<InternshipOffer> getInformatiqueInternships() {
        return List.of(
            InternshipOffer.builder()
                .verificationStatus(VerificationStatus.APPROVED)
                .title("Software Intern")
                .program("Informatique")
                .build(),
            InternshipOffer.builder()
                .verificationStatus(VerificationStatus.PENDING)
                .title("Software Senior")
                .program("Informatique")
                .build(),
            InternshipOffer.builder()
                .verificationStatus(VerificationStatus.APPROVED)
                .title("Software Senior")
                .program("Informatique")
                .build());
    }

    // java
    private List<Student> createTestStudents() {
        var cred1 = cal.ose.internose.modele.Credentials.builder()
            .email("alice@example.com")
            .build();

        var cred2 = cal.ose.internose.modele.Credentials.builder()
            .email("bob@example.com")
            .build();

        Student student1 = Student.builder()
            .firstName("Alice")
            .lastName("Johnson")
            .credentials(cred1)
            .resumeVerificationStatus(VerificationStatus.APPROVED)
            .resumeUploadDate(LocalDateTime.now().minusDays(2))
            .build();
        student1.setId(1L);

        Student student2 = Student.builder()
            .firstName("Bob")
            .lastName("Smith")
            .credentials(cred2)
            .resumeVerificationStatus(VerificationStatus.PENDING)
            .resumeUploadDate(LocalDateTime.now().minusDays(1))
            .build();
        student2.setId(2L);

        return List.of(student1, student2);
    }


    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Approbation")
    public void testVerifyResume_Approve() throws ResumeAlreadyApprovedException, NoResumeUploadedException {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().getFirst();
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
    public void testVerifyResume_Reject() throws ResumeAlreadyApprovedException, NoResumeUploadedException {
        // Arrange
        Long studentId = 1L;
        String rejectionReason = "CV incomplet";
        Student student = createTestStudents().getFirst();
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
        } catch (NoSuchElementException e) {
            assertThat(e.getMessage()).isEqualTo("No value present");
        } catch (NoResumeUploadedException e) {
            assertThat(e.getMessage()).isEqualTo("Cet.te étudiant.e n'a pas encore téléversé.e son CV.");
        } catch (ResumeAlreadyApprovedException e) {
            assertThat(e.getMessage()).isEqualTo("Ce CV est déjà vérifié.");
        } catch (RuntimeException e) {
            assertThat(e.getMessage()).isEqualTo("Étudiant non trouvé");
        }
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - L'etudiant n'a pas de CV")
    public void testValidateStudentCV_NoCV() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().getFirst();
        student.setResumeVerificationStatus(VerificationStatus.NONE);
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        // Act & Assert
        try {
            internshipManagerService.verifyResume(studentId, true, null);
            assertThat(false).isTrue();
        } catch (RuntimeException | NoResumeUploadedException | ResumeAlreadyApprovedException e) {
            assertThat(e.getMessage()).isEqualTo("Cet.te étudiant.e n'a pas encore téléversé.e son CV.");
        }
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - CV déjà traité")
    public void testVerifyResume_AlreadyProcessed() {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().getFirst();
        student.setResumeVerificationStatus(VerificationStatus.APPROVED); // Déjà traité
        when(studentDAO.findById(studentId)).thenReturn(Optional.of(student));

        // Act & Assert
        try {
            internshipManagerService.verifyResume(studentId, true, null);
            assertThat(false).isTrue(); // Ne devrait pas arriver ici
        } catch (RuntimeException | NoResumeUploadedException | ResumeAlreadyApprovedException e) {
            assertThat(e.getMessage()).isEqualTo("Ce CV est déjà vérifié.");
        }
    }

    @Test
    @DisplayName("Test de la méthode validateStudentCV() - Refus avec raison vide")
    public void testVerifyResume_RejectWithEmptyReason() throws ResumeAlreadyApprovedException, NoResumeUploadedException {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().getFirst();
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
    public void testVerifyResume_ApproveWithReason() throws ResumeAlreadyApprovedException, NoResumeUploadedException {
        // Arrange
        Long studentId = 1L;
        Student student = createTestStudents().getFirst();
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

    @Test
    @DisplayName("Test de la methode createInternshipContract() - Offre de stage non-acceptee")
    public void testCreateInternshipContract_OffreDeStageNonAcceptee() {
        //Arrange
        InternshipOffer internshipOffer = new InternshipOffer();
        internshipOffer.setSession(SessionUtil.getCurrentSession());
        Student student = new Student();

        InternshipContractDTO createInternshipContractDTO =
            InternshipContractDTO.builder()
                .internshipOfferId(1L)
                .studentId(1L)
                .build();

        when(studentDAO.findById(1L)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(1L)).thenReturn(Optional.of(internshipOffer));
        when(studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer))
            .thenReturn(Optional.ofNullable(StudentApplication.builder().applicationStatus(StudentApplication.ApplicationStatus.APPROVED).build()));

        // Act && Assert
        assertThrows(InternshipOfferNotAcceptedByStudentException.class, () -> internshipManagerService.createInternshipContract(createInternshipContractDTO));
    }

    @Test
    @DisplayName("Test de la methode createInternshipContract() - Contrat existe deja")
    public void testCreateInternshipContract_ContractAlreadyExists() {
        //Arrange
        InternshipOffer internshipOffer = new InternshipOffer();
        internshipOffer.setSession(SessionUtil.getCurrentSession());
        Student student = new Student();

        InternshipContractDTO createInternshipContractDTO =
            InternshipContractDTO.builder()
                .internshipOfferId(1L)
                .studentId(1L)
                .build();

        when(studentDAO.findById(1L)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(1L)).thenReturn(Optional.of(internshipOffer));
        when(studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer))
            .thenReturn(Optional.ofNullable(StudentApplication.builder().applicationStatus(StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT).build()));

        when(internshipContractDAO.findByStudentAndInternshipOffer(any(), any())).thenThrow(InternshipContractAlreadyExistsException.class);
        // Act && Assert
        assertThrows(InternshipContractAlreadyExistsException.class, () -> internshipManagerService.createInternshipContract(createInternshipContractDTO));
    }

    @Test
    @DisplayName("Test de la methode createInternshipContract() - Execution normale")
    void testCreateInternshipContract_NormalExecution() {
        // Arrange
        InternshipContractDTO dto = InternshipContractDTO.builder()
            .studentId(1L)
            .internshipOfferId(1L)
            .startDate(LocalDate.of(2026, 1, 15))
            .endDate(LocalDate.of(2026, 4, 15))
            .weeklyHours(35)
            .tasks("Développement")
            .educationalObjectives("Appliquer les connaissances")
            .supervisorName("Jean Tremblay")
            .supervisorTitle("Team Lead")
            .supervisorEmail("jean@company.com")
            .supervisorPhone("514-555-1234")
            .build();

        Student student = new Student();
        student.setFirstName("Jean");
        student.setLastName("Tremblay");

        InternshipOffer offer = new InternshipOffer();
        offer.setSession(SessionUtil.getCurrentSession());
        offer.setTitle("Software Dev");

        Employer employer = Employer.builder()
            .company("RD")
            .build();

        offer.setEmployer(employer);

        StudentApplication application = new StudentApplication();
        application.setApplicationStatus(StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT);

        when(studentDAO.findById(1L)).thenReturn(Optional.of(student));
        when(internshipOfferDAO.findById(1L)).thenReturn(Optional.of(offer));
        when(studentApplicationDAO.findByStudentAndInternshipOffer(student, offer))
            .thenReturn(Optional.of(application));
        when(internshipContractDAO.findByStudentAndInternshipOffer(student, offer))
            .thenReturn(Optional.empty());

        // Act
        internshipManagerService.createInternshipContract(dto);

        // Assert
        ArgumentCaptor<InternshipContract> contractCaptor = ArgumentCaptor.forClass(InternshipContract.class);
        verify(internshipContractDAO).save(contractCaptor.capture());

        InternshipContract savedContract = contractCaptor.getValue();
        assertEquals(student, savedContract.getStudent());
        assertNotNull(savedContract.getInternshipOffer());
        assertEquals("Software Dev", savedContract.getInternshipOffer().getTitle());

        // Vérifier que le statut de l'application passe à PENDING_CONTRACT
        verify(studentApplicationDAO).save(any(StudentApplication.class));
        assertEquals(StudentApplication.ApplicationStatus.PENDING_CONTRACT, application.getApplicationStatus());
    }

    @Test
    @DisplayName("Test de la methode findAllInternshipContracts()")
    public void testFindAllInternshipContracts() {
        //Arrange
        InternshipContract internshipContract1 = InternshipContract.builder()
            .id(1L)
            .build();

        InternshipContract internshipContract2 = InternshipContract.builder()
            .id(2L)
            .build();

        when(internshipContractDAO.findAll()).thenReturn(
            List.of(
                internshipContract1, internshipContract2
            )
        );

        //Act
        List<InternshipContractDTO> internshipContractDTOS = internshipManagerService.findAllInternshipContracts();

        //Assert
        assertEquals(2, internshipContractDTOS.size());
        assertEquals(1L, internshipContractDTOS.getFirst().getId());
    }

    @Test
    @DisplayName("Test de la methode signContract() - Execution normale")
    void testSignContract_NormalExecution() {
        // Arrange
        Long contractId = 1L;
        InternshipContract contract = InternshipContract.builder()
            .id(contractId)
            .isSignedStudent(true)
            .isSignedEmployer(true)
            .isSignedInternshipManager(false) // Pas encore signé par le gestionnaire
            .startDate(LocalDate.of(2026, 1, 15))
            .endDate(LocalDate.of(2026, 4, 15))
            .weeklyHours(35)
            .tasks("Développement")
            .educationalObjectives("Appliquer les connaissances")
            .supervisorName("Jean Tremblay")
            .supervisorTitle("Team Lead")
            .supervisorEmail("jean@company.com")
            .supervisorPhone("514-555-1234")
            .build();

        Student student = new Student();
        student.setId(1L);
        student.setFirstName("Jean");
        student.setLastName("Tremblay");
        contract.setStudent(student);

        InternshipOffer offer = new InternshipOffer();
        offer.setId(1L);
        offer.setTitle("Software Dev");
        contract.setInternshipOffer(offer);

        Employer employer = Employer.builder()
            .id(1L)
            .company("RD")
            .build();
        contract.setEmployer(employer);

        when(internshipContractDAO.findById(contractId)).thenReturn(Optional.of(contract));
        when(internshipContractDAO.save(any(InternshipContract.class))).thenReturn(contract);

        // Act
        InternshipContractDTO result = internshipManagerService.signContract(contractId);

        // Assert
        assertNotNull(result);
        assertEquals(contractId, result.getId());
        assertTrue(result.getIsSignedInternshipManager());
        verify(internshipContractDAO, times(1)).findById(contractId);
        verify(internshipContractDAO, times(1)).save(contract);
    }

    @Test
    @DisplayName("Test de la methode signContract() - Contrat non trouve")
    void testSignContract_ContractNotFound() {
        // Arrange
        Long contractId = 999L;
        when(internshipContractDAO.findById(contractId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(NoSuchElementException.class, () -> internshipManagerService.signContract(contractId));
        verify(internshipContractDAO, times(1)).findById(contractId);
        verify(internshipContractDAO, never()).save(any());
    }

    @Test
    @DisplayName("Test de la methode signContract() - Contrat deja signe")
    void testSignContract_AlreadySigned() {
        // Arrange
        Long contractId = 1L;
        InternshipContract contract = InternshipContract.builder()
            .id(contractId)
            .isSignedInternshipManager(true) // Déjà signé
            .build();

        when(internshipContractDAO.findById(contractId)).thenReturn(Optional.of(contract));

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class,
            () -> internshipManagerService.signContract(contractId));
        assertEquals("Ce contrat a déjà été signé par le gestionnaire de stages", exception.getMessage());
        verify(internshipContractDAO, times(1)).findById(contractId);
        verify(internshipContractDAO, never()).save(any());
    }
}