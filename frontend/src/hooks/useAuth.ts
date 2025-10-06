import { useState, useEffect } from 'react';
import { apiService } from '~/services/apiService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated());
    setUserRole(apiService.getUserRole());
    setUserEmail(apiService.getUserEmail());
  }, []);

  return { isAuthenticated, userRole, userEmail };
};
