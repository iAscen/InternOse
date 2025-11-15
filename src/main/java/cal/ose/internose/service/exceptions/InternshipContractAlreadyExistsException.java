package cal.ose.internose.service.exceptions;

public class InternshipContractAlreadyExistsException extends Exception {
    public InternshipContractAlreadyExistsException() {
        super("Un contrat de stage existe déjà pour cet étudiant et cette offre de stage.");
    }
}
