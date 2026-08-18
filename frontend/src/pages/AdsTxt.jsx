import React from 'react';
import { Helmet } from 'react-helmet-async';

const AdsTxt = () => {
  // Your ads.txt content
  const adsTxtContent = `google.com, pub-xxxxxxxxxxxxxxxx, DIRECT, f08c47fec0942fa0`;

  return (
    <>
      <Helmet>
        <title>Ads.txt</title>
      </Helmet>
      <pre className="p-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {adsTxtContent}
      </pre>
    </>
  );
};

export default AdsTxt;