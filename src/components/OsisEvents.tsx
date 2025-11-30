
import React, { useState } from 'react';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import type { SchoolEvent } from '../types';
import { STORAGE_KEYS } from '../constants';
import useLocalStorage from '../hooks/useLocalStorage';

interface OsisEventsProps {
  onBack: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

const INITIAL_EVENTS: SchoolEvent[] = [
    { id: '1', eventName: 'Porseni 2025', date: '2025-06-15', location: 'Lapangan Sekolah', description: 'Pekan Olahraga dan Seni antar kelas.', status: 'Upcoming' },
    { id: '2', eventName: 'Maulid Nabi', date: '2024-09-12', location: 'Masjid Jami', description: 'Peringatan Maulid Nabi Muhammad SAW.', status: 'Completed' },
];

const OsisEvents: React.FC<OsisEventsProps> = ({ onBack, onShowToast }) => {
  const [events, setEvents] = useLocalStorage<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);

  const [newEvent, setNewEvent] = useState<Partial<SchoolEvent>>({
      eventName: '', date: '', location: '', description: '', status: 'Upcoming'
  });

  const handleAddEvent = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEvent.eventName) return;

      const event: SchoolEvent = {
          id: Date.now().toString(),
          eventName: newEvent.eventName!,
          date: newEvent.date!,
          location: newEvent.location!,
          description: newEvent.description!,
          status: newEvent.status as any
      };

      setEvents([...events, event]);
      setNewEvent({ eventName: '', date: '', location: '', description: '', status: 'Upcoming' });
      onShowToast('Kegiatan berhasil dijadwalkan.', 'success');
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Batalkan kegiatan ini?')) {
          setEvents(events.filter(e => e.id !== id));
          onShowToast('Kegiatan dihapus.', 'info');
      }
  };

  return (
    <div className="animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div>
                <button onClick={onBack} className="text-sm text-gray-500 hover:text-green-600 mb-2 flex items-center gap-1">
                    ← Kembali ke Portal
                </button>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Kegiatan OSIS</h2>
                <p className="text-gray-500 dark:text-gray-400">Rencanakan dan kelola event sekolah.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Buat Kegiatan Baru</h3>
                    <form onSubmit={handleAddEvent} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Kegiatan</label>
                            <input required type="text" value={newEvent.eventName} onChange={e => setNewEvent({...newEvent, eventName: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Pelaksanaan</label>
                            <input required type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi</label>
                            <input required type="text" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi Singkat</label>
                            <textarea required rows={3} value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500" />
                        </div>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                            <PlusIcon className="w-5 h-5" /> Simpan Kegiatan
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
                {events.length === 0 && <p className="text-center text-gray-500 mt-8">Belum ada kegiatan.</p>}
                {events.map(event => (
                    <div key={event.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-4">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-2xl text-orange-600 dark:text-orange-400">
                                <CalendarDaysIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{event.eventName}</h4>
                                <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <span>📅 {event.date}</span>
                                    <span>📍 {event.location}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{event.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 self-end md:self-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                event.status === 'Upcoming' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                event.status === 'Ongoing' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                                {event.status}
                            </span>
                            <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default OsisEvents;
