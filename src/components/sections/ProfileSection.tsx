
import React from 'react';
import Badge from '../ui/Badge';
import Section from '../ui/Section';

const ProfileSection: React.FC = () => {
  return (
    <Section
      id="profil"
      title="Profil Madrasah"
      subtitle="Mengenal Lebih Dekat MA Malnu Kananga"
      className="bg-gradient-to-b from-white via-neutral-50/60 to-neutral-100/50 dark:from-neutral-800/50 dark:via-neutral-900/40 dark:to-neutral-900/60"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 items-start animate-fade-in-up">
            <div className="lg:col-span-3 text-base sm:text-lg text-neutral-700 dark:text-neutral-300 space-y-8 text-left sm:text-justify leading-relaxed">
                <p>
                    <strong className="text-neutral-900 dark:text-white font-semibold">Madrasah Aliyah MALNU Kananga</strong> adalah lembaga pendidikan menengah atas swasta bernaung di bawah Kementerian Agama Republik Indonesia. Berlokasi di Jalan Desa Kananga Km. 0,5, Kecamatan Menes, Kabupaten Pandeglang, Banten, madrasah ini didirikan pada tahun 2000 dengan tujuan mencetak generasi berakhlak mulia, cerdas, dan siap menghadapi tantangan zaman.
                </p>
                <p>
                    Kurikulum yang digunakan memadukan <strong className="text-neutral-900 dark:text-white font-semibold">pendidikan salafiyah</strong> dengan <strong className="text-neutral-900 dark:text-white font-semibold">pendidikan modern</strong>, termasuk pemantapan keterampilan abad 21 untuk menjawab kebutuhan masa depan.
                </p>
                <div className="flex flex-wrap gap-3.5 pt-3">
                    <Badge 
                        variant="primary" 
                        size="xl" 
                        styleType="solid"
                        rounded
                        className="border border-primary-200/80 dark:border-primary-700/80 shadow-subtle hover:shadow-md hover:bg-primary-200/50 dark:hover:bg-primary-900/70 hover:scale-105 hover:-translate-y-0.5 focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95"
                    >
                        Kemenag RI
                    </Badge>
                    <Badge 
                        variant="info" 
                        size="xl" 
                        styleType="solid"
                        rounded
                        className="border border-blue-200/80 dark:border-blue-700/80 shadow-subtle hover:shadow-md hover:bg-blue-200/50 dark:hover:bg-blue-900/70 hover:scale-105 hover:-translate-y-0.5 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95"
                    >
                        Kurikulum Terpadu
                    </Badge>
                    <Badge 
                        variant="purple" 
                        size="xl" 
                        styleType="solid"
                        rounded
                        className="border border-purple-200/80 dark:border-purple-700/80 shadow-subtle hover:shadow-md hover:bg-purple-200/50 dark:hover:bg-purple-900/70 hover:scale-105 hover:-translate-y-0.5 focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 active:scale-95"
                    >
                        Berakhlak Mulia
                    </Badge>
                </div>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="p-6 sm:p-7 bg-gradient-to-br from-neutral-50 to-neutral-100/80 dark:from-neutral-800 dark:to-neutral-800/80 rounded-xl shadow-card border border-neutral-200/90 dark:border-neutral-700 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-primary-500/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/60 dark:to-primary-900/80 rounded-lg shadow-subtle hover:scale-105 transition-transform duration-200">
                            <svg className="w-5.5 h-5.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400">Visi</h3>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">Melahirkan peserta didik berakhlak mulia, akademis unggul, serta berjiwa wirausaha.</p>
                </div>
                <div className="p-6 sm:p-7 bg-gradient-to-br from-neutral-50 to-neutral-100/80 dark:from-neutral-800 dark:to-neutral-800/80 rounded-xl shadow-card border border-neutral-200/90 dark:border-neutral-700 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-out focus-within:ring-2 focus-within:ring-primary-500/50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/60 dark:to-primary-900/80 rounded-lg shadow-subtle hover:scale-105 transition-transform duration-200">
                            <svg className="w-5.5 h-5.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-primary-600 dark:text-primary-400">Misi</h3>
                    </div>
                    <ul className="space-y-3.5 text-neutral-700 dark:text-neutral-200 text-sm sm:text-base leading-relaxed">
                        <li className="flex items-start gap-3.5">
                            <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary-500 mt-2 shadow-sm"></span>
                            <span>Penguatan pendidikan agama Islam berlandasan nilai salafiyah.</span>
                        </li>
                        <li className="flex items-start gap-3.5">
                            <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary-500 mt-2 shadow-sm"></span>
                            <span>Penerapan kurikulum nasional yang diperkaya dengan penguatan karakter.</span>
                        </li>
                        <li className="flex items-start gap-3.5">
                            <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary-500 mt-2 shadow-sm"></span>
                            <span>Pengembangan kompetensi literasi, numerasi, dan teknologi informasi.</span>
                        </li>
                    </ul>
                </div>
          </div>
        </div>
    </Section>
  );
};

export default ProfileSection;
