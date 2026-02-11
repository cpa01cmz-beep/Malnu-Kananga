import React from 'react';
import { getResponsiveGradient } from '../../config/gradients';
import { getColorIconLabel } from '../../config/colorIcons';
import { getRelatedLinks } from '../../data/defaults';
import LinkCard from '../ui/LinkCard';
import Heading from '../ui/Heading';

const RelatedLinksSection: React.FC = () => {
  const links = getRelatedLinks();
  const headingId = 'tautan-heading';

  const getAriaLabel = (name: string, color: string): string => {
    const colorLabel = getColorIconLabel(color);
    return `${colorLabel} untuk ${name} (membuka di tab baru)`;
  };

  return (
    <section id="tautan" aria-labelledby={headingId} className={`py-20 sm:py-24 ${getResponsiveGradient('RELATED_LINKS')}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
                <Heading
                  id={headingId}
                  level={2}
                  size="4xl"
                  weight="bold"
                  tracking="tight"
                  className="sm:text-5xl md:text-6xl mb-4"
                >
                  Tautan Terkait
                </Heading>
                <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">Akses cepat ke portal dan layanan terkait.</p>
            </div>
            <nav aria-label="Tautan terkait eksternal">
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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