import React, { Suspense } from 'react';
import LoginModal from './LoginModal';
import DocumentationPage from './DocumentationPage';
import { User } from '../services/authService';

interface ModalsContainerProps {
  isLoginOpen: boolean;
  isDocsOpen: boolean;
  onLoginClose: () => void;
  onDocsClose: () => void;
  onLoginSuccess: (user?: User) => void;
}

const ModalsContainer: React.FC<ModalsContainerProps> = ({
  isLoginOpen,
  isDocsOpen,
  onLoginClose,
  onDocsClose,
  onLoginSuccess
}) => {
  return (
    <>
      <LoginModal
        isOpen={isLoginOpen}
        onClose={onLoginClose}
        onLoginSuccess={onLoginSuccess}
      />
      <DocumentationPage
        isOpen={isDocsOpen}
        onClose={onDocsClose}
      />
    </>
  );
};

export default ModalsContainer;