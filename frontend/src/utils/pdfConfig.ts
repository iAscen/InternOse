import { pdfjs } from 'react-pdf';

// Configuration globale pour PDF.js
export function configurePdfJs() {
    // Utiliser le worker fourni par react-pdf via CDN
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}
