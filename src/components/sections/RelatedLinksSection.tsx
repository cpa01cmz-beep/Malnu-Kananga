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
            <div className="text-center mb-16 animate-fade-in">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-5">Tautan Terkait</h2>
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed font-medium">Akses cepat ke portal dan layanan terkait.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center p-7 sm:p-9 bg-white/90 dark:bg-neutral-800/90 rounded-2xl shadow-card hover:shadow-float transition-all duration-300 transform hover:-translate-y-1 hover:bg-white dark:hover:bg-neutral-700 border border-neutral-200/90 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800"
                    >
                        <div className={`flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full ${link.color} transition-transform duration-300 group-hover:scale-110 shadow-sm`}>
                            {link.icon}
                        </div>
                        <span className="mt-4 sm:mt-5 font-bold text-center text-sm sm:text-base text-neutral-700 dark:text-neutral-200">{link.name}</span>
                    </a>
                ))}
            </div>
        </div>
    </section>
  );
};

export default RelatedLinksSection;