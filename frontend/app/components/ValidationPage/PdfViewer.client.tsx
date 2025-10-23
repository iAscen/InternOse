// app/components/ValidationPage/PdfViewer.client.tsx
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import '../../src/utils/pdfConfig';

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
    const [isReady, setIsReady] = useState(false);
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1); // optional zoom
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Désactiver le worker pour éviter les problèmes CORS/404
        pdfjs.GlobalWorkerOptions.workerSrc = '';
        console.log('PDF.js worker disabled in PdfViewer (development mode)');
        setIsReady(true);
    }, []);

    const onLoadError = (err: unknown) => {
        console.error('PDF load error:', err);
        setError('Erreur lors du chargement du PDF. Veuillez réessayer.');
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        // Ajouter un petit délai pour s'assurer que le worker est stable
        setTimeout(() => {
            setNumPages(numPages);
        }, 100);
    };

    if (!isReady) return null;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
                <div className="text-red-600 text-6xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur PDF</h3>
                <p className="text-red-700 text-center mb-4">{error}</p>
                <button 
                    onClick={() => {
                        setError(null);
                        setIsReady(false);
                        setTimeout(() => setIsReady(true), 100);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button className="text-black" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>-</button>
                <span className="text-black">Zoom: {(scale * 100).toFixed(0)}%</span>
                <button className="text-black" onClick={() => setScale(s => Math.min(3, s + 0.1))}>+</button>
            </div>

            <div style={{
                height: '80vh',
                width: '100%',
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 8,
            }}>
                <Document file={fileUrl} onLoadError={onLoadError} onLoadSuccess={onDocumentLoadSuccess}>
                    {numPages > 0 && Array.from({ length: numPages }, (_, i) => (
                        <Page
                            key={`page_${i + 1}`}
                            pageNumber={i + 1}
                            scale={scale}
                            renderTextLayer
                            renderAnnotationLayer
                            onLoadError={(error) => {
                                console.error(`Error loading page ${i + 1}:`, error);
                            }}
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
}