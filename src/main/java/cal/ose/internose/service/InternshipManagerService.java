package cal.ose.internose.service;

import cal.ose.internose.modele.VerificationStatus;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.security.exceptions.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
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

    public List<InternshipOfferDTO> findInternshipsBy(Boolean verified, String program, String title, String sortBy) {
        String programPattern = program != null ? "%" + program + "%" : null;
        String titlePattern = title != null ? "%" + title + "%" : null;

        List<InternshipOffer> internshipOffers;
        if (verified == null) {
            // Récupérer toutes les offres
            internshipOffers = internshipOfferDAO.findAllInternshipsBy(programPattern, titlePattern);
        } else {
            // Filtrer par statut
            internshipOffers = internshipOfferDAO.findInternshipsBy(verified, programPattern, titlePattern);
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

    public void verifyInternshipOffer(Long id, boolean approved, String reason) throws ResourceNotFoundException {
        InternshipOffer internshipOffer = internshipOfferDAO.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Internship offer not found"));

        // Check if the offer has already been processed
        if (internshipOffer.getVerificationStatus() != VerificationStatus.PENDING) {
            throw new RuntimeException("This offer has already been validated");
        }

        if (approved) {
            internshipOffer.setVerificationStatus(VerificationStatus.APPROVED);
            internshipOffer.setRejectionReason(null);
        } else {
            internshipOffer.setRejectionReason(reason);
            internshipOffer.setVerificationStatus(VerificationStatus.REJECTED);
        }

        internshipOfferDAO.save(internshipOffer);
    }

    public void verifyResume(Long id, boolean approved, String reason) {
        Student student = studentDAO.findById(id)
            .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));

        // Check if the student has no CV
        if (student.getResumeVerificationStatus() == VerificationStatus.NONE) {
            throw new RuntimeException("Cet etudiant n'a pas de CV");
        }

        // Check if the resume has already been processed
        if (student.getResumeVerificationStatus() != VerificationStatus.PENDING) {
            throw new RuntimeException("Ce CV a déjà été traité");
        }

        if (approved) {
            student.setResumeVerificationStatus(VerificationStatus.APPROVED);
            student.setResumeVerifiedDate(LocalDateTime.now());
            student.setResumeRejectionReason(null);
        } else {
            student.setResumeVerificationStatus(VerificationStatus.REJECTED);
            student.setResumeVerifiedDate(LocalDateTime.now());
            student.setResumeRejectionReason(reason);
        }

        studentDAO.save(student);
    }
}
