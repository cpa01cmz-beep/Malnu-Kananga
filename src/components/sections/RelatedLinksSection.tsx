import React, { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { getResponsiveGradient } from '../../config/gradients';
import { getColorIconLabel } from '../../config/colorIcons';
import LinkCard from '../ui/LinkCard';

const RelatedLinksSection: React.FC = () => {
  const [links, setLinks] = useState<{name: string; href: string; icon: React.ReactNode; colorClass: string}[]>([]);

  useEffect(() => {
    const loadLinks = async () => {
      try {
        const { getRelatedLinks } = await import('../../data/defaults');
        const relatedLinks = await getRelatedLinks();
        setLinks(relatedLinks as unknown as typeof links);
      } catch (error) {
        logger.error('Failed to load related links:', error);
      }
    };
    loadLinks();
  }, []);

  const getAriaLabel = (name: string, color: string): string => {
    const colorLabel = getColorIconLabel(color);
    return `${colorLabel} untuk ${name} (membuka di tab baru)`;
  };

  return (
    <section id="tautan" className={`py-20 sm:py-24 ${getResponsiveGradient('RELATED_LINKS')}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">Tautan Terkait</h2>
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">Akses cepat ke portal dan layanan terkait.</p>
            </div>
            <nav aria-label="Tautan terkait eksternal">
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-6" role="list">
                    {links.map((link) => (
                        <LinkCard
                            key={link.name}
                            name={link.name}
                            href={link.href}
                            icon={link.icon}
                            colorClass={link.colorClass}
                            ariaLabel={getAriaLabel(link.name, link.colorClass)}
                        />
                    ))}
                </ul>
            </nav>
        </div>
    </section>
  );
};

export default RelatedLinksSection;