
import React from 'react';
import { RELATED_LINKS } from '../../data/defaults';

const RelatedLinksSection: React.FC = () => {
  return (
    <section id="tautan" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                {RELATED_LINKS.map((link) => (
                    <a 
                        key={link.name} 
                        href={link.href} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="group flex flex-col items-center p-4 sm:p-6 bg-gray-100/50 dark:bg-gray-800/50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:bg-white dark:hover:bg-gray-700"
                    >
                        <div className={`flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full ${link.color} transition-colors duration-300`}>
                            {link.icon}
                        </div>
                        <span className="mt-4 font-semibold text-center text-sm sm:text-base text-gray-700 dark:text-gray-200">{link.name}</span>
                    </a>
                ))}
            </div>
        </div>
    </section>
  );
};

export default RelatedLinksSection;
