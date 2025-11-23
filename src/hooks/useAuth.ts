import { useState, useEffect } from 'react';
import { AuthService, User } from '../services/authService';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authenticated = await AuthService.isAuthenticated();
        const user = AuthService.getCurrentUser();
        setIsLoggedIn(authenticated);
        setCurrentUser(user);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    };

    initializeAuth();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
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