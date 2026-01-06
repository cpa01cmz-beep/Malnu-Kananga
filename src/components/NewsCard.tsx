
import React from 'react';
import { LatestNews } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface NewsCardProps {
  newsItem: LatestNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-2xl shadow-card hover:shadow-float border border-neutral-200 dark:border-neutral-700 transition-all duration-300 overflow-hidden flex flex-col h-full group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:-translate-y-1">
      <div className="relative overflow-hidden aspect-video">
        <ImageWithFallback
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={newsItem.imageUrl}
          alt={newsItem.title}
          fallbackText="Gambar Berita Tidak Tersedia"
        />
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
          <span className="text-xs font-bold inline-block py-1.5 px-3 sm:px-3.5 uppercase tracking-wide rounded-full text-primary-700 dark:text-primary-300 bg-primary-100/95 dark:bg-primary-900/90 backdrop-blur-md shadow-subtle">
            {newsItem.category}
          </span>
        </div>
      </div>
      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-neutral-900 dark:text-white flex-grow leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">{newsItem.title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-auto flex items-center gap-2 sm:gap-2.5 font-medium">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {newsItem.date}
        </p>
      </div>
    </article>
  );
};

export default NewsCard;