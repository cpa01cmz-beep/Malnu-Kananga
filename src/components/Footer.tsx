import React from 'react';

const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-instagram"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const YoutubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-youtube"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 11.75a29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

interface FooterProps {
    onDocsClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onDocsClick }) => {
    return (
        <footer id="kontak" className="bg-gradient-to-t from-primary-100/80 to-transparent dark:from-primary-900/40 dark:to-transparent border-t border-neutral-200 dark:border-neutral-700/50">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
                    <div>
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">MA Malnu Kananga</h3>
                        <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400 leading-relaxed">
                            Jalan Desa Kananga Km. 0,5, Kananga, Kec. Menes, Kab. Pandeglang, Banten
                        </p>
                        <p className="mt-1 text-base text-neutral-500 dark:text-neutral-400">
                            <a href="mailto:info@ma-malnukananga.sch.id" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">info@ma-malnukananga.sch.id</a>
                        </p>
                    </div>

                    <div>
                         <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Legalitas</h3>
                         <ul className="mt-2 space-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                            <li><strong>No. SK. Pendirian:</strong> D/Wi/MA./101/2000</li>
                            <li><strong>Tgl. SK. Pendirian:</strong> 20-09-2000</li>
                            <li className="pt-1"><strong>No. SK Operasional:</strong> D/Wi/MA./101/2000</li>
                            <li><strong>Tgl. SK Operasional:</strong> 20-09-2000</li>
                        </ul>
                    </div>

                    <div className="sm:justify-self-end">
                        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Tautan Bermanfaat</h3>
                         <ul className="mt-2 space-y-1 text-base text-neutral-500 dark:text-neutral-400">
                              <li><button onClick={onDocsClick} className="hover:text-primary-600 dark:hover:text-primary-400 text-left transition-colors">Pusat Bantuan</button></li>
                              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Download</a></li>
                              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Kebijakan Privasi</a></li>
                              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Karir</a></li>
                              <li><a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Beasiswa</a></li>
                         </ul>
                        <div className="flex justify-center sm:justify-start space-x-6 mt-6">
                            <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                                <span className="sr-only">Facebook</span>
                                <FacebookIcon />
                            </a>
                            <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                                <span className="sr-only">Instagram</span>
                                <InstagramIcon />
                            </a>
                            <a href="#" className="text-neutral-400 hover:text-primary-600 transition-colors">
                                <span className="sr-only">YouTube</span>
                                <YoutubeIcon />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-neutral-200 dark:border-neutral-700 pt-8">
                    <p className="text-base text-neutral-400 text-center">&copy; {new Date().getFullYear()} MA Malnu Kananga. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;