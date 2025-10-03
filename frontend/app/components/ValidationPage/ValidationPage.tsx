import { useParams } from "react-router-dom";
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
export default function ValidationPage() {
    const { id } = useParams();

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Verification</h1>
            <p className="text-gray-700">This is the verification page for user id: <strong>{id}</strong></p>

            <Document>
                <Page size="A4">
                    <View>
                        <Text>Section #1</Text>
                    </View>
                    <View>
                        <Text>Section #2</Text>
                    </View>
                </Page>
            </Document>
        </div>
    );
}