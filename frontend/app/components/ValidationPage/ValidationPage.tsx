import { useParams } from "react-router-dom";
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Note: Removed ReactPDF.render calls that invoked this component at module load.
// Those calls caused React hooks (useParams) to run outside a Router context, triggering
// "Invalid hook call" errors during SSR and build.

// TODO REMOVE
const styles = StyleSheet.create({
    page: {
        flexDirection: 'row',
        backgroundColor: '#E4E4E4'
    },
    section: {
        margin: 10,
        padding: 10,
        flexGrow: 1
    }
});



export default function ValidationPage() {
    const { id } = useParams();

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-semibold mb-4">Verification</h1>
            <p className="text-gray-700">This is the verification page for user id: <strong>{id}</strong></p>

            <Document>
                <Page size="A4" style={styles.page}>
                    <View style={styles.section}>
                        <Text>Section #1</Text>
                    </View>
                    <View style={styles.section}>
                        <Text>Section #2</Text>
                    </View>
                </Page>
            </Document>
        </div>
    );
}