
import React from 'react';
import { LatestNews } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface NewsCardProps {
  newsItem: LatestNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-card-lg shadow-card hover:shadow-card-hover border border-neutral-200 dark:border-neutral-700 transition-all duration-300 overflow-hidden flex flex-col h-full group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 transform hover:-translate-y-1">
      <ImageWithFallback
        className="h-48 w-full object-cover"
        src={newsItem.imageUrl}
        alt={newsItem.title}
        fallbackText="Gambar Berita Tidak Tersedia"
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-3">
          <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase tracking-wide rounded-full text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900">
            {newsItem.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white flex-grow leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">{newsItem.title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-auto">{newsItem.date}</p>
      </div>
    </article>
  );
};

export default NewsCard;