import { useState } from 'react';

export const useForm = <T extends Record<string, any>>(initialState: T) => {
  const [formData, setFormData] = useState<T>(initialState);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const reset = () => {
    setFormData(initialState);
    setError(null);
  };

  return { 
    formData, 
    setFormData, 
    error, 
    setError, 
    handleChange, 
    reset 
  };
};
