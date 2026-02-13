import React from 'react';
import { getResponsiveGradient } from '../config/gradients';
import SocialLink from './ui/SocialLink';
import DisabledLinkButton from './ui/DisabledLinkButton';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './icons/StatusIcons';
import { INFO_EMAIL, APP_CONFIG } from '../constants';

interface FooterProps {
    onDocsClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onDocsClick }) => {
    return (
        <footer id="footer" role="contentinfo" tabIndex={-1} style={{ minHeight: '400px' }} className={`${getResponsiveGradient('FOOTER')} border-t border-neutral-200 dark:border-neutral-700`}>
            <div className="max-w-7xl mx-auto py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16 text-center sm:text-left">
                    <div>
                        <h3 className="text-xl sm:text-lg font-semibold text-neutral-900 dark:text-white mb-4">{APP_CONFIG.SCHOOL_NAME}</h3>
                        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                            {APP_CONFIG.SCHOOL_ADDRESS}
                        </p>
                        {INFO_EMAIL && (
                            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                                <a 
                                    href={`mailto:${INFO_EMAIL}`} 
                                    aria-label={`Kirim email ke ${INFO_EMAIL}`}
                                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-neutral-800 rounded px-1 py-0.5 font-medium"
                                >
                                    {INFO_EMAIL}
                                </a>
                            </p>
                        )}
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
                                <li>
                                    <DisabledLinkButton disabledReason="Area Download akan tersedia segera">
                                        Download
                                    </DisabledLinkButton>
                                </li>
                                <li>
                                    <DisabledLinkButton disabledReason="Kebijakan Privasi akan tersedia segera">
                                        Kebijakan Privasi
                                    </DisabledLinkButton>
                                </li>
                                <li>
                                    <DisabledLinkButton disabledReason="Informasi Karir akan tersedia segera">
                                        Karir
                                    </DisabledLinkButton>
                                </li>
                                <li>
                                    <DisabledLinkButton disabledReason="Informasi Beasiswa akan tersedia segera">
                                        Beasiswa
                                    </DisabledLinkButton>
                                </li>
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
