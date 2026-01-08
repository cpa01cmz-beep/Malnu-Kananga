
import React from 'react';
import NewsCard from '../NewsCard';
import { LatestNews } from '../../types';
import Section from '../ui/Section';

interface NewsSectionProps {
  news: LatestNews[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  return (
    <Section
      id="berita"
      title="Berita & Kegiatan Terbaru"
      subtitle="Ikuti perkembangan dan prestasi terbaru dari sekolah kami."
      className="bg-gradient-to-b from-neutral-50/70 via-white to-neutral-50/50 dark:from-neutral-900/50 dark:via-neutral-800/60 dark:to-neutral-900/40"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {news.map((newsItem) => (
          <NewsCard key={newsItem.title} newsItem={newsItem} />
        ))}
      </div>
    </Section>
  );
};

export default NewsSection;
