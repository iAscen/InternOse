package cal.ose.internose.service;

import cal.ose.internose.modele.*;
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

@Service
@Transactional
@AllArgsConstructor
public class InternshipManagerService {
    private final InternshipOfferDAO internshipOfferDAO;
    private final StudentDAO studentDAO;
    private final StudentApplicationDAO studentApplicationDAO;
    private final InternshipContractDAO internshipContractDAO;

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

        // TODO Décider de garder ou enlever
//        byte[] internshipAgreementPDF = PdfGenerator.generateAgreementPdf(internshipContract);
//
//        internshipContract.setInternshipAgreementFileData(
//            internshipAgreementPDF
//        );

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
                    // TODO Décider de garder ou enlever
//                    .internshipAgreementFileData(internshipContract.getInternshipAgreementFileData())
                    .isSignedStudent(internshipContract.getIsSignedStudent())
                    .isSignedEmployer(internshipContract.getIsSignedEmployer())
                    .isSignedInternshipManager(internshipContract.getIsSignedInternshipManager())
                    .build()
        ).toList();
    }
    // TODO Décider de garder ou enlever
//    public InternshipContractDTO findInternshipContractByID(Long id) {
//        InternshipContract internshipContract = internshipContractDAO.findById(id).orElseThrow();
//        return InternshipContractDTO.fromEntity(internshipContract);
//    }

}
