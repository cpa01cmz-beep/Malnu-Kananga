import React from 'react'

import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { UserRole } from '../types/permissions';
import Modal from './ui/Modal';
import Badge from './ui/Badge';
import { HEIGHTS } from '../config/heights';

interface VoiceCommandsHelpProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  availableCommands: string[];
}

interface CommandCategory {
  title: string;
  commands: { action: string; examples: string[] }[];
}

const VoiceCommandsHelp: React.FC<VoiceCommandsHelpProps> = ({
  isOpen,
  onClose,
  userRole,
  availableCommands,
}) => {
  const getCommandsByCategory = (): CommandCategory[] => {
    const categories: CommandCategory[] = [
      {
        title: 'Perintah Umum',
        commands: [
          {
            action: 'GO_HOME',
            examples: ['pulang', 'kembali', 'go home', 'beranda'],
          },
          {
            action: 'LOGOUT',
            examples: ['keluar', 'logout', 'sign out'],
          },
          {
            action: 'HELP',
            examples: ['bantuan', 'help', 'bisa ngapain saja'],
          },
        ],
      },
    ];

    // Add role-specific commands
    switch (userRole) {
      case 'admin':
        categories.push({
          title: 'Perintah Admin',
          commands: [
            {
              action: 'SHOW_PPDB',
              examples: ['tampilkan ppdb', 'lihat pendaftaran'],
            },
            {
              action: 'VIEW_GRADES_OVERVIEW',
              examples: ['lihat nilai', 'tampilkan nilai'],
            },
            {
              action: 'OPEN_LIBRARY',
              examples: ['buka perpustakaan', 'perpustakaan'],
            },
            {
              action: 'GO_TO_CALENDAR',
              examples: ['kalender', 'buka kalender'],
            },
            {
              action: 'SHOW_STATISTICS',
              examples: ['statistik', 'tampilkan statistik'],
            },
          ],
        });
        break;

      case 'teacher':
        categories.push({
          title: 'Perintah Guru',
          commands: [
            {
              action: 'SHOW_MY_CLASSES',
              examples: ['kelas saya', 'tampilkan kelas'],
            },
            {
              action: 'OPEN_GRADING',
              examples: ['nilai', 'buka penilaian'],
            },
            {
              action: 'VIEW_ATTENDANCE',
              examples: ['absensi', 'lihat absensi'],
            },
            {
              action: 'CREATE_ANNOUNCEMENT',
              examples: ['buat pengumuman', 'pengumuman baru'],
            },
            {
              action: 'VIEW_SCHEDULE',
              examples: ['jadwal', 'lihat jadwal'],
            },
          ],
        });
        break;

      case 'student':
        categories.push({
          title: 'Perintah Siswa',
          commands: [
            {
              action: 'SHOW_MY_GRADES',
              examples: ['nilai saya', 'lihat nilai saya'],
            },
            {
              action: 'CHECK_ATTENDANCE',
              examples: ['cek absensi', 'absensi saya'],
            },
            {
              action: 'VIEW_INSIGHTS',
              examples: ['insight', 'lihat insight'],
            },
            {
              action: 'OPEN_LIBRARY',
              examples: ['perpustakaan', 'buka perpustakaan'],
            },
          ],
        });
        break;

      case 'parent':
        categories.push({
          title: 'Perintah Orang Tua',
          commands: [
            {
              action: 'VIEW_CHILD_GRADES',
              examples: ['nilai anak', 'lihat nilai anak'],
            },
            {
              action: 'VIEW_CHILD_ATTENDANCE',
              examples: ['absensi anak', 'lihat absensi anak'],
            },
            {
              action: 'VIEW_CHILD_SCHEDULE',
              examples: ['jadwal anak', 'lihat jadwal anak'],
            },
            {
              action: 'SEE_NOTIFICATIONS',
              examples: ['notifikasi', 'lihat notifikasi'],
            },
          ],
        });
        break;
    }

    return categories;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Perintah Suara"
      description="Bantuan perintah suara yang tersedia"
      size="xl"
      animation="scale-in"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <MicrophoneIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Untuk role: <span className="font-medium capitalize">{userRole}</span>
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tips:</strong> Tekan tombol mikrofon dan ucapkan salah satu perintah di bawah ini. 
          Gunakan bahasa Indonesia atau Inggris.
        </p>
      </div>

      <div className={`${HEIGHTS.VIEWPORT_MAX.HALF} overflow-y-auto`}>
        {getCommandsByCategory().map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              {category.title}
            </h3>
            <div className="space-y-3">
              {category.commands.map((command, commandIndex) => (
                <div
                  key={commandIndex}
                  className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                        {command.action}
                      </p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                        Contoh perintah:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {command.examples.map((example, exampleIndex) => (
                          <span
                            key={exampleIndex}
                            className="px-2 py-1 bg-white dark:bg-neutral-800 rounded text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600"
                          >
                            "{example}"
                          </span>
                        ))}
                      </div>
                    </div>
                    {availableCommands.includes(command.action) && (
                      <div className="ml-3">
                        <Badge variant="success" size="sm">
                          Tersedia
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {availableCommands.length === 0 && (
          <div className="text-center py-8">
            <p className="text-neutral-600 dark:text-neutral-400">
              Tidak ada perintah suara yang tersedia untuk role ini.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VoiceCommandsHelp;