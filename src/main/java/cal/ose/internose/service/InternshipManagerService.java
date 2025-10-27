package cal.ose.internose.service;

import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import cal.ose.internose.service.DTOs.StudentDTO;
import cal.ose.internose.service.exceptions.NoResumeUploadedException;
import cal.ose.internose.service.exceptions.ResumeAlreadyApprovedException;
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

    public List<InternshipOfferDTO> findInternshipsBy(Boolean isVerified, String program, String title, String sortBy) {
        String programPattern = program != null ? "%" + program + "%" : null;
        String titlePattern = title != null ? "%" + title + "%" : null;

        List<InternshipOffer> internshipOffers;
        if (isVerified == null) {
            // Récupérer toutes les offres
            internshipOffers = internshipOfferDAO.findAllInternshipsBy(programPattern, titlePattern);
        } else {
            // Filtrer par statut
            internshipOffers = internshipOfferDAO.findInternshipsBy(isVerified, programPattern, titlePattern);
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

    public InternshipOfferDTO verifyInternshipOffer(Long studentID, boolean approved, String rejectionReason)
        throws ResumeAlreadyApprovedException {
        InternshipOffer internshipOffer = internshipOfferDAO.findById(studentID).orElseThrow();
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
}
