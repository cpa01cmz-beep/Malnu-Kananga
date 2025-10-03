import React from 'react';

const DesktopNavigation: React.FC = () => {
  const navLinks = [
    { href: '#home', text: 'Beranda' },
    { href: '#profil', text: 'Profil' },
    { href: '#berita', text: 'Berita' },
    { href: '#kontak', text: 'Kontak' }
  ];

  return (
    <nav className="hidden md:flex items-center space-x-8 font-medium">
      {navLinks.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        >
          {link.text}
        </a>
      ))}
    </nav>
  );
};

export default DesktopNavigation;