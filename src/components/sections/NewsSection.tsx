
import React from 'react';
import NewsCard from '../NewsCard';
import { LatestNews } from '../../types';

interface NewsSectionProps {
  news: LatestNews[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  return (
    <section id="berita" className="py-16 sm:py-24 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Berita & Kegiatan Terbaru</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Ikuti perkembangan dan prestasi terbaru dari sekolah kami.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {news.map((newsItem) => (
                    <NewsCard key={newsItem.title} newsItem={newsItem} />
                ))}
            </div>
        </div>
    </section>
  );
};

export default NewsSection;
