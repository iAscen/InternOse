// app/components/ValidationPage/PdfViewer.client.tsx
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function PdfViewer({ fileUrl }: { fileUrl: string }) {
    const [isReady, setIsReady] = useState(false);
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1); // optional zoom

    useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs',
            import.meta.url,
        ).toString();
        setIsReady(true);
    }, []);

    const onLoadError = (err: unknown) => {
        console.error('PDF load error:', err);
    };

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    if (!isReady) return null;

    return (
        <div>
            {/* Optional zoom controls */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>-</button>
                <span>Zoom: {(scale * 100).toFixed(0)}%</span>
                <button onClick={() => setScale(s => Math.min(3, s + 0.1))}>+</button>
            </div>

            {/* Scrollable viewer area */}
            <div style={{
                height: '80vh',
                width: '100%',
                overflowY: 'auto',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 8,
            }}>
                <Document file={fileUrl} onLoadError={onLoadError} onLoadSuccess={onDocumentLoadSuccess}>
                    {Array.from({ length: numPages }, (_, i) => (
                        <Page
                            key={`page_${i + 1}`}
                            pageNumber={i + 1}
                            scale={scale}
                            renderTextLayer
                            renderAnnotationLayer
                        />
                    ))}
                </Document>
            </div>
        </div>
    );
}