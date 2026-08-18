import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const BlogPost = () => {
  const { slug } = useParams();

  return (
    <>
      <Helmet>
        <title>Blog Post | Discover Tbilisi</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blog Post</h1>
        <p className="text-gray-600 dark:text-gray-400">Loading post: {slug}</p>
      </div>
    </>
  );
};

export default BlogPost;