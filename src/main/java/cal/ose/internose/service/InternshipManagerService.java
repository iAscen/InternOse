package cal.ose.internose.service;

import cal.ose.internose.modele.DocumentStatus;
import cal.ose.internose.modele.InternshipOffer;
import cal.ose.internose.modele.Student;
import cal.ose.internose.persistance.InternshipOfferDAO;
import cal.ose.internose.persistance.StudentDAO;
import cal.ose.internose.security.exception.ResourceNotFoundException;
import cal.ose.internose.service.DTOs.InternshipOfferDTO;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;


@Service
@AllArgsConstructor
public class InternshipManagerService {
    private InternshipOfferDAO internshipOfferDAO;
    private final StudentDAO studentDAO;

    public List<InternshipOfferDTO> findInternshipsBy(String domain, Boolean valid, String title, String sortBy) {
        // Ajouter les wildcards pour la recherche LIKE
        String domainPattern = domain != null ? "%" + domain + "%" : null;
        String titlePattern = title != null ? "%" + title + "%" : null;
        
        List<InternshipOffer> internshipOffers = internshipOfferDAO.findInternshipsBy(domainPattern, valid, titlePattern);

        if (!internshipOffers.isEmpty()) {
            if (sortBy != null && sortBy.equals("title")) {
                internshipOffers = internshipOffers.stream()
                        .sorted(Comparator.comparing(InternshipOffer::getJobTitle, 
                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                        .toList();
            } else if (sortBy != null && sortBy.equals("status")) {
                internshipOffers = internshipOffers.stream()
                        .sorted(Comparator.comparing(InternshipOffer::isValidee))
                        .toList();
            } else {
                internshipOffers = internshipOffers.stream()
                        .sorted(Comparator.comparing(InternshipOffer::getDomain, 
                                Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                        .toList();
            }
        }

        return InternshipOfferDTO.fromEntityList(internshipOffers);
    }

    public InternshipOffer getInternshipOfferById(Long id) {
        InternshipOffer offer = internshipOfferDAO.findInternshipOfferById(id);
        if (offer == null) {
            throw new ResourceNotFoundException("Internship Offer not found");
        }
        return offer;
    }

    public void validateInternshipOffer(Long id, boolean approuve, String commentaire) {

        InternshipOffer offer = getInternshipOfferById(id);

        offer.setValidee(true);
        if (!approuve) {
            offer.setRejectionReason(commentaire);
            offer.setValidationStatus(DocumentStatus.REJECTED);
        }
        else {
            offer.setValidationStatus(DocumentStatus.APPROVED);
            offer.setRejectionReason(null);
        }

        internshipOfferDAO.save(offer);
    }


    public void validateStudentCV(Long studentId, Boolean approved, String reason) {
        Student student = studentDAO.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));

        if (student.getCvStatus() != DocumentStatus.PENDING) {
            throw new RuntimeException("Ce CV a déjà été traité");
        }

        if (approved) {
            student.setCvStatus(DocumentStatus.APPROVED);
            student.setCvValidatedAt(LocalDateTime.now());
            student.setCvRejectionReason(null);
        } else {
            student.setCvStatus(DocumentStatus.REJECTED);
            student.setCvValidatedAt(LocalDateTime.now());
            student.setCvRejectionReason(reason);
        }

        studentDAO.save(student);
    }
}
