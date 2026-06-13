import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Star, School, Hospital, ShoppingCart, Trees, Coffee,
  ArrowRight, ChevronRight, Sparkles, Home, ThumbsUp, ThumbsDown,
  Heart
} from 'lucide-react';
import { neighborhoods, properties, reviews, getScoreColor, getScoreLabel } from '../../data/mockData';
import { useFavorites } from '../../context/FavoritesContext';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import Footer from '../../components/Footer/Footer';
import './NeighborhoodDetails.css';

const scoreKeys = [
  { key: 'safety', label: 'Safety', icon: '🛡️' },
  { key: 'traffic', label: 'Traffic', icon: '🚗' },
  { key: 'schools', label: 'Schools', icon: '🎓' },
  { key: 'hospitals', label: 'Hospitals', icon: '🏥' },
  { key: 'internet', label: 'Internet', icon: '📡' },
  { key: 'airQuality', label: 'Air Quality', icon: '🌿' },
  { key: 'costOfLiving', label: 'Cost of Living', icon: '💰' },
];

export default function NeighborhoodDetails() {
  const { id } = useParams();
  const neighborhood = neighborhoods.find(n => n.id === parseInt(id)) || neighborhoods[0];
  const { savedNeighborhoods, toggleNeighborhood } = useFavorites();
  const isSaved = savedNeighborhoods.includes(neighborhood.id);

  const neighborhoodReviews = reviews.filter(r => r.reviewId === neighborhood.id || r.neighborhoodId === neighborhood.id);
  const neighborhoodProperties = properties.filter(p => p.neighborhoodId === neighborhood.id);
  const scoreColor = getScoreColor(neighborhood.overallScore);

  const [activeTab, setActiveTab] = useState('schools');

  const amenityTypes = {
    schools: { label: 'Schools', icon: '🎓', data: neighborhood.amenities.schools },
    hospitals: { label: 'Hospitals', icon: '🏥', data: neighborhood.amenities.hospitals },
    markets: { label: 'Markets', icon: '🛒', data: neighborhood.amenities.markets },
    parks: { label: 'Parks', icon: '🌳', data: neighborhood.amenities.parks },
    restaurants: { label: 'Restaurants', icon: '🍽️', data: neighborhood.amenities.restaurants },
  };

  return (
    <div className="page-wrapper">
      {/* ====== HERO BANNER ====== */}
      <div className="nd-hero" style={{ backgroundImage: `url(${neighborhood.image})` }}>
        <div className="nd-hero-overlay" />
        <div className="container nd-hero-content">
          <nav className="breadcrumb-light">
            <Link to="/">Home</Link> <ChevronRight size={14} /> <Link to="/compare">Neighborhoods</Link> <ChevronRight size={14} /> <span>{neighborhood.name}</span>
          </nav>
          <div className="nd-hero-main">
            <div>
              <h1 className="nd-hero-title">{neighborhood.name}, {neighborhood.city}</h1>
              <div className="nd-hero-sub"><MapPin size={16} />{neighborhood.city}, {neighborhood.state} · {neighborhood.population} residents</div>
            </div>
            <div className="nd-hero-actions">
              <button
                className={`btn ${isSaved ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => toggleNeighborhood(neighborhood.id)}
              >
                <Heart size={15} fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Saved' : 'Save Area'}
              </button>
              <Link to="/compare" className="btn btn-ghost btn-white">
                Compare <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container nd-layout">
        {/* ====== LEFT COLUMN ====== */}
        <main className="nd-main">
          {/* Score Card */}
          <motion.div
            className="score-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="score-card-left">
              <div className="overall-score" style={{ background: `${scoreColor}15`, border: `2px solid ${scoreColor}30` }}>
                <span className="os-number" style={{ color: scoreColor }}>{neighborhood.overallScore}</span>
                <span className="os-denom">/10</span>
                <div className="os-label" style={{ color: scoreColor }}>{getScoreLabel(neighborhood.overallScore)}</div>
              </div>
              <div>
                <h2 className="score-card-title">Overall Score</h2>
                <p className="score-card-sub">Based on 7 key factors</p>
                <Link to="#" className="score-card-link">How scores are calculated? <ChevronRight size={13} /></Link>
              </div>
            </div>
            <div className="score-breakdown">
              {scoreKeys.map(({ key, label, icon }) => (
                <div key={key} className="sb-row">
                  <span className="sb-icon">{icon}</span>
                  <span className="sb-label">{label}</span>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${neighborhood.scores[key] * 10}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                      style={{ background: getScoreColor(neighborhood.scores[key]) }}
                    />
                  </div>
                  <span className="sb-value" style={{ color: getScoreColor(neighborhood.scores[key]) }}>
                    {neighborhood.scores[key]}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* About */}
          <div className="nd-section">
            <h3 className="nd-section-title">About {neighborhood.name}</h3>
            <p className="nd-about">{neighborhood.description}</p>
          </div>

          {/* Amenities */}
          <div className="nd-section">
            <div className="nd-section-header">
              <h3 className="nd-section-title">Nearby Amenities</h3>
              <Link to="#" className="section-link">View all <ArrowRight size={13} /></Link>
            </div>
            <div className="amenity-tabs">
              {Object.entries(amenityTypes).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  className={`amenity-tab ${activeTab === key ? 'active' : ''}`}
                  onClick={() => setActiveTab(key)}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
            <div className="amenity-list">
              {(amenityTypes[activeTab].data || []).map((item, i) => (
                <motion.div
                  key={i}
                  className="amenity-row"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="amenity-row-icon">{amenityTypes[activeTab].icon}</div>
                  <div className="amenity-row-info">
                    <div className="amenity-row-name">{item.name}</div>
                    <div className="amenity-row-dist">{item.distance} away</div>
                  </div>
                  {item.rating && (
                    <div className="amenity-row-rating">
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      {item.rating}
                    </div>
                  )}
                </motion.div>
              ))}
              {(amenityTypes[activeTab].data || []).length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No data available.</p>
              )}
            </div>
          </div>

          {/* Available Homes */}
          {neighborhoodProperties.length > 0 && (
            <div className="nd-section">
              <div className="nd-section-header">
                <h3 className="nd-section-title">Available Homes</h3>
                <Link to="/search" className="section-link">View all <ArrowRight size={13} /></Link>
              </div>
              <div className="nd-homes-grid">
                {neighborhoodProperties.slice(0, 3).map(p => <PropertyCard key={p.id} property={p} compact />)}
              </div>
            </div>
          )}

          {/* Resident Reviews */}
          <div className="nd-section">
            <h3 className="nd-section-title">Resident Reviews</h3>
            {neighborhoodReviews.length > 0 ? (
              neighborhoodReviews.map(review => <ReviewCard key={review.id} review={review} />)
            ) : (
              <div className="nd-no-reviews">
                <Star size={32} color="var(--text-tertiary)" />
                <p>No reviews yet. Be the first to review!</p>
                <Link to={`/reviews/${neighborhood.id}`} className="btn btn-primary btn-sm">Add Review</Link>
              </div>
            )}
            <Link to={`/reviews/${neighborhood.id}`} className="btn btn-secondary" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              View All Reviews <ArrowRight size={14} />
            </Link>
          </div>
        </main>

        {/* ====== RIGHT SIDEBAR ====== */}
        <aside className="nd-sidebar">
          {/* AI Summary */}
          <div className="ai-card">
            <div className="ai-card-header">
              <Sparkles size={18} className="ai-icon" />
              <span>AI Neighborhood Summary</span>
              <span className="ai-badge">BETA</span>
            </div>
            <p className="ai-text">"{neighborhood.aiSummary}"</p>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <h4>Quick Stats</h4>
            <div className="qs-grid">
              <div className="qs-item">
                <span className="qs-val">₹{(neighborhood.avgRent / 1000).toFixed(0)}K</span>
                <span className="qs-label">Avg Rent/mo</span>
              </div>
              <div className="qs-item">
                <span className="qs-val">₹{(neighborhood.avgBuy / 100000).toFixed(0)}L</span>
                <span className="qs-label">Avg Buy Price</span>
              </div>
              <div className="qs-item">
                <span className="qs-val">{neighborhood.population}</span>
                <span className="qs-label">Population</span>
              </div>
              <div className="qs-item">
                <span className="qs-val">{neighborhoodProperties.length}</span>
                <span className="qs-label">Listed Homes</span>
              </div>
            </div>
          </div>

          {/* Compare */}
          <div className="nd-compare-cta">
            <h4>Compare this area</h4>
            <p>See how {neighborhood.name} stacks up against other neighborhoods.</p>
            <Link to="/compare" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
              Compare Neighborhoods
            </Link>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="review-card-nd">
      <div className="review-header-nd">
        <div className="reviewer-avatar" style={{ background: review.avatarColor }}>{review.avatar}</div>
        <div>
          <div className="reviewer-name">{review.user} {review.verified && <span className="verified-badge">✓ Verified</span>}</div>
          <div className="review-meta">{'★'.repeat(Math.floor(review.rating))} · {review.date}</div>
        </div>
      </div>
      <div className="review-body">
        {review.pros.length > 0 && (
          <div className="review-pros">
            <ThumbsUp size={13} /><strong>Pros:</strong>
            <ul>{review.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
          </div>
        )}
        {review.cons.length > 0 && (
          <div className="review-cons">
            <ThumbsDown size={13} /><strong>Cons:</strong>
            <ul>{review.cons.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}
