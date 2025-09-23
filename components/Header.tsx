import React, { useState, useEffect } from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { CloseIcon } from './icons/CloseIcon';

const NavLinks = () => (
    <>
        <a href="#home" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Beranda</a>
        <a href="#profil" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Profil</a>
        <a href="#berita" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Berita</a>
        <a href="#download" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Download</a>
        <a href="#login-email" className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors">Login Email</a>
    </>
);

interface HeaderProps {
    onLoginClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const headerClasses = `
        fixed top-0 left-0 right-0 z-40 transition-all duration-300
        ${isScrolled ? 'mt-0 rounded-none shadow-md' : 'mt-4 mx-2 sm:mx-4 rounded-full'}
    `;

    const navContainerClasses = `
        w-full max-w-7xl mx-auto px-4
        ${isScrolled ? '' : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-full ring-1 ring-gray-900/5 dark:ring-white/10 shadow-lg shadow-black/5'}
    `;

    const innerNavClasses = `
        flex items-center justify-between h-16
        ${isScrolled ? 'bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg' : ''}
    `;

    return (
        <header className={headerClasses}>
            <div className={navContainerClasses}>
                 <div className={`${innerNavClasses} ${isScrolled ? 'max-w-7xl mx-auto px-4' : ''}`}>
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            M
                        </div>
                        <div>
                            <span className="font-bold text-lg text-gray-800 dark:text-white leading-tight">Malnu Kananga</span>
                            <span className="block text-xs text-gray-500 dark:text-gray-400 leading-tight tracking-wider">NPSN: 69881502</span>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-8 font-medium">
                        <NavLinks />
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button onClick={onLoginClick} className="hidden sm:block bg-green-600 text-white px-5 py-2 rounded-full font-semibold text-sm hover:bg-green-700 transition-colors">
                            Login
                        </button>
                        {/* Mobile Menu Button */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Buka menu">
                            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg mx-2 sm:mx-4 rounded-2xl mt-2 p-4">
                    <nav className="flex flex-col space-y-4 font-medium">
                        <NavLinks />
                         <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="bg-green-600 text-white text-center px-5 py-2 rounded-full font-semibold text-sm hover:bg-green-700 transition-colors">
                            Login
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;