import { useState } from "react";
import { useTranslation } from "react-i18next";
import FormInput from "../FormInput";
import FormSection from "../FormSection";
import { userAPI } from "../../services/UserAPI";
import { useForm } from "../../hooks";
import type { LoginRequest } from "../../interfaces";

interface LoginFormProps {
  onBack: () => void;
}

export default function LoginForm({ onBack: _onBack }: LoginFormProps) {
  const { t } = useTranslation();
  const { formData, error, setError, handleChange } = useForm({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const loginData: LoginRequest = {
        email: formData.email,
        password: formData.password,
      };

      const response = await userAPI.login(loginData);

      if (response.success && response.data) {
        // Sauvegarder le token JWT
        userAPI.saveToken(response.data);
        // Déterminer le rôle utilisateur depuis le JWT et rediriger vers le bon dashboard
        const userRoleFromJWT = userAPI.getUserRoleFromJWT();
        console.log('User role from JWT:', userRoleFromJWT);
        switch (userRoleFromJWT) {
          case 'EMPLOYER':
            userAPI.saveUserRole('EMPLOYER');
            console.log('Redirecting to employer-dashboard');
            window.location.href = '/employer-dashboard';
            break;
          case 'STUDENT':
            userAPI.saveUserRole('STUDENT');
            console.log('Redirecting to student-dashboard');
            window.location.href = '/student-dashboard';
            break;
           case 'INTERNSHIP_MANAGER':
             userAPI.saveUserRole('INTERNSHIP_MANAGER');
             console.log('Redirecting to im-dashboard');
             window.location.href = '/im-dashboard';
             break;
          default:
            console.log('Role from JWT not found, trying determineUserRole');
            // Si le rôle n'est pas trouvé dans le JWT, essayer la logique de fallback
            const determinedRole = await userAPI.determineUserRole(formData.email);
            console.log('Determined role:', determinedRole);
            if (determinedRole === 'EMPLOYER') {
              userAPI.saveUserRole('EMPLOYER');
              console.log('Redirecting to employer-dashboard (fallback)');
              window.location.href = '/employer-dashboard';
            } else if (determinedRole === 'STUDENT') {
              userAPI.saveUserRole('STUDENT');
              console.log('Redirecting to student-dashboard (fallback)');
              window.location.href = '/student-dashboard';
             } else if (determinedRole === 'INTERNSHIP_MANAGER') {
               userAPI.saveUserRole('INTERNSHIP_MANAGER');
               console.log('Redirecting to im-dashboard (fallback)');
               window.location.href = '/im-dashboard';
            } else {
              console.error('Unable to determine user role, redirecting to home');
              // Si on ne peut toujours pas déterminer, rediriger vers l'accueil
              window.location.href = '/';
            }
        }
      } else {
        setError(response.error || t('errors.networkError'));
      }
    } catch (err) {
      setError(t('errors.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('auth.loginTitle')}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Informations personnelles */}
            <FormSection title={t('auth.loginCredentials')}>
                <div className="flex flex-col items-center space-y-6">
                    <FormInput
                        id="email"
                        name="email"
                        type="email"
                        label={t('common.email')}
                        placeholder={t('auth.emailPlaceholder')}
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                    />
                    <FormInput
                        id="password"
                        name="password"
                        type="password"
                        label={t('common.password')}
                        placeholder={t('auth.passwordPlaceholder')}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        autoComplete="current-password"
                    />
                </div>
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
                  {t('common.loading')}
                </>
              ) : (
                t('common.login')
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
    </div>
  );
}