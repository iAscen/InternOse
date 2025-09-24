import { useState } from 'react';
import FormInput from '../FormInput';

interface PasswordFieldProps {
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (confirmPassword: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

export default function PasswordField({ 
  onPasswordChange, 
  onConfirmPasswordChange, 
  onValidationChange 
}: PasswordFieldProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{password?: string; confirmPassword?: string}>({});

  const validatePasswords = (pwd: string, confirm: string) => {
    const newErrors: {password?: string; confirmPassword?: string} = {};

    if (pwd) {
      if (pwd.length < 8) {
        newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
      } else if (!/[A-Z]/.test(pwd)) {
        newErrors.password = 'Le mot de passe doit contenir au moins une lettre majuscule';
      } else if (!/[0-9]/.test(pwd)) {
        newErrors.password = 'Le mot de passe doit contenir au moins un chiffre';
      } else if (!/[!@#$%^&()_+\-=\[\]{};':|,.<>/?]/.test(pwd)) {
        newErrors.password = 'Le mot de passe doit contenir au moins un caractère spécial';
      }
    }

    if (confirm && pwd !== confirm) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    onPasswordChange(value);
    
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }

    const isValid = validatePasswords(value, confirmPassword);
    onValidationChange(isValid);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    onConfirmPasswordChange(value);
    
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }

    const isValid = validatePasswords(password, value);
    onValidationChange(isValid);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <FormInput
          id="password"
          name="password"
          type="password"
          label="Mot de passe"
          placeholder="Votre mot de passe"
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
          required
          minLength={8}
        />
        <p className="mt-1 text-xs text-gray-500">
          Au moins 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial
        </p>
      </div>
      <div>
        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmer le mot de passe"
          placeholder="Confirmez votre mot de passe"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={errors.confirmPassword}
          required
          minLength={8}
        />
      </div>
    </div>
  );
}
