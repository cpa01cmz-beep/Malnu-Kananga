import React, { Suspense } from 'react';
import { LazyStudentDashboard, LazyTeacherDashboard, LazyParentDashboard } from '../utils/lazyImports';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error boundary for lazy components
const LazyErrorBoundary = ({ children: _children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="text-center">
      <p className="text-red-600 mb-2">Gagal memuat komponen</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Muat Ulang
      </button>
    </div>
  </div>
);

// Lazy wrapper component
export const LazyWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyErrorBoundary>
      {children}
    </LazyErrorBoundary>
  </Suspense>
);

// Lazy dashboard components with proper loading states
export const StudentDashboardLazy = () => (
  <LazyWrapper>
    <LazyStudentDashboard onLogout={() => {}} />
  </LazyWrapper>
);

export const TeacherDashboardLazy = () => (
  <LazyWrapper>
    <LazyTeacherDashboard onLogout={() => {}} />
  </LazyWrapper>
);

export const ParentDashboardLazy = () => (
  <LazyWrapper>
    <LazyParentDashboard onLogout={() => {}} />
  </LazyWrapper>
);