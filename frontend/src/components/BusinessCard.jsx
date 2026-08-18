import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiMapPin, FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

const BusinessCard = ({ business, featured = false }) => {
  const {
    id,
    name,
    slug,
    logo,
    category,
    rating,
    review_count,
    address,
    neighborhood,
    price_range,
    is_featured,
    is_premium,
    images = [],
    deals
  } = business || {};

  const coverImage = images?.find(img => img.is_cover)?.image_url || logo || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="20" fill="%239ca3af" text-anchor="middle"%3E%3C/text%3E%3C/svg%3E';
  const hasDeals = deals && deals.length > 0;

  if (!business) return null;

  return (
    <Link
      to={`/business/${slug}`}
      className="group block bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="200" y="150" font-family="Arial" font-size="20" fill="%239ca3af" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
          }}
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {is_featured && (
            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full shadow-lg">
              Featured
            </span>
          )}
          {is_premium && (
            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full shadow-lg">
              Premium
            </span>
          )}
          {hasDeals && (
            <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg">
              Deal
            </span>
          )}
        </div>
        
        {/* Favorite button */}
        <button
          className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all hover:scale-110 shadow-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <FiHeart className="text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors text-lg" />
        </button>
        
        {/* Rating badge */}
        {rating > 0 && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full flex items-center gap-1.5">
            <FiStar className="text-yellow-400 fill-current text-sm" />
            <span className="text-white font-semibold text-sm">{parseFloat(rating).toFixed(1)}</span>
            <span className="text-gray-300 text-xs">({review_count || 0})</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {category?.name || 'Business'}
            </p>
          </div>
          {price_range && (
            <span className="text-sm font-medium text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
              {price_range}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <FiMapPin className="flex-shrink-0 mr-1 text-gray-400" />
          <span className="truncate">{neighborhood || address || 'Tbilisi'}</span>
        </div>
      </div>
    </Link>
  );
};

export default BusinessCard;