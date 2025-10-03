import React, { Suspense, lazy } from 'react';
import { User } from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

// Lazy load heavy components untuk code splitting
const StudentDashboard = lazy(() => import('./StudentDashboard'));
const TeacherDashboard = lazy(() => import('./TeacherDashboard'));
const HeroSection = lazy(() => import('./HeroSection'));
const PPDBSection = lazy(() => import('./PPDBSection'));
const ContactSection = lazy(() => import('./ContactSection'));
const RelatedLinksSection = lazy(() => import('./RelatedLinksSection'));
const ProfileSection = lazy(() => import('./ProfileSection'));
const FeaturedProgramsSection = lazy(() => import('./FeaturedProgramsSection'));
const LatestNewsSection = lazy(() => import('./LatestNewsSection'));

interface MainContentRouterProps {
  isLoggedIn: boolean;
  currentUser: User | null;
  onLogout: () => void;
}

const DashboardLoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="pt-24 pb-12">
      <LoadingSpinner size="lg" message="Memuat dashboard..." fullScreen />
    </div>
  </div>
);

const SectionLoadingFallback = () => (
  <div className="py-16 flex justify-center items-center">
    <LoadingSpinner size="md" message="Memuat konten..." />
  </div>
);

const MainContentRouter: React.FC<MainContentRouterProps> = ({ isLoggedIn, currentUser, onLogout }) => {
  if (isLoggedIn && currentUser) {
    return (
      <main id="main-content" role="main" aria-label="Portal utama">
        <Suspense fallback={<DashboardLoadingFallback />}>
          {currentUser.role === 'admin' || currentUser.role === 'teacher' ? (
            <TeacherDashboard onLogout={onLogout} />
          ) : (
            <StudentDashboard onLogout={onLogout} />
          )}
        </Suspense>
      </main>
    );
  }

  return (
    <main id="main-content" role="main" aria-label="Halaman utama MA Malnu Kananga">
      <Suspense fallback={<SectionLoadingFallback />}>
        <HeroSection />
      </Suspense>

      <Suspense fallback={<SectionLoadingFallback />}>
        <PPDBSection />
      </Suspense>

      <Suspense fallback={<SectionLoadingFallback />}>
        <ContactSection />
      </Suspense>

      <Suspense fallback={<SectionLoadingFallback />}>
        <RelatedLinksSection />
      </Suspense>

      <Suspense fallback={<SectionLoadingFallback />}>
        <ProfileSection />
      </Suspense>

      <Suspense fallback={<SectionLoadingFallback />}>
        <FeaturedProgramsSection />
      </Suspense>

      <Suspense fallback={<SectionLoadingFallback />}>
        <LatestNewsSection />
      </Suspense>
    </main>
  );
};

export default MainContentRouter;