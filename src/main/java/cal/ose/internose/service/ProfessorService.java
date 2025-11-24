package cal.ose.internose.service;

import cal.ose.internose.modele.*;
import cal.ose.internose.persistance.InternAssessmentDAO;
import cal.ose.internose.persistance.InternshipContractDAO;
import cal.ose.internose.persistance.ProfessorDAO;
import cal.ose.internose.service.DTOs.InternAssessmentDTO;
import cal.ose.internose.service.DTOs.InternshipContractDTO;
import cal.ose.internose.utilities.SessionUtil;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.crossstore.ChangeSetPersister;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
@AllArgsConstructor
public class ProfessorService {
    private final InternshipContractDAO internshipContractDAO;
    private final ProfessorDAO professorDAO;
    private final InternAssessmentDAO internAssessmentDAO;

    public List<InternshipContractDTO> findInternshipContractsBy(long professorId, String studentName, String company, String internshipProgram, String sortBy) {
        Professor professor = professorDAO.findById(professorId).orElseThrow();
        String currentSession = SessionUtil.getCurrentSession();

        String studentNameFilter = studentName == null ? null : "%" + studentName + "%";
        String companyFilter = company == null ? null : "%" + company + "%";
        String internshipProgramFilter = internshipProgram == null ? null : "%" + internshipProgram + "%";

        List<InternshipContract> internshipContracts = internshipContractDAO
                .findAllByProfessorWithOptionalFilters(professor, currentSession, studentNameFilter, companyFilter, internshipProgramFilter);

        sortBy = sortBy.toLowerCase();
        if (sortBy.equals("student")) {
            internshipContracts = internshipContracts.stream().sorted(Comparator.comparing(
                (internshipContract -> {
                    Student student = internshipContract.getStudent();
                    if (student == null) {
                        return "";
                    } else {
                        return student.getFirstName() + " " + student.getLastName();
                    }
                })
            )).toList();
        } else if (sortBy.equals("company")) {
            internshipContracts = internshipContracts.stream().sorted(Comparator.comparing(
                (internshipContract -> {
                    Employer employer = internshipContract.getEmployer();
                    if (employer == null) {
                        return "";
                    } else {
                        return employer.getCompany();
                    }
                })
            )).toList();
        } else {
            internshipContracts = internshipContracts.stream().sorted(Comparator.comparing(
                (internshipContract -> {
                    InternshipOffer internshipOffer =  internshipContract.getInternshipOffer();
                    if (internshipOffer == null) {
                        return "";
                    } else {
                        return internshipOffer.getProgram();
                    }
                })
            )).toList();
        }

        return internshipContracts.stream().map(InternshipContractDTO::fromEntity).toList();
    }

    public InternAssessmentDTO findInternshipAssessment(long contractId) {
        InternshipContract internshipContract =  internshipContractDAO.findById(contractId).orElseThrow();
        InternAssessment internAssessment = internAssessmentDAO.findByInternshipContract(internshipContract);

        if (internAssessment == null) {
            throw new NoSuchElementException();
        }

        return InternAssessmentDTO.fromEntity(internAssessment);
    }
}
