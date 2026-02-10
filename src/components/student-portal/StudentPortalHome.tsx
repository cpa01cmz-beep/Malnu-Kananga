import React from 'react';
import Badge from '../ui/Badge';
import DashboardActionCard, { type ColorTheme } from '../ui/DashboardActionCard';
import SmallActionButton from '../ui/SmallActionButton';
import VoiceInputButton from '../VoiceInputButton';
import ActivityFeed, { type Activity } from '../ActivityFeed';
import type { Student, UserExtraRole } from '../../types';
import type { VoiceCommand } from '../../types';
import { UI_STRINGS } from '../../constants';

interface StudentPortalHomeProps {
  studentData: Student | null;
  loading: boolean;
  extraRole: UserExtraRole;
  isOnline: boolean;
  isSlow: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  voiceSupported: boolean;
  menuItems: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
    colorTheme: ColorTheme;
    action: () => void;
    statusBadge?: string;
    isExtraRole?: boolean;
    extraRoleBadge?: string;
  }>;
  onNavigate: (view: string) => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error' | 'warning') => void;
  onVoiceCommand: (command: VoiceCommand) => void;
  onShowVoiceHelp: () => void;
}

export const StudentPortalHome: React.FC<StudentPortalHomeProps> = ({
  studentData,
  loading,
  extraRole,
  isOnline,
  isConnected,
  isConnecting,
  voiceSupported,
  menuItems,
  onNavigate,
  onShowToast,
  onVoiceCommand,
  onShowVoiceHelp,
}) => {
  const handleActivityClick = (activity: Activity) => {
    if (activity.type === 'grade_updated' || activity.type === 'grade_created') {
      onNavigate('grades');
      onShowToast('Navigasi ke nilai', 'success');
    } else if (activity.type === 'attendance_marked' || activity.type === 'attendance_updated') {
      onNavigate('attendance');
      onShowToast('Navigasi ke absensi', 'success');
    } else if (activity.type === 'library_material_added' || activity.type === 'library_material_updated') {
      onNavigate('library');
      onShowToast('Navigasi ke e-library', 'success');
    } else if (activity.type === 'message_created' || activity.type === 'message_updated') {
      onNavigate('groups');
      onShowToast('Navigasi ke grup diskusi', 'success');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 sm:p-8 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl sm:text-3xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Portal Siswa</h1>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300 text-lg">
              Selamat datang kembali, <strong>{loading ? UI_STRINGS.LOADING : studentData?.className || 'Siswa'}</strong>!
              {extraRole === 'osis' && (
                <Badge variant="warning" size="sm" className="block mt-1">
                  ⭐ Pengurus OSIS
                </Badge>
              )}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {!loading && studentData && `NIS: ${studentData.nis} • Kelas ${studentData.className}`}
              {loading && 'Memuat data...'}
            </p>
          </div>
          <div className="hidden md:block text-right">
            <Badge variant="primary" size="lg" className="mb-2">
              Semester Ganjil 2024/2025
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 sm:w-24 h-32 sm:h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
      </div>

      {voiceSupported && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Perintah Suara
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Gunakan suara untuk navigasi cepat portal
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SmallActionButton onClick={onShowVoiceHelp}>
                Bantuan
              </SmallActionButton>
              <VoiceInputButton
                onTranscript={(transcript) => {
                  onShowToast(`Transkripsi: ${transcript}`, 'info');
                }}
                onCommand={onVoiceCommand}
                onError={(errorMsg) => onShowToast(errorMsg, 'error')}
                className="flex-shrink-0"
              />
            </div>
          </div>
          {isOnline && (
            <div className="mt-4 flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} ${isConnecting ? 'animate-pulse' : ''}`}></div>
              <span className="text-neutral-600 dark:text-neutral-400">
                {isConnected ? 'Real-time Aktif' : isConnecting ? 'Menghubungkan...' : 'Tidak Terhubung'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-card border border-neutral-200 dark:border-neutral-700 mb-8 animate-fade-in-up">
        <ActivityFeed
          userId={studentData?.id || ''}
          userRole="student"
          eventTypes={[
            'grade_updated',
            'grade_created',
            'attendance_marked',
            'attendance_updated',
            'library_material_added',
            'library_material_updated',
            'message_created',
            'message_updated',
          ]}
          showFilter
          maxActivities={50}
          onActivityClick={handleActivityClick}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <DashboardActionCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            description={item.description}
            colorTheme={item.colorTheme}
            statusBadge={item.statusBadge}
            isExtraRole={item.isExtraRole}
            extraRoleBadge={item.extraRoleBadge}
            isOnline={isOnline}
            onClick={item.action}
            ariaLabel={`Buka ${item.title}`}
          />
        ))}
      </div>
    </>
  );
};

export default StudentPortalHome;
