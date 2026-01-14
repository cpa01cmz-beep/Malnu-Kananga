
import React from 'react';
import Badge from '../ui/Badge';
import Section from '../ui/Section';
import { getResponsiveGradient } from '../../config/gradients';
import { GRADIENT_CLASSES } from '../../config/gradients';

const ProfileSection: React.FC = () => {
  return (
    <Section
      id="profil"
      title="Profil Madrasah"
      subtitle="Mengenal Lebih Dekat MA Malnu Kananga"
      className={getResponsiveGradient('PROFILE')}
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
                    <Badge variant="primary" size="xl" styleType="solid" rounded>
                        Kemenag RI
                    </Badge>
                    <Badge variant="info" size="xl" styleType="solid" rounded>
                        Kurikulum Terpadu
                    </Badge>
                    <Badge variant="secondary" size="xl" styleType="solid" rounded>
                        Berakhlak Mulia
                    </Badge>
                </div>
            </div>
             <div className="lg:col-span-2 space-y-6">
                <article
                  className={`w-full p-6 sm:p-7 ${getResponsiveGradient('NEUTRAL')} rounded-xl shadow-card border border-neutral-200/90 dark:border-neutral-700`}
                  aria-labelledby="visi-heading"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 ${GRADIENT_CLASSES.PRIMARY_LIGHT} dark:from-primary-900/60 dark:to-primary-900/80 rounded-lg shadow-subtle hover:scale-105 transition-transform duration-200`} aria-hidden="true">
                            <svg className="w-5.5 h-5.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 id="visi-heading" className="text-xl font-semibold text-primary-600 dark:text-primary-400">Visi</h3>
                    </div>
                    <p className="text-neutral-700 dark:text-neutral-200 leading-relaxed">Melahirkan peserta didik berakhlak mulia, akademis unggul, serta berjiwa wirausaha.</p>
                </article>
                <article
                  className={`w-full p-6 sm:p-7 ${getResponsiveGradient('NEUTRAL')} rounded-xl shadow-card border border-neutral-200/90 dark:border-neutral-700`}
                  aria-labelledby="misi-heading"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 ${GRADIENT_CLASSES.PRIMARY_LIGHT} dark:from-primary-900/60 dark:to-primary-900/80 rounded-lg shadow-subtle hover:scale-105 transition-transform duration-200`} aria-hidden="true">
                            <svg className="w-5.5 h-5.5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <h3 id="misi-heading" className="text-xl font-semibold text-primary-600 dark:text-primary-400">Misi</h3>
                    </div>
                    <ul className="space-y-3.5 text-neutral-700 dark:text-neutral-200 text-sm sm:text-base leading-relaxed">
                        <li className="flex items-start gap-3.5">
                            <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary-500 mt-2 shadow-sm" aria-hidden="true"></span>
                            <span>Penguatan pendidikan agama Islam berlandasan nilai salafiyah.</span>
                        </li>
                        <li className="flex items-start gap-3.5">
                            <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary-500 mt-2 shadow-sm" aria-hidden="true"></span>
                            <span>Penerapan kurikulum nasional yang diperkaya dengan penguatan karakter.</span>
                        </li>
                        <li className="flex items-start gap-3.5">
                            <span className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-primary-500 mt-2 shadow-sm" aria-hidden="true"></span>
                            <span>Pengembangan kompetensi literasi, numerasi, dan teknologi informasi.</span>
                        </li>
                    </ul>
                </article>
          </div>
        </div>
    </Section>
  );
};

export default ProfileSection;
