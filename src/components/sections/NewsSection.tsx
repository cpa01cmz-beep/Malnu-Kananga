
import React from 'react';
import NewsCard from '../NewsCard';
import { LatestNews } from '../../types';

interface NewsSectionProps {
  news: LatestNews[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  return (
    <section id="berita" className="py-20 sm:py-24 bg-gradient-to-b from-neutral-50/70 via-white to-neutral-50/50 dark:from-neutral-900/50 dark:via-neutral-800/60 dark:to-neutral-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16 animate-fade-in">
                <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">Berita & Kegiatan Terbaru</h2>
                <p className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto leading-relaxed">Ikuti perkembangan dan prestasi terbaru dari sekolah kami.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {news.map((newsItem) => (
                    <NewsCard key={newsItem.title} newsItem={newsItem} />
                ))}
            </div>
        </div>
    </section>
  );
};

export default NewsSection;
