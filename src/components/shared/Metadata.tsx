
import React from 'react';
import { Helmet } from 'react-helmet';

interface MetadataProps {
  title: string;
  description: string;
}

export const Metadata: React.FC<MetadataProps> = ({ title, description }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
};

export default Metadata;
