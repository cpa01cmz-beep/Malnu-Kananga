
import React, { useState } from 'react';

interface ScheduleItem {
  id: string;
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface DailySchedule {
  [day: string]: ScheduleItem[];
}

interface ScheduleViewProps {
  onBack: () => void;
}

const SCHEDULE_DATA: DailySchedule = {
  'Senin': [
    { id: '1', time: '07:00 - 07:45', subject: 'Upacara Bendera', teacher: '-', room: 'Lapangan' },
    { id: '2', time: '07:45 - 09:15', subject: 'Matematika Wajib', teacher: 'Bpk. Ahmad Dahlan', room: 'XII IPA 1' },
    { id: '3', time: '09:15 - 10:45', subject: 'Bahasa Indonesia', teacher: 'Ibu Siti Aminah', room: 'XII IPA 1' },
    { id: '4', time: '10:45 - 11:15', subject: 'Istirahat', teacher: '-', room: '-' },
    { id: '5', time: '11:15 - 12:45', subject: 'Fisika', teacher: 'Bpk. Einstein', room: 'Lab Fisika' },
  ],
  'Selasa': [
    { id: '6', time: '07:00 - 08:30', subject: 'Bahasa Arab', teacher: 'Ustadz Fulan', room: 'XII IPA 1' },
    { id: '7', time: '08:30 - 10:00', subject: 'Biologi', teacher: 'Ibu Darwin', room: 'Lab Biologi' },
    { id: '8', time: '10:00 - 10:30', subject: 'Istirahat', teacher: '-', room: '-' },
    { id: '9', time: '10:30 - 12:00', subject: 'Sejarah Kebudayaan Islam', teacher: 'Bpk. Sejarawan', room: 'XII IPA 1' },
    { id: '10', time: '12:00 - 13:00', subject: 'Ishoma', teacher: '-', room: 'Masjid' },
    { id: '11', time: '13:00 - 14:30', subject: 'Kimia', teacher: 'Ibu Curie', room: 'Lab Kimia' },
  ],
  'Rabu': [
    { id: '12', time: '07:00 - 08:30', subject: 'Bahasa Inggris', teacher: 'Mr. Smith', room: 'XII IPA 1' },
    { id: '13', time: '08:30 - 10:00', subject: 'Matematika Peminatan', teacher: 'Bpk. Ahmad Dahlan', room: 'XII IPA 1' },
    { id: '14', time: '10:00 - 10:30', subject: 'Istirahat', teacher: '-', room: '-' },
    { id: '15', time: '10:30 - 12:00', subject: 'Aqidah Akhlak', teacher: 'Ustadz Ali', room: 'XII IPA 1' },
  ],
  'Kamis': [
    { id: '16', time: '07:00 - 08:30', subject: 'Penjasorkes', teacher: 'Bpk. Ronaldo', room: 'Lapangan' },
    { id: '17', time: '08:30 - 10:00', subject: 'Seni Budaya', teacher: 'Ibu Seniman', room: 'R. Seni' },
    { id: '18', time: '10:00 - 10:30', subject: 'Istirahat', teacher: '-', room: '-' },
    { id: '19', time: '10:30 - 12:00', subject: 'Fiqih', teacher: 'Ustadz Imam', room: 'XII IPA 1' },
  ],
  'Jumat': [
    { id: '20', time: '07:00 - 08:00', subject: 'Yasinan & Dhuha', teacher: 'All Teachers', room: 'Masjid' },
    { id: '21', time: '08:00 - 09:30', subject: 'PKn', teacher: 'Ibu Negara', room: 'XII IPA 1' },
    { id: '22', time: '09:30 - 11:00', subject: 'Al-Quran Hadits', teacher: 'Ustadz Hafiz', room: 'XII IPA 1' },
  ],
};

const DAYS = Object.keys(SCHEDULE_DATA);

const ScheduleView: React.FC<ScheduleViewProps> = ({ onBack }) => {
  const [activeDay, setActiveDay] = useState('Senin');

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Portal
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Pelajaran</h2>
                <p className="text-gray-500 dark:text-gray-400">Kelas: <strong>XII IPA 1</strong> • Semester Ganjil</p>
            </div>
        </div>

        {/* Day Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 scrollbar-hide">
            {DAYS.map((day) => (
                <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                        activeDay === day 
                        ? 'bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none' 
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    {day}
                </button>
            ))}
        </div>

        {/* Schedule List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-bold text-lg text-gray-800 dark:text-white">Jadwal Hari {activeDay}</h3>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {SCHEDULE_DATA[activeDay].map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-24 flex-shrink-0">
                                <span className="text-sm font-bold text-green-600 dark:text-green-400 block">{item.time.split(' - ')[0]}</span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">s.d. {item.time.split(' - ')[1]}</span>
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-gray-900 dark:text-white">{item.subject}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        {item.teacher}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                            <span className="text-xs font-medium px-2 py-1 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400">
                                {item.room}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default ScheduleView;
