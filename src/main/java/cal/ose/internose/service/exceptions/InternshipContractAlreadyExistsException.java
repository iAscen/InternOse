package cal.ose.internose.service.exceptions;

public class InternshipContractAlreadyExistsException extends RuntimeException {
    public InternshipContractAlreadyExistsException() {
        super("Un contrat de stage existe déjà pour cet étudiant et cette offre.");
    }
}
