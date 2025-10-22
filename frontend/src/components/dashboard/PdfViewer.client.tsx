import { useEffect, useState, useRef, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { setupPdfWorker } from '../setupPdf';
import { pdfWorkerManager } from '../pdfWorkerManager';


interface PdfViewerProps {
    fileUrl: string;
    onCleanup?: () => void;
}

export default function PdfViewer({ fileUrl, onCleanup }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const documentRef = useRef<any>(null);

    const componentId = useMemo(() => `pdf-viewer-${Date.now()}-${Math.random()}`, []);

    useEffect(() => {
        setupPdfWorker();
        pdfWorkerManager.registerComponent(componentId);

        // S'assurer que le worker est prêt avant de continuer
        const checkWorker = () => {
            if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                console.warn('PDF worker not ready, retrying...');
                setTimeout(checkWorker, 100);
                return;
            }
        };
        checkWorker();

        return () => {
            console.log(`Cleaning up PDF component: ${componentId}`);

            if (documentRef.current) {
                try {
                    documentRef.current.destroy();
                    documentRef.current = null;
                } catch (error) {
                    console.error('Error destroying PDF document:', error);
                }
            }

            pdfWorkerManager.unregisterComponent(componentId);

            if (onCleanup) {
                onCleanup();
            }
        };
    }, [componentId]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            console.log('Window closing - cleaning up PDF resources');
            if (documentRef.current) {
                try {
                    documentRef.current.destroy();
                } catch (error) {
                    console.error('Error destroying PDF document on window close:', error);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        console.log('PDF.js worker configuration:', {
            workerSrc: pdfjs.GlobalWorkerOptions.workerSrc,
            fileUrl: fileUrl,
            activeComponents: pdfWorkerManager.getActiveComponentsCount()
        });
    }, [fileUrl]);

    const onLoadError = (err: unknown) => {
        console.error('PDF load error:', err);
        console.error('PDF load error details:', {
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
            fileUrl,
            workerSrc: pdfjs.GlobalWorkerOptions.workerSrc
        });

        let errorMessage = 'Erreur lors du chargement du PDF';
        if (err instanceof Error) {
            if (err.message.includes('Missing PDF')) {
                errorMessage = 'Le fichier PDF est introuvable ou corrompu';
            } else if (err.message.includes('CORS')) {
                errorMessage = 'Erreur de sécurité lors du chargement du PDF';
            } else if (err.message.includes('worker')) {
                errorMessage = 'Erreur de configuration PDF.js';
            } else {
                errorMessage = `Erreur PDF: ${err.message}`;
            }
        }

        setLoadError(errorMessage);
        setLoading(false);
        documentRef.current = null;
    };

    const onDocumentLoadSuccess = (pdf: any) => {
        console.log('PDF loaded successfully:', { numPages: pdf.numPages, fileUrl });
        // Ajouter un petit délai pour s'assurer que le worker est stable
        setTimeout(() => {
            setNumPages(pdf.numPages);
            setLoading(false);
            setLoadError(null);
            documentRef.current = pdf;
        }, 100);
    };

    const onDocumentLoadStart = () => {
        setLoading(true);
        setLoadError(null);
        if (documentRef.current) {
            try {
                documentRef.current.destroy();
                documentRef.current = null;
            } catch (error) {
                console.error('Error destroying previous PDF document:', error);
            }
        }
    };
    if (loadError) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center text-red-600">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="mb-4">{loadError}</p>
                    <p className="text-sm text-gray-500 mb-4">URL: {fileUrl}</p>
                    <button
                        onClick={() => {
                            setLoadError(null);
                            setLoading(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
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
                {loading && (
                    <div className="flex items-center justify-center h-32">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Chargement du document...</p>
                        </div>
                    </div>
                )}

                <Document
                    file={fileUrl}
                    onLoadError={onLoadError}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadStart={onDocumentLoadStart}
                    className="flex flex-col items-center"
                >
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