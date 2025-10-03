import React from 'react';
import LazyImage from './LazyImage';
import { latestNews } from '../data/latestNews';

const LatestNewsSection: React.FC = () => {
  return (
    <section id="berita" className="py-16 sm:py-24 bg-white dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Berita & Kegiatan Terbaru</h2>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Ikuti perkembangan dan prestasi terbaru dari sekolah kami.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {latestNews.map((newsItem) => (
                    <div key={newsItem.title} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                       <LazyImage
                         className="h-48 w-full object-cover rounded-t-2xl"
                         src={newsItem.imageUrl}
                         alt={newsItem.title}
                         width={600}
                         height={400}
                         placeholder="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
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
                ))}
            </div>
        </div>
    </section>
  );
};

export default LatestNewsSection;