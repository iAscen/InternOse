import { pdfjs } from 'react-pdf';

export function setupPdfWorker() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
        console.log('Setting up PDF.js worker...');

        // Utiliser le worker fourni par react-pdf via CDN
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    }
}

if (typeof window !== 'undefined') {
    setupPdfWorker();
}