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


const Footer: React.FC = () => {
    return (
        <footer id="kontak" className="bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">MA Malnu Kananga</h3>
                        <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
                            Jl. Pendidikan No. 1, Kananga, Menes, Pandeglang, Banten 42262
                        </p>
                    </div>
                    <div className="md:justify-self-center">
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tautan Cepat</h3>
                         <ul className="mt-2 space-y-1">
                            <li><a href="#program" className="text-base text-gray-500 dark:text-gray-400 hover:text-green-600">Program</a></li>
                            <li><a href="#berita" className="text-base text-gray-500 dark:text-gray-400 hover:text-green-600">Berita</a></li>
                            <li><a href="#ppdb" className="text-base text-gray-500 dark:text-gray-400 hover:text-green-600">PPDB</a></li>
                         </ul>
                    </div>
                    <div className="md:justify-self-end">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ikuti Kami</h3>
                        <div className="flex justify-center md:justify-start space-x-6 mt-2">
                            <a href="#" className="text-gray-400 hover:text-green-600">
                                <span className="sr-only">Facebook</span>
                                <FacebookIcon />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-600">
                                <span className="sr-only">Instagram</span>
                                <InstagramIcon />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-green-600">
                                <span className="sr-only">YouTube</span>
                                <YoutubeIcon />
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                    <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} MA Malnu Kananga. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
