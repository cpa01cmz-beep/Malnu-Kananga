
import React from 'react';
import { LatestNews } from '../types';
import ImageWithFallback from './ImageWithFallback';
import Badge from './ui/Badge';

interface NewsCardProps {
  newsItem: LatestNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <article
      className="overflow-hidden flex flex-col h-full bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700"
    >
      <div className="relative overflow-hidden aspect-video bg-neutral-100 dark:bg-neutral-700">
        <ImageWithFallback
          className="h-full w-full object-cover"
          src={newsItem.imageUrl}
          alt={newsItem.title}
          fallbackText="Gambar Berita Tidak Tersedia"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="primary" size="md" className="uppercase tracking-wider backdrop-blur-md shadow-sm">
            {newsItem.category}
          </Badge>
        </div>
      </div>
      <div className="p-6 sm:p-7 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-neutral-900 dark:text-white flex-grow leading-snug line-clamp-2">{newsItem.title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-auto flex items-center gap-2 font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {newsItem.date}
        </p>
      </div>
    </article>
  );
};

export default NewsCard;
