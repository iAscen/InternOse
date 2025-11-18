import {useState, useEffect} from 'react';
import {userAPI} from '~/services/UserAPI';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'EMPLOYER' | 'STUDENT' | 'INTERNSHIP_MANAGER' | 'PROFESSOR' | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setIsAuthenticated(userAPI.isAuthenticated());
    setUserRole(userAPI.getUserRole());
    setUserName(userAPI.getUserName())
    setUserEmail(userAPI.getUserEmail());
  }, []);

  return {isAuthenticated, userRole, userName, userEmail};
};
