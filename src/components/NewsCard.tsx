
import React from 'react';
import { LatestNews } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface NewsCardProps {
  newsItem: LatestNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-xl shadow-card hover:shadow-card-hover border border-neutral-200/80 dark:border-neutral-700/80 transition-all duration-300 ease-out overflow-hidden flex flex-col h-full group focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:-translate-y-0.5 hover:scale-[1.01]">
      <div className="relative overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-700">
        <ImageWithFallback
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          src={newsItem.imageUrl}
          alt={newsItem.title}
          fallbackText="Gambar Berita Tidak Tersedia"
        />
        <div className="absolute top-3 left-3">
          <span className="text-xs font-medium inline-block py-1.5 px-3 uppercase tracking-wide rounded-full text-primary-700 dark:text-primary-300 bg-primary-100/95 dark:bg-primary-900/95 backdrop-blur-sm shadow-subtle">
            {newsItem.category}
          </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-neutral-900 dark:text-white flex-grow leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">{newsItem.title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-auto flex items-center gap-2 font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {newsItem.date}
        </p>
      </div>
    </article>
  );
};

export default NewsCard;