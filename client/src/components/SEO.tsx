import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface ArticleData {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  publisher?: string;
  image?: string;
}

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  article?: ArticleData;
  breadcrumbs?: BreadcrumbItem[];
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
  article,
  breadcrumbs,
}: SEOProps) {
  const fullTitle = title ? `${title} | Investor Feed` : defaults.title;
  const canonicalUrl = canonical ? `${defaults.url}${canonical}` : defaults.url;

  // Generate Article schema
  const articleSchema = article ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline.substring(0, 110), // Google recommends max 110 chars
    description: article.description.substring(0, 160),
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: article.author || 'Investor Feed',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Investor Feed',
      logo: {
        '@type': 'ImageObject',
        url: 'https://investorfeed.in/logo.svg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    image: article.image || defaults.image,
  } : null;

  // Generate Breadcrumb schema
  const breadcrumbSchema = breadcrumbs && breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${defaults.url}${item.url}`,
    })),
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={article ? 'article' : type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />

      {/* Article-specific OG tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.datePublished} />
          {article.dateModified && <meta property="article:modified_time" content={article.dateModified} />}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article Schema */}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}

      {/* Breadcrumb Schema */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
