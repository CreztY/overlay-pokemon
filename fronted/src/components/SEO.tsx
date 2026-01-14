import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
  canonical?: string;
  noindex?: boolean;
}

export default function SEO({ title, description, name = 'Pokémon Overlay', type = 'website', canonical, noindex }: SEOProps) {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      {noindex && <meta name="robots" content="noindex" />}
      <title>{title}</title>
      <meta name='description' content={description} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Facebook tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {/* End Facebook tags */}

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {/* End Twitter tags */}
    </Helmet>
  );
}
