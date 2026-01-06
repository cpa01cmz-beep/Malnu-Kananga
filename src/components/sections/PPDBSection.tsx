
import React from 'react';
import ClipboardDocumentCheckIcon from '../icons/ClipboardDocumentCheckIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import { UsersIcon } from '../icons/UsersIcon';

interface PPDBSectionProps {
  onRegisterClick: () => void;
}

const PPDBSection: React.FC<PPDBSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="ppdb" className="py-16 sm:py-24 bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-green-600 dark:text-green-400 font-bold tracking-wider uppercase text-sm">Penerimaan Peserta Didik Baru</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">Bergabunglah Bersama Kami</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Jadilah bagian dari generasi unggul MA Malnu Kananga. Pendaftaran Tahun Ajaran 2025/2026 telah dibuka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold px-4 py-1 rounded-bl-xl">01</div>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <DocumentTextIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Isi Formulir</h3>
                <p className="text-gray-500 dark:text-gray-400">Lengkapi data diri dan data sekolah asal melalui formulir pendaftaran online kami.</p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold px-4 py-1 rounded-bl-xl">02</div>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ClipboardDocumentCheckIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Verifikasi Berkas</h3>
                <p className="text-gray-500 dark:text-gray-400">Panitia akan memverifikasi data yang Anda kirimkan dalam waktu 1x24 jam.</p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                <div className="absolute top-0 right-0 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-bold px-4 py-1 rounded-bl-xl">03</div>
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UsersIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Wawancara & Tes</h3>
                <p className="text-gray-500 dark:text-gray-400">Ikuti tes akademik dan wawancara sesuai jadwal yang ditentukan.</p>
            </div>
        </div>

        <div className="text-center">
            <button 
                onClick={onRegisterClick}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-green-600 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-lg hover:shadow-green-500/30 transform hover:scale-105"
            >
                Daftar Sekarang
                <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Pendaftaran Gelombang 1 ditutup pada <strong>30 April 2025</strong>.
            </p>
        </div>
      </div>
    </section>
  );
};

export default PPDBSection;
