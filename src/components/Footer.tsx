import React from 'react';
import { getResponsiveGradient } from '../config/gradients';
import SocialLink from './ui/SocialLink';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './icons/StatusIcons';
import { INFO_EMAIL, APP_CONFIG } from '../constants';

interface FooterProps {
    onDocsClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onDocsClick }) => {
    return (
        <footer id="footer" role="contentinfo" tabIndex={-1} className={`${getResponsiveGradient('FOOTER')} border-t border-neutral-200 dark:border-neutral-700`}>
            <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 text-center sm:text-left">
                    <div>
                        <h3 className="text-xl sm:text-lg font-semibold text-neutral-900 dark:text-white mb-4">{APP_CONFIG.SCHOOL_NAME}</h3>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                            {APP_CONFIG.SCHOOL_ADDRESS}
                        </p>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                            <a href={`mailto:${INFO_EMAIL}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium">{INFO_EMAIL}</a>
                        </p>
                    </div>

                    <div>
                          <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white mb-4">Legalitas</h3>
                            <ul className="space-y-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                                <li><strong className="text-neutral-900 dark:text-white font-semibold">No. SK. Pendirian:</strong> {APP_CONFIG.SK_PENDIRIAN.NUMBER}</li>
                                <li><strong className="text-neutral-900 dark:text-white font-semibold">Tgl. SK. Pendirian:</strong> {APP_CONFIG.SK_PENDIRIAN.DATE}</li>
                                <li><strong className="text-neutral-900 dark:text-white font-semibold">No. SK Operasional:</strong> {APP_CONFIG.SK_OPERASIONAL.NUMBER}</li>
                                <li><strong className="text-neutral-900 dark:text-white font-semibold">Tgl. SK Operasional:</strong> {APP_CONFIG.SK_OPERASIONAL.DATE}</li>
                           </ul>
                    </div>

                     <div className="sm:justify-self-end">
                        <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white mb-4">Tautan Bermanfaat</h3>
                          <ul className="space-y-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                                <li><button type="button" onClick={onDocsClick} className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium">Pusat Bantuan</button></li>
                                <li><button 
                                    type="button" 
                                    onClick={() => {}} 
                                    disabled 
                                    className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium cursor-not-allowed opacity-60 relative group"
                                    title="Area Download akan tersedia segera"
                                    aria-label="Download - Area Download akan tersedia segera"
                                >
                                    Download
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium bg-neutral-800 dark:bg-neutral-700 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                        Area Download akan tersedia segera
                                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"></span>
                                    </span>
                                </button></li>
                                <li><button 
                                    type="button" 
                                    onClick={() => {}} 
                                    disabled 
                                    className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium cursor-not-allowed opacity-60 relative group"
                                    title="Kebijakan Privasi akan tersedia segera"
                                    aria-label="Kebijakan Privasi - Kebijakan Privasi akan tersedia segera"
                                >
                                    Kebijakan Privasi
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium bg-neutral-800 dark:bg-neutral-700 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                        Kebijakan Privasi akan tersedia segera
                                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"></span>
                                    </span>
                                </button></li>
                                <li><button 
                                    type="button" 
                                    onClick={() => {}} 
                                    disabled 
                                    className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium cursor-not-allowed opacity-60 relative group"
                                    title="Informasi Karir akan tersedia segera"
                                    aria-label="Karir - Informasi Karir akan tersedia segera"
                                >
                                    Karir
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium bg-neutral-800 dark:bg-neutral-700 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                        Informasi Karir akan tersedia segera
                                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"></span>
                                    </span>
                                </button></li>
                                <li><button 
                                    type="button" 
                                    onClick={() => {}} 
                                    disabled 
                                    className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium cursor-not-allowed opacity-60 relative group"
                                    title="Informasi Beasiswa akan tersedia segera"
                                    aria-label="Beasiswa - Informasi Beasiswa akan tersedia segera"
                                >
                                    Beasiswa
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs font-medium bg-neutral-800 dark:bg-neutral-700 text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                                        Informasi Beasiswa akan tersedia segera
                                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-700"></span>
                                    </span>
                                </button></li>
                          </ul>
                             <div className="flex justify-center sm:justify-start gap-3 mt-6">
                                <SocialLink
                                    icon={<FacebookIcon />}
                                    label="Facebook"
                                    variant="default"
                                    size="lg"
                                    disabled
                                    disabledReason="Facebook akan tersedia segera"
                                />
                                <SocialLink
                                    icon={<InstagramIcon />}
                                    label="Instagram"
                                    variant="default"
                                    size="lg"
                                    disabled
                                    disabledReason="Instagram akan tersedia segera"
                                />
                                <SocialLink
                                    icon={<YoutubeIcon />}
                                    label="YouTube"
                                    variant="default"
                                    size="lg"
                                    disabled
                                    disabledReason="YouTube akan tersedia segera"
                                />
                            </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-neutral-200 dark:border-neutral-700 pt-8">
                    <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 text-center">&copy; {new Date().getFullYear()} {APP_CONFIG.SCHOOL_NAME}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
