import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
}

const defaults = {
  title: 'Investor Feed',
  description: 'Cut through market noise with Investor Feed. Real-time company filings and market intelligence for serious investors.',
  image: 'https://investorfeed.in/og-image.png',
  url: 'https://investorfeed.in',
};

export default function SEO({
  title,
  description = defaults.description,
  canonical,
  type = 'website',
  image = defaults.image,
}: SEOProps) {
  const fullTitle = title ? `${title} | Investor Feed` : defaults.title;
  const canonicalUrl = canonical ? `${defaults.url}${canonical}` : defaults.url;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
