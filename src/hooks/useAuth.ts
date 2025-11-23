import { useState, useEffect } from 'react';
import { AuthService, User } from '../services/authService';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await AuthService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setCurrentUser(AuthService.getCurrentUser());
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentUser(AuthService.getCurrentUser());
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