package cal.ose.internose.service.exceptions;

public class NoResumeUploadedException extends Exception {
    public NoResumeUploadedException() {
        super("Cet.te étudiant.e n'a pas encore téléversé.e son CV.");
    }
}
