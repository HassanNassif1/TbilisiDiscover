import React from 'react';
import { Helmet } from 'react-helmet-async';

const EventsPage = () => {
  return (
    <>
      <Helmet>
        <title>Events | Discover Tbilisi</title>
        <meta name="description" content="Discover upcoming events in Tbilisi." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Events</h1>
        <p className="text-gray-600 dark:text-gray-400">Coming soon...</p>
      </div>
    </>
  );
};

export default EventsPage;