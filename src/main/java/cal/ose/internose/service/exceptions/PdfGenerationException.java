package cal.ose.internose.service.exceptions;

public class PdfGenerationException extends RuntimeException {
    public PdfGenerationException() {
        super("Erreur lors de la génération du PDF");
    }
}
