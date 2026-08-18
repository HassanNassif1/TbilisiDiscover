import React from 'react';
import { Helmet } from 'react-helmet-async';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact | Discover Tbilisi</title>
        <meta name="description" content="Contact Discover Tbilisi." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Contact</h1>
        <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
      </div>
    </>
  );
};

export default ContactPage;