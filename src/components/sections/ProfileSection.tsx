
import React from 'react';

const ProfileSection: React.FC = () => {
  return (
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
  );
};

export default ProfileSection;
