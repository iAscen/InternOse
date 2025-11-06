package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.EmployerDAO;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentApplicationDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.service.DTOs.CreateInternshipContractDTO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.InternshipContractAlreadyExistsException;
import cal.ose.internose.service.exceptions.NoResumeUploadedException;
import cal.ose.internose.service.exceptions.ResumeAlreadyApprovedException;
import cal.ose.internose.service.exceptions.InternshipOfferNotAcceptedByStudentException;
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
    private final EmployerDAO employerDAO;

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

    public void createInternshipContract(CreateInternshipContractDTO createInternshipContractDTO) {
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
            .map(
            (internshipContract) ->
                InternshipContractDTO.builder()
                    .id(internshipContract.getId())
                    .tasks(internshipContract.getTasks())
                    .supervisorEmail(internshipContract.getSupervisorEmail())
                    .supervisorPhone(internshipContract.getSupervisorPhone())
                    .supervisorName(internshipContract.getSupervisorName())
                    .supervisorTitle(internshipContract.getSupervisorTitle())
                    .weeklyHours(internshipContract.getWeeklyHours())
                    .startDate(internshipContract.getStartDate())
                    .endDate(internshipContract.getEndDate())
                    .educationalObjectives(internshipContract.getEducationalObjectives())
                    .isSignedStudent(internshipContract.getIsSignedStudent())
                    .isSignedEmployer(internshipContract.getIsSignedEmployer())
                    .isSignedInternshipManager(internshipContract.getIsSignedInternshipManager())
                    .studentId(internshipContract.getStudent() != null ? internshipContract.getStudent().getId() : null)
                    .studentFirstName(internshipContract.getStudent() != null ? internshipContract.getStudent().getFirstName() : null)
                    .studentLastName(internshipContract.getStudent() != null ? internshipContract.getStudent().getLastName() : null)
                    .employerId(internshipContract.getEmployer() != null ? internshipContract.getEmployer().getId() : null)
                    .employerCompany(internshipContract.getEmployer() != null ? internshipContract.getEmployer().getCompany() : null)
                    .internshipOfferId(internshipContract.getInternshipOffer() != null ? internshipContract.getInternshipOffer().getId() : null)
                    .internshipOfferTitle(internshipContract.getInternshipOffer() != null ? internshipContract.getInternshipOffer().getTitle() : null)
                    .build()
        ).toList();
    }

    public InternshipContractDTO findContractByStudentAndOffer(Long studentId, Long internshipOfferId) {
        Student student = studentDAO.findById(studentId).orElseThrow();
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferId).orElseThrow();
        
        InternshipContract contract = internshipContractDAO.findByStudentAndInternshipOffer(student, internshipOffer)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé pour cet étudiant et cette offre"));
        
        return InternshipContractDTO.builder()
            .id(contract.getId())
            .tasks(contract.getTasks())
            .supervisorEmail(contract.getSupervisorEmail())
            .supervisorPhone(contract.getSupervisorPhone())
            .supervisorName(contract.getSupervisorName())
            .supervisorTitle(contract.getSupervisorTitle())
            .weeklyHours(contract.getWeeklyHours())
            .startDate(contract.getStartDate())
            .endDate(contract.getEndDate())
            .educationalObjectives(contract.getEducationalObjectives())
            .isSignedStudent(contract.getIsSignedStudent())
            .isSignedEmployer(contract.getIsSignedEmployer())
            .isSignedInternshipManager(contract.getIsSignedInternshipManager())
            .studentId(contract.getStudent() != null ? contract.getStudent().getId() : null)
            .studentFirstName(contract.getStudent() != null ? contract.getStudent().getFirstName() : null)
            .studentLastName(contract.getStudent() != null ? contract.getStudent().getLastName() : null)
            .employerId(contract.getEmployer() != null ? contract.getEmployer().getId() : null)
            .employerCompany(contract.getEmployer() != null ? contract.getEmployer().getCompany() : null)
            .internshipOfferId(contract.getInternshipOffer() != null ? contract.getInternshipOffer().getId() : null)
            .internshipOfferTitle(contract.getInternshipOffer() != null ? contract.getInternshipOffer().getTitle() : null)
            .build();
    }

    public InternshipContractDTO findContractByEmployerAndOffer(Long employerId, Long internshipOfferId, Long studentId) {
        // Vérifier que l'employeur existe
        employerDAO.findById(employerId).orElseThrow();
        InternshipOffer internshipOffer = internshipOfferDAO.findById(internshipOfferId).orElseThrow();
        Student student = studentDAO.findById(studentId).orElseThrow();
        
        InternshipContract contract = internshipContractDAO.findByStudentAndInternshipOffer(student, internshipOffer)
            .orElseThrow(() -> new NoSuchElementException("Contrat non trouvé pour cette offre et cet étudiant"));
        
        // Vérifier que l'employeur correspond bien au contrat
        if (contract.getEmployer() == null || !contract.getEmployer().getId().equals(employerId)) {
            throw new NoSuchElementException("Contrat non trouvé pour cet employeur");
        }
        
        return InternshipContractDTO.builder()
            .id(contract.getId())
            .tasks(contract.getTasks())
            .supervisorEmail(contract.getSupervisorEmail())
            .supervisorPhone(contract.getSupervisorPhone())
            .supervisorName(contract.getSupervisorName())
            .supervisorTitle(contract.getSupervisorTitle())
            .weeklyHours(contract.getWeeklyHours())
            .startDate(contract.getStartDate())
            .endDate(contract.getEndDate())
            .educationalObjectives(contract.getEducationalObjectives())
            .isSignedStudent(contract.getIsSignedStudent())
            .isSignedEmployer(contract.getIsSignedEmployer())
            .isSignedInternshipManager(contract.getIsSignedInternshipManager())
            .studentId(contract.getStudent() != null ? contract.getStudent().getId() : null)
            .studentFirstName(contract.getStudent() != null ? contract.getStudent().getFirstName() : null)
            .studentLastName(contract.getStudent() != null ? contract.getStudent().getLastName() : null)
            .employerId(contract.getEmployer() != null ? contract.getEmployer().getId() : null)
            .employerCompany(contract.getEmployer() != null ? contract.getEmployer().getCompany() : null)
            .internshipOfferId(contract.getInternshipOffer() != null ? contract.getInternshipOffer().getId() : null)
            .internshipOfferTitle(contract.getInternshipOffer() != null ? contract.getInternshipOffer().getTitle() : null)
            .build();
    }

}
