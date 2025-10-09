import ValidationPage from "../../app/components/ValidationPage/ValidationPage";
import PageLayout from "~/components/PageLayout";


export default function imValidation() {
    return (
        <div style={{ backgroundColor: 'red' }}>

            <PageLayout>
                <ValidationPage />
            </PageLayout>
        </div>

    )
}