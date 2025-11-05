package cal.ose.internose.utilities;

import cal.ose.internose.modele.InternshipContract;
import cal.ose.internose.service.exceptions.PdfGenerationException;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

public class PdfGenerator {

    public static byte[] generateAgreementPdf(InternshipContract contract) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            document.add(new Paragraph("Entente de stage").setBold().setFontSize(18));
            document.add(new Paragraph("Étudiant: " + contract.getStudent().getFirstName() + " " + contract.getStudent().getLastName()));
            document.add(new Paragraph("Employeur: " + contract.getEmployer().getCompany()));
            document.add(new Paragraph("Offre de stage: " + contract.getInternshipOffer().getTitle()));
            document.add(new Paragraph("Période: " +
                contract.getStartDate().format(formatter) + " - " +
                contract.getEndDate().format(formatter)));
            document.add(new Paragraph("Tâches: " + contract.getTasks()));
            document.add(new Paragraph("Objectifs éducatifs: " + contract.getEducationalObjectives()));
            document.add(new Paragraph("Superviseur: " + contract.getSupervisorName() + " (" + contract.getSupervisorTitle() + ")"));

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new PdfGenerationException();
        }
    }
}
