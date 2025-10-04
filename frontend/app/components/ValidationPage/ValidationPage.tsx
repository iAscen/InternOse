import { useParams } from "react-router-dom";
import {Suspense, useEffect, useState} from "react";
import type { JSX } from "react";
// import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';


export default function ValidationPage() {
    const { id } = useParams();
    const [isClient, setIsClient] = useState(false);
    const [PdfViewer, setPdfViewer] = useState<null | ((props: { fileUrl: string }) => JSX.Element | null)>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;
        import('./PdfViewer.client').then(mod => setPdfViewer(() => mod.default));
    }, [isClient]);

    if (!isClient) return null;
    const pdfUrl = new URL('./CVtest.pdf', import.meta.url).href;


    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Verification</h1>
            <p className="text-gray-700">This is the verification page for user id: <strong>{id}</strong></p>

            <div className="mt-6">
                <h2 className="text-xl font-medium mb-2 text-black">Preview PDF</h2>
                <Suspense fallback={<div className="text-black">Loading PDF viewer…</div>}>
                    {PdfViewer ? <PdfViewer fileUrl={pdfUrl} /> : <div>Loading PDF viewer…</div>}
                </Suspense>
            </div>
        </div>
    );
}