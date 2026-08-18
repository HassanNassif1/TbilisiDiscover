import React from 'react';
import { Helmet } from 'react-helmet-async';

const BlogPage = () => {
  return (
    <>
      <Helmet>
        <title>Blog | Discover Tbilisi</title>
        <meta name="description" content="Read the latest articles about Tbilisi, Georgia." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blog</h1>
        <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
      </div>
    </>
  );
};

export default BlogPage;