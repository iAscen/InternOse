import { useState } from "react";
import FormInput from "../FormInput";
import FormSection from "../FormSection";

interface LoginFormProps {
  onBack: () => void;
}

export default function LoginForm({ onBack }: LoginFormProps) {
  const [formData, setFormData] = useState({
    // firstName: '',
    // lastName: '',
    email: '',
    password: '',
    // confirmPassword: '',
    // phoneNumber: '',
  });

  const handleChanges = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Connexion</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connectez-vous à votre compte étudiant pour accéder à votre espace stage
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-6xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <FormSection title="Identifiants de connexion">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    id="password"
                    name="password"
                    type="password"
                    label="Mot de passe"
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleChanges}
                    required
                    minLength={8}
                />
            </div>
          </FormSection>

          {/* Bouton de soumission */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Connexion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}