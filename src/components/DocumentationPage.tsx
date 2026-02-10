import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import Modal from './ui/Modal';
import { HEIGHT_CLASSES } from '../config/heights';
import { idGenerators } from '../utils/idGenerator';

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
    const buttonId = idGenerators.input();
    const contentId = idGenerators.input();
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };
    return (
        <div className="border-b border-neutral-200 dark:border-neutral-700">
            <h2>
                <button
                    id={buttonId}
                    type="button"
                    className="flex items-center justify-between w-full p-5 font-medium text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50"
                    onClick={() => setIsOpen(!isOpen)}
                    onKeyDown={handleKeyDown}
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                >
                    <span>{title}</span>
                    <ChevronDownIcon className={`w-6 h-6 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
            </h2>
            <div
                id={contentId}
                role="region"
                aria-labelledby={buttonId}
                className={`p-5 border-t-0 border-neutral-200 dark:border-neutral-700 transition-all duration-200 ease-in-out ${isOpen ? 'block' : 'hidden'}`}
                aria-hidden={!isOpen}
            >
                <div className="space-y-4 text-neutral-600 dark:text-neutral-400">
                    {children}
                </div>
            </div>
        </div>
    );
};


const DocumentationPage: React.FC<DocumentationPageProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pusat Bantuan"
      size="xl"
      animation="scale-in"
      description="Pusat bantuan dan dokumentasi untuk pengguna"
    >
      <main className={`flex-grow overflow-y-auto ${HEIGHT_CLASSES.MODAL.CONTENT}`}>
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
    </Modal>
  );
};

export default DocumentationPage;