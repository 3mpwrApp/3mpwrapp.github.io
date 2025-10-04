import React from 'react';

type Props = {
  title: string;
  description: string;
  url: string;         // absolute canonical URL
  image?: string;      // absolute OG/Twitter image URL
  type?: 'website' | 'article';
  publishedTime?: string; // ISO 8601 for articles
};

export function SEO({
  title,
  description,
  url,
  image,
  type = 'website',
  publishedTime,
}: Props) {
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      {image ? <meta property="og:image" content={image} /> : null}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image ? <meta name="twitter:image" content={image} /> : null}

      {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
    </>
  );
}
