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
          case 'PROFESSOR':
            userAPI.saveUserRole('PROFESSOR')
            console.log('Redirecting to professor-dashboard');
            window.location.href = '/professor-dashboard';
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
            } else if (determinedRole === 'PROFESSOR') {
              userAPI.saveUserRole('PROFESSOR')
              console.log('Redirecting to professor-dashboard (fallback)');
              window.location.href = '/professor-dashboard';
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
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('auth.loginTitle')}</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('auth.loginSubtitle')}
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 md:p-12 max-w-md mx-auto border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {t('auth.loginCredentials')}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
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

          {/* Bouton de soumission */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
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
                <>
                  {t('common.login')}
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Affichage des erreurs sous le bouton */}
            {error && (
              <div className="mt-6 animate-in slide-in-from-top-2 duration-300">
                <div className="inline-flex items-center w-full px-4 py-3 rounded-xl bg-red-50 border-2 border-red-200 shadow-sm">
                  <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Lien vers l'inscription */}
        <div className="mt-8 text-center border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600 mb-4">
            {t('auth.noAccount')}{' '}
            <a
              href="/signup"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              {t('common.signup')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}