import React from 'react';
import { getResponsiveGradient } from '../config/gradients';
import SocialLink from './ui/SocialLink';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './icons/StatusIcons';

interface FooterProps {
    onDocsClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onDocsClick }) => {
    return (
        <footer id="footer" role="contentinfo" tabIndex={-1} className={`${getResponsiveGradient('FOOTER')} border-t border-neutral-200 dark:border-neutral-700`}>
            <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 text-center sm:text-left">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white mb-4">MA Malnu Kananga</h3>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                            Jalan Desa Kananga Km. 0,5, Kananga, Kec. Menes, Kab. Pandeglang, Banten
                        </p>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                            <a href="mailto:info@ma-malnukananga.sch.id" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium">info@ma-malnukananga.sch.id</a>
                        </p>
                    </div>

                    <div>
                          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white mb-4">Legalitas</h3>
                            <ul className="space-y-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                                <li><strong className="text-neutral-900 dark:text-white font-semibold">No. SK. Pendirian:</strong> D/Wi/MA./101/2000</li>
                                <li><strong className="text-neutral-900 dark:text-white font-semibold">Tgl. SK. Pendirian:</strong> 20-09-2000</li>
                                <li><strong className="text-neutral-900 dark:text-white font-semibold">No. SK Operasional:</strong> D/Wi/MA./101/2000</li>
                                <li><strong className="text-neutral-900 dark:text-white font-semibold">Tgl. SK Operasional:</strong> 20-09-2000</li>
                           </ul>
                    </div>

                    <div className="sm:justify-self-end">
                        <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white mb-4">Tautan Bermanfaat</h3>
                          <ul className="space-y-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                                <li><button type="button" onClick={onDocsClick} className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium">Pusat Bantuan</button></li>
                                <li><button type="button" onClick={() => {}} disabled className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium cursor-not-allowed opacity-60">Download</button></li>
                                <li><button type="button" onClick={() => {}} disabled className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium cursor-not-allowed opacity-60">Kebijakan Privasi</button></li>
                                <li><button type="button" onClick={() => {}} disabled className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium cursor-not-allowed opacity-60">Karir</button></li>
                                <li><button type="button" onClick={() => {}} disabled className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium cursor-not-allowed opacity-60">Beasiswa</button></li>
                          </ul>
                           <div className="flex justify-center sm:justify-start gap-3 mt-6">
                                <SocialLink
                                    icon={<FacebookIcon />}
                                    label="Facebook"
                                    variant="default"
                                    size="lg"
                                    disabled
                                    onClick={() => {}}
                                />
                                <SocialLink
                                    icon={<InstagramIcon />}
                                    label="Instagram"
                                    variant="default"
                                    size="lg"
                                    disabled
                                    onClick={() => {}}
                                />
                                <SocialLink
                                    icon={<YoutubeIcon />}
                                    label="YouTube"
                                    variant="default"
                                    size="lg"
                                    disabled
                                    onClick={() => {}}
                                />
                            </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-neutral-200 dark:border-neutral-700 pt-8">
                    <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 text-center">&copy; {new Date().getFullYear()} MA Malnu Kananga. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
