import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, Heart, MapPin, Star, ArrowRight } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { formatPrice, getScoreColor } from '../../data/mockData';
import './PropertyCard.css';

export default function PropertyCard({ property, compact = false }) {
  const { savedProperties, toggleProperty } = useFavorites();
  const isSaved = savedProperties.includes(property.id);

  return (
    <motion.div
      className={`property-card ${compact ? 'compact' : ''}`}
      whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
      transition={{ duration: 0.2 }}
    >
      {/* Image */}
      <div className="property-image-wrap">
        <Link to={`/property/${property.id}`}>
          <img
            src={property.images[0]}
            alt={property.title}
            className="property-img"
            loading="lazy"
          />
        </Link>
        {/* Badges */}
        <div className="property-badges">
          <span className={`badge ${property.listingType === 'Rent' ? 'badge-blue' : 'badge-orange'}`}>
            {property.listingType}
          </span>
          {property.isNew && <span className="badge badge-green">New</span>}
        </div>
        {/* Save Button */}
        <button
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleProperty(property.id); }}
          aria-label={isSaved ? 'Unsave' : 'Save'}
        >
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        {/* Image count if multiple */}
        {property.images.length > 1 && (
          <span className="img-count">+{property.images.length - 1}</span>
        )}
      </div>

      {/* Content */}
      <div className="property-content">
        <div className="property-price-row">
          <span className="property-price">{formatPrice(property.price, property.listingType)}</span>
          <div className="score-pill" style={{ background: getScoreColor(property.neighborhoodScore) }}>
            <Star size={10} fill="white" />
            {property.neighborhoodScore}
          </div>
        </div>

        <Link to={`/property/${property.id}`} className="property-title">{property.title}</Link>

        <div className="property-location">
          <MapPin size={13} />
          <span>{property.neighborhoodName}, {property.city}</span>
        </div>

        {!compact && (
          <div className="property-market">
            <span className="market-tag">📍 Near {property.nearestMarket} · {property.marketDistance}</span>
          </div>
        )}

        <div className="property-specs">
          <span><Bed size={13} /> {property.bedrooms} Beds</span>
          <span><Bath size={13} /> {property.bathrooms} Baths</span>
          <span><Maximize2 size={13} /> {property.area} sq.ft</span>
        </div>

        <Link to={`/property/${property.id}`} className="view-details-btn">
          View Details <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
