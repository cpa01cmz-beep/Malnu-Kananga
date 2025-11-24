import { useState, useEffect } from 'react';
import { AuthService, User } from '../services/authService';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authenticated = await AuthService.isAuthenticated();
        const user = await AuthService.getCurrentUser(); // Fixed: Added await for consistency
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

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const authenticated = await AuthService.isAuthenticated();
        const user = await AuthService.getCurrentUser();
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

  const handleLoginSuccess = async (user: User) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await AuthService.logout();
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