import { useState } from 'react';
import { AuthService, User } from '../services/authService';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<User | null>(AuthService.getCurrentUser());

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