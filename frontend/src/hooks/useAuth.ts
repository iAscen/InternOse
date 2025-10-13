import {useState, useEffect} from 'react';
import {apiService} from '~/services/apiService';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(apiService.isAuthenticated());
    setUserRole(apiService.getUserRole());
    setUserName(apiService.getUserName())
    setUserEmail(apiService.getUserEmail());
  }, []);

  return {isAuthenticated, userRole, userName, userEmail};
};
