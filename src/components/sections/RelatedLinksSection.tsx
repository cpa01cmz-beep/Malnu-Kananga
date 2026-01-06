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
    <section id="tautan" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">Tautan Terkait</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {links.map((link) => (
                    <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col items-center p-6 sm:p-8 bg-neutral-100/50 dark:bg-neutral-800/50 rounded-card-lg shadow-card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1 hover:bg-white dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700"
                    >
                        <div className={`flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full ${link.color} transition-colors duration-300`}>
                            {link.icon}
                        </div>
                        <span className="mt-4 font-semibold text-center text-sm sm:text-base text-neutral-700 dark:text-neutral-200">{link.name}</span>
                    </a>
                ))}
            </div>
        </div>
    </section>
  );
};

export default RelatedLinksSection;