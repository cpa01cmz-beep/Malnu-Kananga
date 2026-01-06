import React, { useState, useEffect } from 'react';

const RelatedLinksSection: React.FC = () => {
  const [links, setLinks] = useState<{name: string; href: string; icon: React.ReactNode; color: string}[]>([]);

  useEffect(() => {
    const loadLinks = async () => {
      const { getRelatedLinks } = await import('../../data/defaults');
      const relatedLinks = await getRelatedLinks();
      setLinks(relatedLinks as unknown as typeof links);
    };
    loadLinks();
  }, []);

  return (
    <section id="tautan" className="py-20 sm:py-24 bg-gradient-to-b from-white to-neutral-50/60 dark:from-neutral-800/60 dark:to-neutral-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4 sm:mb-5">Tautan Terkait</h2>
                <p className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">Akses cepat ke portal dan layanan terkait.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center p-6 sm:p-7 lg:p-9 bg-white dark:bg-neutral-800 rounded-xl shadow-card hover:shadow-float transition-all duration-300 transform hover:-translate-y-1 hover:bg-white dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
                    >
                        <div className={`flex items-center justify-center h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-full ${link.color} transition-transform duration-300 group-hover:scale-110 shadow-subtle`}>
                            {link.icon}
                        </div>
                        <span className="mt-3 sm:mt-4 lg:mt-5 font-bold text-center text-sm sm:text-base text-neutral-700 dark:text-neutral-200">{link.name}</span>
                    </a>
                ))}
            </div>
        </div>
    </section>
  );
};

export default RelatedLinksSection;