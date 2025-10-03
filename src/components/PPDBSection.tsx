import React from 'react';

const PPDBSection: React.FC = () => {
  const handleContactClick = () => {
    document.getElementById('kontak')?.scrollIntoView({ behavior: 'smooth' });
    if (window.announceNavigation) {
      window.announceNavigation('Kontak');
    }
  };

  return (
    <section id="ppdb" className="py-16 sm:py-24 bg-green-50 dark:bg-green-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Penerimaan Peserta Didik Baru (PPDB) 2025</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Bergabunglah dengan keluarga besar MA Malnu Kananga</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">📅 Jadwal PPDB 2025</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium">Pendaftaran Online</span>
                  <span className="text-green-600 dark:text-green-400">1 - 30 Mei 2025</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium">Seleksi Akademik</span>
                  <span className="text-green-600 dark:text-green-400">1 - 5 Juni 2025</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium">Pengumuman</span>
                  <span className="text-green-600 dark:text-green-400">10 Juni 2025</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="font-medium">Daftar Ulang</span>
                  <span className="text-green-600 dark:text-green-400">11 - 15 Juni 2025</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">📋 Syarat Pendaftaran</h3>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Lulusan SMP/MTs atau sederajat</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Fotokopi ijazah/SKL terlegalisir</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Pas foto 3x4 (4 lembar)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Surat keterangan sehat dari dokter</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>Membayar biaya pendaftaran</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4">🏫 Kuota Penerimaan</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">IPA (Ilmu Pengetahuan Alam)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">2 Kelas</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">64</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">IPS (Ilmu Pengetahuan Sosial)</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">1 Kelas</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">32</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white text-center">
              <h4 className="text-lg font-semibold mb-2">Cara Mendaftar</h4>
              <p className="mb-4">Kunjungi sekolah atau daftar online melalui website resmi</p>
              <button
                className="bg-white text-green-600 font-semibold px-6 py-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Navigasi ke bagian kontak untuk informasi lebih lanjut"
                onClick={handleContactClick}
              >
                Kontak Kami
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PPDBSection;