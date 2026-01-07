import React, { useState } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface DocumentationPageProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-neutral-200 dark:border-neutral-700">
            <h2>
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-5 font-medium text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                >
                    <span>{title}</span>
                    <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </h2>
            <div className={`p-5 border-t-0 border-neutral-200 dark:border-neutral-700 ${isOpen ? 'block' : 'hidden'}`}>
                <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
                    {children}
                </div>
            </div>
        </div>
    );
};


const DocumentationPage: React.FC<DocumentationPageProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-neutral-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Pusat Bantuan</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            aria-label="Tutup"
          >
            <CloseIcon />
          </button>
        </header>
        
        <main className="flex-grow overflow-y-auto">
            <AccordionItem title="Untuk Pengguna Umum">
                <p>Selamat datang di website MA Malnu Kananga. Anda dapat menjelajahi informasi publik seperti profil sekolah, program unggulan, dan berita terbaru. Gunakan menu navigasi di bagian atas untuk berpindah halaman.</p>
                <p>Jika Anda memiliki pertanyaan, jangan ragu untuk menggunakan <strong>Asisten AI</strong> kami yang ada di pojok kanan bawah. Cukup klik ikon chat untuk memulai percakapan.</p>
            </AccordionItem>
            <AccordionItem title="Untuk Siswa">
                <p>Sebagai siswa, Anda dapat mengakses area khusus yang disebut <strong>Portal Siswa</strong>. Untuk masuk:</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Klik tombol <strong>Login</strong> di pojok kanan atas.</li>
                    <li>Masukkan alamat email yang telah terdaftar di sekolah.</li>
                    <li>Klik "Kirim Link Login". Anda akan menerima email berisi tautan khusus.</li>
                    <li>Klik tautan tersebut di email Anda, dan Anda akan otomatis masuk ke portal.</li>
                </ol>
                <p>Di dalam portal, Anda akan dapat melihat jadwal pelajaran, nilai, absensi, dan materi pelajaran (fitur ini sedang dalam pengembangan).</p>
            </AccordionItem>
            <AccordionItem title="Untuk Guru & Staf">
                 <p>Proses login untuk guru dan staf sama dengan siswa, yaitu menggunakan email yang telah terdaftar di sistem sekolah melalui mekanisme "Magic Link".</p>
                 <p>Portal untuk guru akan memiliki fitur tambahan, seperti manajemen kelas, input nilai, dan upload materi. Fitur ini akan dikembangkan di masa mendatang.</p>
            </AccordionItem>
            <AccordionItem title="Untuk Wali Murid">
                <p>Wali murid dapat memantau perkembangan akademik putra/putrinya melalui Portal Siswa. Saat ini, akses untuk wali murid menggunakan akun yang sama dengan siswa.</p>
                <p>Di masa depan, kami berencana untuk menyediakan akun terpisah bagi wali murid untuk pengalaman yang lebih personal.</p>
            </AccordionItem>
        </main>
      </div>
    </div>
  );
};

export default DocumentationPage;