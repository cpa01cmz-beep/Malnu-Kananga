
import React from 'react';
import { LatestNews } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface NewsCardProps {
  newsItem: LatestNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-card-lg shadow-card hover:shadow-card-hover border border-neutral-200 dark:border-neutral-700 transition-all duration-300 overflow-hidden flex flex-col h-full group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 hover:-translate-y-0.5">
      <ImageWithFallback
        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
        src={newsItem.imageUrl}
        alt={newsItem.title}
        fallbackText="Gambar Berita Tidak Tersedia"
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-2.5">
          <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase tracking-wide rounded-lg text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/30">
            {newsItem.category}
          </span>
        </div>
        <h3 className="text-base font-semibold mb-2 text-neutral-900 dark:text-white flex-grow leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 line-clamp-2">{newsItem.title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-auto">{newsItem.date}</p>
      </div>
    </article>
  );
};

export default NewsCard;