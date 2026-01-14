
import NewsCard from '../NewsCard';
import { LatestNews } from '../../types';
import Section from '../ui/Section';
import { getResponsiveGradient } from '../../config/gradients';

interface NewsSectionProps {
  news: LatestNews[];
}

const NewsSection: React.FC<NewsSectionProps> = ({ news }) => {
  return (
    <Section
      id="berita"
      title="Berita & Kegiatan Terbaru"
      subtitle="Ikuti perkembangan dan prestasi terbaru dari sekolah kami."
      className={getResponsiveGradient('NEWS')}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {news.map((newsItem) => (
          <NewsCard key={newsItem.title} newsItem={newsItem} />
        ))}
      </div>
    </Section>
  );
};

export default NewsSection;
