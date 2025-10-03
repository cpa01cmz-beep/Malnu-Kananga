import React from 'react';

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title = "MA Malnu Kananga - Portal Akademik",
  description = "Portal akademik resmi MA Malnu Kananga untuk siswa, guru, dan orang tua. Platform pendidikan modern dengan teknologi AI untuk pembelajaran yang lebih baik.",
  keywords = "MA Malnu Kananga, madrasah, pendidikan, akademik, portal siswa, nilai online, jadwal pelajaran",
  author = "MA Malnu Kananga",
  ogTitle = "MA Malnu Kananga - Portal Akademik",
  ogDescription = "Platform pendidikan modern dengan teknologi AI untuk pembelajaran yang lebih baik",
  ogUrl = "https://ma-malnukananga.sch.id"
}) => {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={ogUrl} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={ogUrl} />
    </>
  );
};

export default MetaTags;