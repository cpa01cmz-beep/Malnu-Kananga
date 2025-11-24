import React from 'react';
import { StudentSupportService } from '../services/studentSupportService';

const StudentSupportPage: React.FC = () => {
  React.useEffect(() => {
    // Initialize student support system
    StudentSupportService.initialize();
    
    // Add sample support resources
    StudentSupportService.addSupportResource({
      title: 'Panduan Login Portal',
      description: 'Langkah demi langkah cara login ke portal siswa menggunakan Magic Link',
      category: 'guide',
      type: 'guide',
      content: '1. Buka portal siswa\n2. Masukkan email sekolah\n3. Klik "Kirim Magic Link"\n4. Periksa email\n5. Klik link login',
      tags: ['login', 'magic-link', 'tutorial'],
      difficulty: 'beginner',
      estimatedTime: 5,
      rating: 0
    });

    StudentSupportService.addSupportResource({
      title: 'Cara Melihat Nilai',
      description: 'Tutorial lengkap cara mengakses dan memahami nilai akademik',
      category: 'tutorial',
      type: 'video',
      content: 'Klik tab "Nilai" untuk melihat semua mata pelajaran dan nilai terbaru',
      tags: ['nilai', 'akademik', 'tutorial'],
      difficulty: 'beginner',
      estimatedTime: 3,
      rating: 0
    });

    StudentSupportService.addSupportResource({
      title: 'FAQ Umum Portal',
      description: 'Pertanyaan yang sering diajukan tentang portal siswa',
      category: 'faq',
      type: 'document',
      content: 'Q: Bagaimana cara reset password?\nA: Gunakan fitur Magic Link\n\nQ: Portal tidak bisa diakses?\nA: Periksa koneksi internet dan clear cache browser',
      tags: ['faq', 'pertanyaan', 'umum'],
      difficulty: 'beginner',
      estimatedTime: 10,
      rating: 0
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎓 Pusat Dukungan Siswa
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Sistem support akademis dan teknis 24/7 untuk siswa MA Malnu Kananga
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">📚</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Bantuan Akademis
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Dapatkan bimbingan untuk nilai, tugas, dan performa akademik
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="text-3xl mb-4">💻</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Support Teknis
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Bantuan untuk login, akses portal, dan masalah teknis lainnya
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            🚀 Fitur Support Otomatis
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">AI Assistant</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Respon otomatis untuk pertanyaan umum 24/7
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Progress Monitoring</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Pemantauan performa akademik dan engagement real-time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Quick Resolution</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Respon cepat untuk tiket dukungan dengan sistem eskalasi otomatis
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Personalized Guidance</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Rekomendasi personal berdasarkan performa dan kebutuhan
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Untuk akses penuh ke sistem dukungan, silakan login ke portal siswa
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentSupportPage;