package cal.ose.internose.service.exceptions;

public class ResumeAlreadyApprovedException extends Exception {
    public ResumeAlreadyApprovedException() {
        super("Ce CV est déjà vérifié.");
    }
}
