import { pdfjs } from 'react-pdf';

export function setupPdfWorker() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
        console.log('Setting up PDF.js worker...');

        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

    }
}

if (typeof window !== 'undefined') {
    setupPdfWorker();
}