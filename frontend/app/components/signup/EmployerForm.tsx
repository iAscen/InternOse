import { useState } from "react";
import FormInput from "../FormInput";
import FormSection from "../FormSection";
import PasswordField from "./PasswordField";

interface EmployerFormProps {
  onBack: () => void;
}

export default function EmployerForm({ onBack }: EmployerFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    phoneNumber: '',
  });

  const [isPasswordValid, setIsPasswordValid] = useState(false);

  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      return;
    }

    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Inscription <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Employeur</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Créez votre compte employeur et commencez à publier des offres de stage
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
                placeholder="votre.email@entreprise.com"
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

          {/* Informations entreprise */}
          <FormSection title="Informations entreprise">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                id="companyName"
                name="companyName"
                type="text"
                label="Nom de l'entreprise"
                placeholder="Nom de votre entreprise"
                value={formData.companyName}
                onChange={handleChanges}
                required
                minLength={2}
              />
            </div>
          </FormSection>

          {/* Bouton de soumission */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Créer mon compte employeur
            </button>
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