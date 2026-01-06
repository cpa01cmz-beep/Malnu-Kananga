
import React from 'react';
import ClipboardDocumentCheckIcon from '../icons/ClipboardDocumentCheckIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';
import { UsersIcon } from '../icons/UsersIcon';

interface PPDBSectionProps {
  onRegisterClick: () => void;
}

const PPDBSection: React.FC<PPDBSectionProps> = ({ onRegisterClick }) => {
  return (
    <section id="ppdb" className="py-20 sm:py-24 bg-gradient-to-br from-primary-50/80 via-white to-neutral-50/60 dark:from-primary-900/30 dark:via-neutral-900 dark:to-neutral-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 animate-fade-in">
          <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 mb-5 sm:mb-6 rounded-full bg-primary-100 dark:bg-primary-900/50 border border-primary-200/70 dark:border-primary-700/70 text-primary-700 dark:text-primary-300 text-xs sm:text-sm font-bold tracking-wider uppercase animate-scale-in shadow-subtle">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Penerimaan Peserta Didik Baru
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4 sm:mb-5 animate-fade-in-up">Bergabunglah Bersama Kami</h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto leading-relaxed font-medium">
            Jadilah bagian dari generasi unggul MA Malnu Kananga. Pendaftaran Tahun Ajaran 2025/2026 telah dibuka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-12 sm:mb-14">
            <div className="bg-white dark:bg-neutral-800 p-6 sm:p-7 lg:p-8 rounded-xl shadow-card hover:shadow-float border border-neutral-200 dark:border-neutral-700 text-center relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-700 dark:text-primary-300 font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-bl-xl text-xs sm:text-sm shadow-subtle">01</div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-subtle">
                    <DocumentTextIcon />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-3">Isi Formulir</h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">Lengkapi data diri dan data sekolah asal melalui formulir pendaftaran online kami.</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 sm:p-7 lg:p-8 rounded-xl shadow-card hover:shadow-float border border-neutral-200 dark:border-neutral-700 text-center relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-700 dark:text-primary-300 font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-bl-xl text-xs sm:text-sm shadow-subtle">02</div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-subtle">
                    <ClipboardDocumentCheckIcon />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-3">Verifikasi Berkas</h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">Panitia akan memverifikasi data yang Anda kirimkan dalam waktu 1x24 jam.</p>
            </div>

            <div className="bg-white dark:bg-neutral-800 p-6 sm:p-7 lg:p-8 rounded-xl shadow-card hover:shadow-float border border-neutral-200 dark:border-neutral-700 text-center relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900">
                <div className="absolute top-0 right-0 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 text-primary-700 dark:text-primary-300 font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-bl-xl text-xs sm:text-sm shadow-subtle">03</div>
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-subtle">
                    <UsersIcon />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white mb-2 sm:mb-3">Wawancara & Tes</h3>
                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">Ikuti tes akademik and wawancara sesuai jadwal yang ditentukan.</p>
            </div>
        </div>

        <div className="text-center">
            <button
                onClick={onRegisterClick}
                className="inline-flex items-center justify-center px-8 sm:px-10 lg:px-12 py-3.5 sm:py-4 text-base sm:text-lg font-bold text-white transition-all duration-300 bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                Daftar Sekarang
                <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </button>
            <p className="mt-5 sm:mt-6 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 font-medium">
                Pendaftaran Gelombang 1 ditutup pada <strong className="text-neutral-900 dark:text-white font-bold">30 April 2025</strong>.
            </p>
        </div>
      </div>
    </section>
  );
};

export default PPDBSection;
