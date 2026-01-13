
import React from 'react';
import { LatestNews } from '../types';
import ImageCard from './ui/ImageCard';

interface NewsCardProps {
  newsItem: LatestNews;
}

const NewsCard: React.FC<NewsCardProps> = ({ newsItem }) => {
  return (
    <ImageCard
      imageUrl={newsItem.imageUrl}
      imageAlt={newsItem.title}
      title={newsItem.title}
      variant="hover"
      badge={{ text: newsItem.category }}
      ariaLabel={newsItem.title}
      footer={
        <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2 font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {newsItem.date}
        </p>
      }
    />
  );
};

export default NewsCard;
