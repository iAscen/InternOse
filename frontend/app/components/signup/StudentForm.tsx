import { Link } from "react-router";

interface StudentFormProps {
  onBack: () => void;
}

export default function StudentForm({ onBack }: StudentFormProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Inscription <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Étudiant</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Formulaire d'inscription étudiant (à venir)
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Bientôt disponible</h2>
        <p className="text-gray-600 mb-8 text-lg">Cette fonctionnalité sera disponible prochainement. Revenez bientôt !</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onBack}
            className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au choix
          </button>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}