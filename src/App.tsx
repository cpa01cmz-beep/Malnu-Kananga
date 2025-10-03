
import React, { useState, Suspense, lazy } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import DocumentationPage from './components/DocumentationPage';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import LazyImage from './components/LazyImage';
import { useKeyboardNavigation, useScreenReader } from './hooks/useKeyboardNavigation';
import { featuredPrograms } from './data/featuredPrograms';
import { latestNews } from './data/latestNews';
import { relatedLinks } from './data/relatedLinks';
import { AuthService, User } from './services/authService';

// Lazy load heavy components untuk code splitting
const ChatWindow = lazy(() => import('./components/ChatWindow'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));


const App: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(AuthService.isAuthenticated());
  const [currentUser, setCurrentUser] = useState<User | null>(AuthService.getCurrentUser());
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State for chat window

  // Accessibility hooks
  useKeyboardNavigation();
  const { announceNavigation } = useScreenReader();

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentUser(AuthService.getCurrentUser());
    setIsLoginOpen(false);
  };

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // Enhanced loading component dengan proper error handling
  const DashboardLoadingFallback = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="pt-24 pb-12">
        <LoadingSpinner size="lg" message="Memuat dashboard..." fullScreen />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen font-sans text-gray-800 dark:text-gray-200">
        {/* SEO Meta Tags - Properly structured for React */}
        <title>MA Malnu Kananga - Portal Akademik</title>
        <meta name="description" content="Portal akademik resmi MA Malnu Kananga untuk siswa, guru, dan orang tua. Platform pendidikan modern dengan teknologi AI untuk pembelajaran yang lebih baik." />
        <meta name="keywords" content="MA Malnu Kananga, madrasah, pendidikan, akademik, portal siswa, nilai online, jadwal pelajaran" />
        <meta name="author" content="MA Malnu Kananga" />
        <meta property="og:title" content="MA Malnu Kananga - Portal Akademik" />
        <meta property="og:description" content="Platform pendidikan modern dengan teknologi AI untuk pembelajaran yang lebih baik" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ma-malnukananga.sch.id" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://ma-malnukananga.sch.id" />

        {/* Skip to main content link untuk screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded z-50"
        >
          Lewati ke konten utama
        </a>

        <Header
          onLoginClick={() => setIsLoginOpen(true)}
          onChatClick={() => setIsChatOpen(true)} // Pass chat handler to header
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
      
        <ErrorBoundary>
          <Suspense fallback={<DashboardLoadingFallback />}>
              {isLoggedIn && currentUser ? (
                <main id="main-content" role="main" aria-label="Portal utama">
                  {currentUser.role === 'admin' || currentUser.role === 'teacher' ? (
                    <TeacherDashboard onLogout={handleLogout} />
                  ) : (
                    <StudentDashboard onLogout={handleLogout} />
                  )}
                </main>
              ) : (
                <main id="main-content" role="main" aria-label="Halaman utama MA Malnu Kananga">
          {/* Hero Section */}
          <section id="home" className="relative min-h-dvh flex items-center justify-center text-center px-4 pt-24 pb-12 sm:pt-32" aria-labelledby="hero-title">
            <div className="absolute inset-0 bg-gradient-to-b from-green-100/80 to-transparent dark:from-green-900/40 dark:to-transparent"></div>
            <div className="relative z-10 animate-fade-in-up">
              <h1 id="hero-title" className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
                MA Malnu Kananga
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
                Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    document.getElementById('ppdb')?.scrollIntoView({ behavior: 'smooth' });
                    announceNavigation('Penerimaan Peserta Didik Baru');
                  }}
                  className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Navigasi ke informasi PPDB 2025"
                >
                  Info PPDB 2025
                </button>
                <button
                  onClick={() => {
                    document.getElementById('profil')?.scrollIntoView({ behavior: 'smooth' });
                    announceNavigation('Profil Sekolah');
                  }}
                  className="bg-white dark:bg-gray-700 text-green-600 dark:text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50"
                  aria-label="Navigasi ke profil madrasah"
                >
                  Jelajahi Profil
                </button>
              </div>
            </div>
          </section>

          {/* PPDB Section */}
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
                      onClick={() => {
                        document.getElementById('kontak')?.scrollIntoView({ behavior: 'smooth' });
                        announceNavigation('Kontak');
                      }}
                    >
                      Kontak Kami
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="kontak" className="py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Hubungi Kami</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Kami siap melayani pertanyaan dan informasi yang Anda butuhkan</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">📍 Informasi Kontak</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Alamat</p>
                          <p className="text-gray-600 dark:text-gray-400">Jl. Desa Kananga Km. 0,5<br />Kecamatan Menes, Kabupaten Pandeglang<br />Banten 42260</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Email</p>
                          <p className="text-gray-600 dark:text-gray-400">info@ma-malnukananga.sch.id</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Telepon</p>
                          <p className="text-gray-600 dark:text-gray-400">(0253) 1234567<br />Fax: (0253) 1234568</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">💬 Kirim Pesan</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="nama@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pesan
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Tuliskan pesan Anda di sini..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Kirim Pesan
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </section>

          {/* Related Links Section */}
          <section id="tautan" className="py-12 sm:py-16" aria-labelledby="links-title">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <div className="text-center mb-12">
                   <h2 id="links-title" className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Tautan Terkait</h2>
                   <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Akses informasi penting dan layanan pendidikan</p>
                 </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                      {relatedLinks.map((link) => (
                          <a 
                              key={link.name} 
                              href={link.href} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="group flex flex-col items-center p-4 sm:p-6 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white dark:hover:bg-gray-700"
                          >
                              <div className={`flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full ${link.color} transition-colors duration-300`}>
                                  {link.icon}
                              </div>
                              <span className="mt-4 font-semibold text-center text-sm sm:text-base text-gray-700 dark:text-gray-200">{link.name}</span>
                          </a>
                      ))}
                  </div>
              </div>
          </section>
          
          {/* Profile Section */}
          <section id="profil" className="py-16 sm:py-24 bg-white dark:bg-gray-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Profil Madrasah</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Mengenal Lebih Dekat MA Malnu Kananga</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
                  <div className="lg:col-span-3 text-base text-gray-700 dark:text-gray-300 space-y-4 text-left sm:text-justify">
                      <p>
                          <strong>Madrasah Aliyah MALNU Kananga</strong> adalah lembaga pendidikan menengah atas swasta bernaung di bawah Kementerian Agama Republik Indonesia. Berlokasi di Jalan Desa Kananga Km. 0,5, Kecamatan Menes, Kabupaten Pandeglang, Banten, madrasah ini didirikan pada tahun 2000 dengan tujuan mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
                      </p>
                      <p>
                          Kurikulum yang digunakan memadukan <strong>pendidikan salafiyah</strong> dengan <strong>pendidikan modern</strong>, termasuk pemantapan keterampilan abad 21 untuk menjawab kebutuhan masa depan.
                      </p>
                  </div>
                  <div className="lg:col-span-2 space-y-6">
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md border-l-4 border-green-500">
                          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">Visi</h3>
                          <p className="text-gray-700 dark:text-gray-200">Melahirkan peserta didik berakhlak mulia, akademis unggul, serta berjiwa wirausaha.</p>
                      </div>
                      <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md border-l-4 border-green-500">
                          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">Misi</h3>
                          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
                              <li>Penguatan pendidikan agama Islam berlandaskan nilai salafiyah.</li>
                              <li>Penerapan kurikulum nasional yang diperkaya dengan penguatan karakter.</li>
                              <li>Pengembangan kompetensi literasi, numerasi, dan teknologi informasi.</li>
                          </ul>
                      </div>
                  </div>
              </div>
            </div>
          </section>

          {/* Featured Programs Section */}
          <section id="program" className="py-16 sm:py-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Program Unggulan</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Kurikulum terpadu untuk membentuk pribadi paripurna.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredPrograms.map((program) => (
                  <div key={program.title} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:-translate-y-1">
                    <LazyImage
                      className="h-48 w-full object-cover"
                      src={program.imageUrl}
                      alt={program.title}
                      width={600}
                      height={400}
                      placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{program.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{program.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest News Section */}
          <section id="berita" className="py-16 sm:py-24 bg-white dark:bg-gray-800/50">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                   <div className="text-center mb-12">
                       <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Berita & Kegiatan Terbaru</h2>
                       <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Ikuti perkembangan dan prestasi terbaru dari sekolah kami.</p>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {latestNews.map((newsItem) => (
                           <div key={newsItem.title} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                              <LazyImage
                                className="h-48 w-full object-cover rounded-t-2xl"
                                src={newsItem.imageUrl}
                                alt={newsItem.title}
                                width={600}
                                height={400}
                                placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                              />
                              <div className="p-6 flex flex-col flex-grow">
                                   <div className="mb-2">
                                       <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-900 dark:text-green-300">
                                           {newsItem.category}
                                       </span>
                                   </div>
                                   <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white flex-grow">{newsItem.title}</h3>
                                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-auto">{newsItem.date}</p>
                              </div>
                           </div>
                       ))}
                   </div>
               </div>
           </section>
        </main>
      )}

      <Footer onDocsClick={() => setIsDocsOpen(true)} />

        {/* Conditionally render chat window */}
        <ErrorBoundary>
          <Suspense fallback={null}>
            <div
              className={`fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 w-[calc(100vw-2.5rem)] max-w-sm h-[70vh] max-h-[600px] transition-all duration-300 ease-in-out ${
                isChatOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
              }`}
            >
              <ChatWindow isOpen={isChatOpen} closeChat={() => setIsChatOpen(false)} />
            </div>
          </Suspense>
        </ErrorBoundary>

            <LoginModal
              isOpen={isLoginOpen}
              onClose={() => setIsLoginOpen(false)}
              onLoginSuccess={handleLoginSuccess}
            />
            <DocumentationPage
              isOpen={isDocsOpen}
              onClose={() => setIsDocsOpen(false)}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
};

export default App;