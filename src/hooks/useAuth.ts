import { useState, useEffect } from 'react';
import { AuthService, User } from '../services/authService';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(AuthService.getCurrentUser());

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await AuthService.isAuthenticated();
      setIsLoggedIn(authenticated);
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (user?: User) => {
    setIsLoggedIn(true);
    setCurrentUser(user || AuthService.getCurrentUser());
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  return {
    isLoggedIn,
    currentUser,
    handleLoginSuccess,
    handleLogout
  };
};