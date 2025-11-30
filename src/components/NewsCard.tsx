
import React from 'react';
import { LatestNews } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface NewsCardProps {
  newsItem: LatestNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 flex flex-col h-full">
      <ImageWithFallback 
        className="h-48 w-full object-cover rounded-t-2xl" 
        src={newsItem.imageUrl} 
        alt={newsItem.title} 
        fallbackText="Gambar Berita Tidak Tersedia"
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-900 dark:text-green-300">
            {newsItem.category}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white flex-grow">{newsItem.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-auto">{newsItem.date}</p>
      </div>
    </div>
  );
};

export default NewsCard;