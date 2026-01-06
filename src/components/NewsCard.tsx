
import React from 'react';
import { LatestNews } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface NewsCardProps {
  newsItem: LatestNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-card-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden transform hover:-translate-y-1 flex flex-col h-full">
      <ImageWithFallback
        className="h-48 w-full object-cover rounded-t-card-lg"
        src={newsItem.imageUrl}
        alt={newsItem.title}
        fallbackText="Gambar Berita Tidak Tersedia"
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-100 dark:bg-primary-900 dark:text-primary-300">
            {newsItem.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white flex-grow leading-snug">{newsItem.title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-auto">{newsItem.date}</p>
      </div>
    </div>
  );
};

export default NewsCard;