import FeatureList from './FeatureList';

export default function ComingSoonMessage() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="max-w-2xl mx-auto">
        {/* Icône ou illustration */}
        <div className="mb-6">
          <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Service bientôt disponible
        </h2>
        
        <p className="text-lg text-gray-600 mb-6">
          Nous travaillons activement sur votre espace étudiant. 
          Bientôt, vous pourrez :
        </p>

        <FeatureList />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            <strong>En attendant :</strong> Les employeurs peuvent déjà créer des offres de stage 
            qui seront disponibles dès que votre espace sera prêt !
          </p>
        </div>
      </div>
    </div>
  );
}
