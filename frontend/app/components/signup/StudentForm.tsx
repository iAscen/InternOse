import { useState } from "react";
import FormInput from "../FormInput";
import FormSection from "../FormSection";
import PasswordField from "./PasswordField";
import { apiService, type StudentRegistrationRequest } from "../../services/apiService";

interface StudentFormProps {
  onBack: () => void;
}

export default function StudentForm({ onBack }: StudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
  });

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
    // Effacer l'erreur quand l'utilisateur tape
    if (error) setError(null);
  };

  const handlePasswordChange = (password: string) => {
    setFormData(prev => ({ ...prev, password }));
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setFormData(prev => ({ ...prev, confirmPassword }));
  };

  const handlePasswordValidationChange = (isValid: boolean) => {
    setIsPasswordValid(isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      setError('Veuillez corriger les erreurs de mot de passe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registrationData: StudentRegistrationRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: 'STUDENT',
      };

      const response = await apiService.registerStudent(registrationData);

      if (response.success && response.data) {
        // Sauvegarder le token JWT et le rôle
        apiService.saveToken(response.data);
        apiService.saveUserRole('STUDENT');
        
        console.log('Inscription réussie ! Token:', response.data);
        // Rediriger vers le dashboard étudiant
        window.location.href = '/student-dashboard';
      } else {
        setError(response.error || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Inscription <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Étudiant</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Créez votre compte étudiant et trouvez votre stage idéal
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Informations personnelles */}
          <FormSection title="Informations personnelles">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                id="firstName"
                name="firstName"
                type="text"
                label="Prénom"
                placeholder="Votre prénom"
                value={formData.firstName}
                onChange={handleChanges}
                required
              />
              <FormInput
                id="lastName"
                name="lastName"
                type="text"
                label="Nom"
                placeholder="Votre nom"
                value={formData.lastName}
                onChange={handleChanges}
                required
              />
              <FormInput
                id="email"
                name="email"
                type="email"
                label="Email"
                placeholder="votre.email@etudiant.com"
                value={formData.email}
                onChange={handleChanges}
                required
              />
              <FormInput
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                label="Téléphone"
                placeholder="+1 514 555 5555"
                value={formData.phoneNumber}
                onChange={handleChanges}
              />
            </div>
          </FormSection>

          {/* Mot de passe */}
          <FormSection title="Sécurité">
            <PasswordField
              onPasswordChange={handlePasswordChange}
              onConfirmPasswordChange={handleConfirmPasswordChange}
              onValidationChange={handlePasswordValidationChange}
            />
          </FormSection>

          {/* Bouton de soumission */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Création du compte...
                </>
              ) : (
                'Créer mon compte étudiant'
              )}
            </button>
            
            {/* Affichage des erreurs sous le bouton */}
            {error && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center px-4 py-3 rounded-lg bg-red-50 border border-red-200 shadow-sm">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Bouton retour au choix */}
      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 cursor-pointer"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au choix
        </button>
      </div>
    </div>
  );
}