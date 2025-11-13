import { useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { setupPdfWorker } from '../setupPdf';

interface PdfViewerProps {
    fileUrl: string;
    onCleanup?: () => void;
}

export default function PdfViewer({ fileUrl, onCleanup }: PdfViewerProps) {
    const [isReady, setIsReady] = useState(false);
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1); // optional zoom
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Utiliser le worker fourni par react-pdf via CDN
        setupPdfWorker();
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
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
                <div className="flex items-center gap-2">
                    <button
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm"
                        onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                    >
                        -
                    </button>
                    <span className="text-sm text-gray-700 min-w-[80px] text-center">
                        {(scale * 100).toFixed(0)}%
                    </span>
                    <button
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm"
                        onClick={() => setScale(s => Math.min(3, s + 0.1))}
                    >
                        +
                    </button>
                </div>

                {numPages > 0 && (
                    <span className="text-sm text-gray-600">
                        {numPages} page{numPages > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <div className="flex-1 overflow-auto bg-gray-100 p-4">
                <Document file={fileUrl} onLoadError={onLoadError} onLoadSuccess={onDocumentLoadSuccess}>
                    {numPages > 0 && Array.from({ length: numPages }, (_, i) => (
                        <div key={`page_${i + 1}`} className="mb-4 shadow-lg">
                            <Page
                                pageNumber={i + 1}
                                scale={scale}
                                renderTextLayer
                                renderAnnotationLayer
                                className="border border-gray-300"
                                onLoadError={(error) => {
                                    console.error(`Error loading page ${i + 1}:`, error);
                                }}
                            />
                        </div>
                    ))}
                </Document>
            </div>
        </div>
    );
}