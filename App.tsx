import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal'; // Import the new modal
import DocumentTextIcon from './components/icons/DocumentTextIcon';
import BuildingLibraryIcon from './components/icons/BuildingLibraryIcon';
import ClipboardDocumentCheckIcon from './components/icons/ClipboardDocumentCheckIcon';
import UsersIcon from './components/icons/UsersIcon';
import InformationCircleIcon from './components/icons/InformationCircleIcon';

const featuredPrograms = [
  {
    title: 'Tahfidz Al-Qur\'an',
    description: 'Program intensif menghafal Al-Qur\'an dengan bimbingan ustadz/ustadzah berkompeten.',
    imageUrl: 'https://images.unsplash.com/photo-1599339942293-86b72a38547b?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
  },
  {
    title: 'Kajian Kitab Kuning',
    description: 'Pendalaman khazanah Islam klasik melalui kajian kitab-kitab kuning oleh para ahli.',
    imageUrl: 'https://images.unsplash.com/photo-1585056701393-85835978f84e?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
  },
  {
    title: 'Sains & Teknologi',
    description: 'Mengintegrasikan ilmu pengetahuan modern dengan nilai-nilai Islam untuk mencetak generasi unggul.',
    imageUrl: 'https://images.unsplash.com/photo-1532187643623-8f691689017a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
  }
];

const latestNews = [
    {
        title: 'MA Malnu Kananga Raih Juara 1 Lomba Cerdas Cermat Tingkat Kabupaten',
        date: '15 Juli 2024',
        category: 'Prestasi',
        imageUrl: 'https://images.unsplash.com/photo-1571260899204-42aebca5a2aa?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
    },
    {
        title: 'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2025/2026 Resmi Dibuka',
        date: '10 Juli 2024',
        category: 'Sekolah',
        imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
    },
    {
        title: 'Kegiatan Bakti Sosial Sukses Digelar di Desa Sekitar Sekolah',
        date: '5 Juli 2024',
        category: 'Kegiatan',
        imageUrl: 'https://images.unsplash.com/photo-1618494955439-78a25c1b698a?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600'
    }
];

const relatedLinks = [
    {
        name: 'RDM Malnu Kananga',
        href: 'https://rdm.ma-malnukananga.sch.id',
        icon: <DocumentTextIcon />,
        color: 'bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400'
    },
    {
        name: 'Kemenag RI',
        href: 'https://kemenag.go.id',
        icon: <BuildingLibraryIcon />,
        color: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
    },
    {
        name: 'EMIS Pendis',
        href: 'https://emis.kemenag.go.id',
        icon: <ClipboardDocumentCheckIcon />,
        color: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
    },
    {
        name: 'Simpatika',
        href: 'https://simpatika.kemenag.go.id',
        icon: <UsersIcon />,
        color: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
    }
];


const App: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginOpen(false); // Close modal on successful login
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 w-full min-h-screen font-sans text-gray-800 dark:text-gray-200">
      <Header 
        onLoginClick={() => setIsLoginOpen(true)} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      
      {isLoggedIn ? (
        <main className="pt-24 sm:pt-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center bg-white dark:bg-gray-800/50 p-8 rounded-2xl shadow-lg">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Portal Siswa</h1>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                      Selamat datang kembali! Area ini sedang dalam pengembangan.
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Fitur-fitur seperti jadwal pelajaran, nilai, dan materi akan segera tersedia di sini.
                    </p>
                </div>
            </div>
        </main>
      ) : (
        <main>
          {/* Hero Section */}
          <section id="home" className="relative min-h-dvh flex items-center justify-center text-center px-4 pt-24 pb-12 sm:pt-32">
            <div className="absolute inset-0 bg-gradient-to-b from-green-100/80 to-transparent dark:from-green-900/40 dark:to-transparent"></div>
            <div className="relative z-10 animate-fade-in-up pb-20">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
                MA Malnu Kananga
              </h1>
              <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
                Mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="#ppdb" className="bg-green-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50">
                  Info PPDB 2025
                </a>
                <a href="#profil" className="bg-white dark:bg-gray-700 text-green-600 dark:text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-opacity-50">
                  Jelajahi Profil
                </a>
              </div>
            </div>
            
            {/* Chatbot CTA - Positioned within Hero */}
            <div className="absolute bottom-0 left-0 right-0 bg-green-50 dark:bg-green-900/20 py-4 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-center gap-3 text-green-800 dark:text-green-200">
                      <InformationCircleIcon />
                      <p className="text-sm sm:text-base font-medium text-center">
                          Punya pertanyaan seputar sekolah? Coba tanyakan pada <span className="font-bold">Asisten AI</span> kami di pojok kanan bawah!
                      </p>
                  </div>
              </div>
            </div>
          </section>

          {/* Related Links Section */}
          <section id="tautan" className="py-12 sm:py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <img className="h-48 w-full object-cover" src={program.imageUrl} alt={program.title} />
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
                              <img className="h-48 w-full object-cover rounded-t-2xl" src={newsItem.imageUrl} alt={newsItem.title} />
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

      <Footer />
      <ChatWidget />
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default App;