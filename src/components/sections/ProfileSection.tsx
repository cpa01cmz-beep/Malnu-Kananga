
import React from 'react';

const ProfileSection: React.FC = () => {
  return (
    <section id="profil" className="py-20 sm:py-24 bg-white dark:bg-neutral-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight">Profil Madrasah</h2>
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">Mengenal Lebih Dekat MA Malnu Kananga</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center animate-fade-in-up">
            <div className="lg:col-span-3 text-lg text-neutral-700 dark:text-neutral-300 space-y-6 text-left sm:text-justify leading-relaxed">
                <p>
                    <strong>Madrasah Aliyah MALNU Kananga</strong> adalah lembaga pendidikan menengah atas swasta bernaung di bawah Kementerian Agama Republik Indonesia. Berlokasi di Jalan Desa Kananga Km. 0,5, Kecamatan Menes, Kabupaten Pandeglang, Banten, madrasah ini didirikan pada tahun 2000 dengan tujuan mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
                </p>
                <p>
                    Kurikulum yang digunakan memadukan <strong>pendidikan salafiyah</strong> dengan <strong>pendidikan modern</strong>, termasuk pemantapan keterampilan abad 21 untuk menjawab kebutuhan masa depan.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                        Kemenag RI
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Kurikulum Terpadu
                    </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        Berakhlak Mulia
                    </span>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="p-8 bg-neutral-50 dark:bg-neutral-800 rounded-card-lg shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4">Visi</h3>
                    <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">Melahirkan peserta didik berakhlak mulia, akademis unggul, serta berjiwa wirausaha.</p>
                </div>
                <div className="p-8 bg-neutral-50 dark:bg-neutral-800 rounded-card-lg shadow-card border border-neutral-200 dark:border-neutral-700 hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1">
                    <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 mb-4">Misi</h3>
                    <ul className="list-disc list-inside text-neutral-700 dark:text-neutral-200 space-y-3">
                        <li>Penguatan pendidikan agama Islam berlandaskan nilai salafiyah.</li>
                        <li>Penerapan kurikulum nasional yang diperkaya dengan penguatan karakter.</li>
                        <li>Pengembangan kompetensi literasi, numerasi, dan teknologi informasi.</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
