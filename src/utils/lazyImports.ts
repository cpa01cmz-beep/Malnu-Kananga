import { lazy } from 'react';

// Lazy load heavy components
export const LazyStudentDashboard = lazy(() => import('../components/StudentDashboard'));
export const LazyTeacherDashboard = lazy(() => import('../components/TeacherDashboard'));
export const LazyParentDashboard = lazy(() => import('../components/ParentDashboard'));
export const LazyStudentSupport = lazy(() => import('../components/StudentSupport'));
export const LazyAssignmentSubmission = lazy(() => import('../components/AssignmentSubmission'));
export const LazyChatWindow = lazy(() => import('../components/ChatWindow'));
export const LazySiteEditor = lazy(() => import('../components/SiteEditor'));
export const LazyDocumentationPage = lazy(() => import('../components/DocumentationPage'));
export const LazyStudentProgressMonitor = lazy(() => import('../components/StudentProgressMonitor'));
export const LazyStudentSupportDashboard = lazy(() => import('../components/StudentSupportDashboard'));

// Lazy load sections
export const LazyHeroSection = lazy(() => import('../components/HeroSection'));
export const LazyPPDBSection = lazy(() => import('../components/PPDBSection'));
export const LazyContactSection = lazy(() => import('../components/ContactSection'));
export const LazyProfileSection = lazy(() => import('../components/ProfileSection'));
export const LazyFeaturedProgramsSection = lazy(() => import('../components/FeaturedProgramsSection'));
export const LazyLatestNewsSection = lazy(() => import('../components/LatestNewsSection'));
export const LazyRelatedLinksSection = lazy(() => import('../components/RelatedLinksSection'));

// Lazy load services
export const LazyMemoryService = lazy(() => import('../memory/services/MemoryService'));