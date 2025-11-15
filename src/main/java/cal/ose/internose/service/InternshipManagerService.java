package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.*;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.ProfessorDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.InternshipContractAlreadyExistsException;
import cal.ose.internose.service.exceptions.InternshipOfferNotAcceptedByStudentException;
import cal.ose.internose.service.exceptions.NoResumeUploadedException;
import cal.ose.internose.service.exceptions.ResumeAlreadyApprovedException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
@AllArgsConstructor
public class InternshipManagerService {
    private final InternshipOfferDAO internshipOfferDAO;
    private final StudentDAO studentDAO;
    private final StudentApplicationDAO studentApplicationDAO;
    private final InternshipContractDAO internshipContractDAO;
    private final ProfessorDAO professorDAO;

    public List<InternshipOfferDTO> findInternshipsBy(Boolean isVerified, String program, String title, String sortBy) {
        String programPattern = program != null ? "%" + program + "%" : null;
        String titlePattern = title != null ? "%" + title + "%" : null;

        List<InternshipOffer> internshipOffers;
        if (isVerified == null) {
            // Récupérer toutes les offres
            if (programPattern == null && titlePattern == null) {
                // Si aucun filtre n'est appliqué, récupérer toutes les offres
                internshipOffers = internshipOfferDAO.findAll();
            } else {
                internshipOffers = internshipOfferDAO.findAllByProgramLikeAndTitleLike(programPattern, titlePattern);
            }
        } else {
            // Filtrer par statut
            if (programPattern == null && titlePattern == null) {
                // Si aucun filtre n'est appliqué, récupérer toutes les offres puis filtrer par statut
                internshipOffers = internshipOfferDAO.findAll();
            } else {
                internshipOffers = internshipOfferDAO.findAllByProgramLikeAndTitleLikeOrderByVerificationStatusAsc(
                    titlePattern, programPattern
                );
            }
        }

        if (!internshipOffers.isEmpty()) {
            if (sortBy != null && sortBy.equals("title")) {
                internshipOffers = internshipOffers.stream().sorted(
                    Comparator.comparing(InternshipOffer::getTitle, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                ).toList();
            } else if (sortBy != null && sortBy.equals("status")) {
                internshipOffers = internshipOffers.stream().sorted(
                    Comparator.comparing(InternshipOffer::getVerificationStatus)
                ).toList();
            } else {
                internshipOffers = internshipOffers.stream().sorted(
                    Comparator.comparing(InternshipOffer::getProgram, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                ).toList();
            }
        }

        return InternshipOfferDTO.fromEntityList(internshipOffers);
    }

    public InternshipOfferDTO verifyInternshipOffer(Long internshipOfferID, boolean approved, String rejectionReason)
        throws ResumeAlreadyApprovedException {
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferID).orElseThrow();
        if (internshipOffer.getVerificationStatus() != VerificationStatus.PENDING)
            throw new ResumeAlreadyApprovedException();

        if (approved) {
            internshipOffer.setVerificationStatus(VerificationStatus.APPROVED);
            internshipOffer.setRejectionReason(null);
        } else {
            internshipOffer.setVerificationStatus(VerificationStatus.REJECTED);
            internshipOffer.setRejectionReason(rejectionReason);
        }

        return InternshipOfferDTO.fromEntity(internshipOfferDAO.save(internshipOffer));
    }

    public StudentDTO verifyResume(Long id, boolean approved, String rejectionReason)
        throws NoResumeUploadedException, ResumeAlreadyApprovedException {
        Student student = studentDAO.findById(id).orElseThrow();
        if (student.getResumeVerificationStatus() == VerificationStatus.NONE)
            throw new NoResumeUploadedException();
        if (student.getResumeVerificationStatus() != VerificationStatus.PENDING)
            throw new ResumeAlreadyApprovedException();

        if (approved) {
            student.setResumeVerificationStatus(VerificationStatus.APPROVED);
            student.setResumeVerifiedDate(LocalDateTime.now());
            student.setResumeRejectionReason(null);
        } else {
            student.setResumeVerificationStatus(VerificationStatus.REJECTED);
            student.setResumeVerifiedDate(LocalDateTime.now());
            student.setResumeRejectionReason(rejectionReason);
        }

        return StudentDTO.fromEntity(studentDAO.save(student));
    }

    public void createInternshipContract(InternshipContractDTO createInternshipContractDTO) throws InternshipOfferNotAcceptedByStudentException, InternshipContractAlreadyExistsException {
        Student student = studentDAO.findById(createInternshipContractDTO.getStudentId()).orElseThrow();
        InternshipOffer internshipOffer = internshipOfferDAO.findById(createInternshipContractDTO.getInternshipOfferId()).orElseThrow();

        StudentApplication studentApplication = studentApplicationDAO.findByStudentAndInternshipOffer(student, internshipOffer)
            .orElseThrow();

        if (studentApplication.getApplicationStatus() != StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT) {
            throw new InternshipOfferNotAcceptedByStudentException();
        }

        if (internshipContractDAO.findByStudentAndInternshipOffer(student, internshipOffer).isPresent()) {
            throw new InternshipContractAlreadyExistsException();
        }

        InternshipContract internshipContract = InternshipContract.builder()
            .student(student)
            .internshipOffer(internshipOffer)
            .employer(internshipOffer.getEmployer())
            .startDate(createInternshipContractDTO.getStartDate())
            .endDate(createInternshipContractDTO.getEndDate())
            .weeklyHours(createInternshipContractDTO.getWeeklyHours())
            .tasks(createInternshipContractDTO.getTasks())
            .educationalObjectives(createInternshipContractDTO.getEducationalObjectives())
            .supervisorName(createInternshipContractDTO.getSupervisorName())
            .supervisorTitle(createInternshipContractDTO.getSupervisorTitle())
            .supervisorEmail(createInternshipContractDTO.getSupervisorEmail())
            .supervisorPhone(createInternshipContractDTO.getSupervisorPhone())
            .isSignedStudent(false)
            .isSignedEmployer(false)
            .isSignedInternshipManager(false)
            .build();

        studentApplication.setApplicationStatus(StudentApplication.ApplicationStatus.PENDING_CONTRACT);

        studentApplicationDAO.save(studentApplication);
        internshipContractDAO.save(internshipContract);
    }

    public List<InternshipContractDTO> findAllInternshipContracts() {
        List<InternshipContract> internshipContracts = internshipContractDAO.findAll();

        return internshipContracts.stream()
            .map(InternshipContractDTO::fromEntity)
            .toList();
    }

    public InternshipContractDTO signContract(Long contractId) {
        InternshipContract contract = internshipContractDAO.findById(contractId)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé"));
        
        // Vérifier que le contrat n'est pas déjà signé par le gestionnaire
        if (contract.getIsSignedInternshipManager()) {
            throw new IllegalStateException("Ce contrat a déjà été signé par le gestionnaire de stages");
        }
        
        // Vérifier que l'étudiant et l'employeur ont déjà signé
        // Le gestionnaire DOIT signer en dernier
        if (!contract.getIsSignedStudent()) {
            throw new IllegalStateException("Le gestionnaire de stages ne peut signer qu'après que l'étudiant ait signé l'entente");
        }
        
        if (!contract.getIsSignedEmployer()) {
            throw new IllegalStateException("Le gestionnaire de stages ne peut signer qu'après que l'employeur ait signé l'entente");
        }
        
        contract.setIsSignedInternshipManager(true);
        internshipContractDAO.save(contract);
        
        return InternshipContractDTO.fromEntity(contract);
    }

    public List<ProfessorDTO> findAllProfessors() {
        List<Professor> professors = professorDAO.findAll();
        return ProfessorDTO.fromEntityList(professors);
    }

    public StudentDTO assignProfessorToStudent(long studentID, Long professorID) {
        Student student = studentDAO.findById(studentID).orElseThrow();

        List<StudentApplication> confirmedStudentApplications = student.getStudentApplications()
            .stream().filter(studentApplication -> studentApplication.getApplicationStatus() == StudentApplication.ApplicationStatus.ACCEPTED_BY_STUDENT ||
                studentApplication.getApplicationStatus() == StudentApplication.ApplicationStatus.PENDING_CONTRACT)
            .toList();

        if (professorID != null && confirmedStudentApplications.isEmpty()) {
            throw new IllegalStateException("L’étudiant ne peut pas se voir attribuer un professeur sans un stage confirmé");
        }

        Professor professor = null;

        if (professorID != null) {
            professor = professorDAO.findById(professorID).orElseThrow();
        }

        student.setAssignedProfessor(professor);
        return StudentDTO.fromEntity(studentDAO.save(student));
    }
}
