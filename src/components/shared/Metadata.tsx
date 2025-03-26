
import { Helmet } from 'react-helmet';

interface MetadataProps {
  title: string;
  description: string;
}

export const Metadata = ({ title, description }: MetadataProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
    </Helmet>
  );
};

