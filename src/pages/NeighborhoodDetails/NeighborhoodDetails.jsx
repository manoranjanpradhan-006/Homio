import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Star, School, Hospital, ShoppingCart, Trees, Coffee,
  ArrowRight, ChevronRight, Sparkles, Home, ThumbsUp, ThumbsDown,
  Heart
} from 'lucide-react';
import { getNeighborhoodById, getReviews, getProperties, getNeighborhoods, addNeighborhood } from '../../services/dataService';
import { getScoreColor, getScoreLabel } from '../../data/mockData';
import { useFavorites } from '../../context/FavoritesContext';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import NeighborhoodCard from '../../components/NeighborhoodCard/NeighborhoodCard';
import Footer from '../../components/Footer/Footer';
import { X, Plus } from 'lucide-react';
import Loader from '../../components/Loader/Loader';
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
  const [neighborhood, setNeighborhood] = useState(null);
  const [neighborhoodReviews, setNeighborhoodReviews] = useState([]);
  const [neighborhoodProperties, setNeighborhoodProperties] = useState([]);
  const [allNeighborhoods, setAllNeighborhoods] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    city: '',
    state: 'Odisha',
    description: '',
    image: '',
    avgRent: 15000,
    avgBuy: 4500000,
    population: '20,000+',
    safety: 8.0,
    traffic: 7.0,
    schools: 8.0,
    hospitals: 8.0,
    internet: 8.0,
    airQuality: 7.0,
    costOfLiving: 8.0,
    aiSummary: ''
  });

  const openAddModal = () => {
    setForm(f => ({ ...f, city: selectedCity || '' }));
    setAddModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.city) {
      alert("Neighborhood name and city are required.");
      return;
    }
    
    const total = parseFloat(form.safety) + parseFloat(form.traffic) + parseFloat(form.schools) + 
                  parseFloat(form.hospitals) + parseFloat(form.internet) + parseFloat(form.airQuality) + 
                  parseFloat(form.costOfLiving);
    const overallScore = parseFloat((total / 7).toFixed(1));

    const neighborhoodData = {
      name: form.name,
      city: form.city,
      state: form.state,
      description: form.description || `${form.name} is a vibrant neighborhood located in ${form.city}.`,
      avgRent: parseInt(form.avgRent) || 15000,
      avgBuy: parseInt(form.avgBuy) || 4500000,
      population: form.population || '25,000+',
      overallScore: overallScore,
      scores: {
        safety: parseFloat(form.safety),
        traffic: parseFloat(form.traffic),
        schools: parseFloat(form.schools),
        hospitals: parseFloat(form.hospitals),
        internet: parseFloat(form.internet),
        airQuality: parseFloat(form.airQuality),
        costOfLiving: parseFloat(form.costOfLiving)
      },
      image: form.image || "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
      aiSummary: form.aiSummary || `AI Insights: ${form.name} in ${form.city} shows strong scores in connectivity and infrastructure, with an overall score of ${overallScore}/10.`
    };

    const newN = await addNeighborhood(neighborhoodData);
    if (newN) {
      const nList = await getNeighborhoods();
      setAllNeighborhoods(nList || []);
      
      const locMap = {};
      nList.forEach(n => {
        const key = `${n.city}, ${n.state}`;
        if (!locMap[key]) {
          locMap[key] = { city: n.city, state: n.state, image: n.image, count: 0 };
        }
        locMap[key].count += 1;
      });
      setLocations(Object.values(locMap));
      setSelectedCity(newN.city);
      setForm({
        name: '',
        city: '',
        state: 'Odisha',
        description: '',
        image: '',
        avgRent: 15000,
        avgBuy: 4500000,
        population: '20,000+',
        safety: 8.0,
        traffic: 7.0,
        schools: 8.0,
        hospitals: 8.0,
        internet: 8.0,
        airQuality: 7.0,
        costOfLiving: 8.0,
        aiSummary: ''
      });
      setAddModalOpen(false);
    }
  };
  const { savedNeighborhoods, toggleNeighborhood } = useFavorites();
  const [activeTab, setActiveTab] = useState('schools');

  useEffect(() => {
    const loadNeighborhoodData = async () => {
      setLoading(true);
      if (id) {
        const nData = await getNeighborhoodById(id);
        if (nData) {
          setNeighborhood(nData);
          const [rData, allProps] = await Promise.all([
            getReviews(nData.id),
            getProperties()
          ]);
          setNeighborhoodReviews(rData || []);
          if (allProps) {
            setNeighborhoodProperties(allProps.filter(p => p.neighborhoodId === nData.id));
          }
        }
      } else {
        const nList = await getNeighborhoods();
        setAllNeighborhoods(nList || []);
        
        const locMap = {};
        nList.forEach(n => {
          const key = `${n.city}, ${n.state}`;
          if (!locMap[key]) {
            locMap[key] = { city: n.city, state: n.state, image: n.image, count: 0 };
          }
          locMap[key].count += 1;
        });
        setLocations(Object.values(locMap));
      }
      setLoading(false);
    };
    loadNeighborhoodData();
  }, [id]);

  if (loading) {
    return <Loader message="Analyzing neighborhood metrics..." />;
  }

  if (!id) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
          <div style={{ marginBottom: 40, textAlign: 'center' }}>
            <span className="hero-eyebrow" style={{ margin: '0 auto 16px' }}>
              <MapPin size={14} />
              Explore Neighborhoods
            </span>
            <h1 className="section-title">Select a Location</h1>
            <p className="section-subtitle">Choose a city to explore top-rated neighborhoods</p>
            <button className="btn btn-primary" onClick={openAddModal} style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Add Location / Area
            </button>
          </div>

          {!selectedCity ? (
            <div className="locations-grid">
              {locations.map((loc, i) => (
                <motion.div
                  key={i}
                  className="location-select-card"
                  whileHover={{ y: -6, scale: 1.02 }}
                  onClick={() => setSelectedCity(loc.city)}
                >
                  <div className="loc-card-img-wrap">
                    <img src={loc.image} alt={loc.city} className="loc-card-img" />
                    <div className="loc-card-overlay" />
                  </div>
                  <div className="loc-card-info">
                    <h3 className="loc-card-title">{loc.city}</h3>
                    <p className="loc-card-sub">{loc.state} · {loc.count} Neighborhoods</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 className="section-title" style={{ fontSize: '1.75rem', marginBottom: 6 }}>
                    Neighborhoods in {selectedCity}
                  </h2>
                  <p className="section-subtitle">Showing all available neighborhoods in {selectedCity}</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button className="btn btn-primary" onClick={openAddModal} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={15} /> Add Area
                  </button>
                  <button className="btn btn-secondary" onClick={() => setSelectedCity(null)}>
                    ← Change Location
                  </button>
                </div>
              </div>

              <div className="neighborhoods-grid">
                {allNeighborhoods
                  .filter(n => n.city === selectedCity)
                  .map(n => (
                    <NeighborhoodCard key={n.id} neighborhood={n} />
                  ))}
              </div>
            </div>
          )}
        </div>

        {addModalOpen && (
          <div className="modal-overlay" onClick={() => setAddModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Add New Location / Area</h3>
                <button className="modal-close" onClick={() => setAddModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="form-group-row">
                    <div className="form-group">
                      <label>City / Location *</label>
                      <input
                        type="text"
                        placeholder="e.g. Bhubaneswar, Mumbai"
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Neighborhood Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Patia, Bandra"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>State</label>
                      <input
                        type="text"
                        placeholder="e.g. Odisha, Maharashtra"
                        value={form.state}
                        onChange={e => setForm({ ...form, state: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Population Estimate</label>
                      <input
                        type="text"
                        placeholder="e.g. 20,000+"
                        value={form.population}
                        onChange={e => setForm({ ...form, population: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group-row">
                    <div className="form-group">
                      <label>Average Monthly Rent (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 15000"
                        value={form.avgRent}
                        onChange={e => setForm({ ...form, avgRent: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Average Buy Price (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 4500000"
                        value={form.avgBuy}
                        onChange={e => setForm({ ...form, avgBuy: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={form.image}
                      onChange={e => setForm({ ...form, image: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Describe the area, demographics, vibe, and amenities..."
                      rows={3}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>AI Summary / Key Insights</label>
                    <textarea
                      placeholder="Add brief highlight bullet points or synthetic AI summary..."
                      rows={2}
                      value={form.aiSummary}
                      onChange={e => setForm({ ...form, aiSummary: e.target.value })}
                    />
                  </div>

                  <div className="scores-sliders-section">
                    <h4>Neighborhood Star Scores (1 - 10)</h4>
                    <div className="sliders-grid">
                      {scoreKeys.map(({ key, label, icon }) => (
                        <div key={key} className="slider-group">
                          <div className="slider-label-row">
                            <span>{icon} {label}</span>
                            <span className="slider-val">{form[key]} / 10</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="0.5"
                            value={form[key]}
                            onChange={e => setForm({ ...form, [key]: parseFloat(e.target.value) })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setAddModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} /> Save Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  if (!neighborhood) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
          <h2>Neighborhood not found</h2>
          <Link to="/neighborhoods" className="btn btn-primary" style={{ marginTop: 20 }}>Back to Locations</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isSaved = savedNeighborhoods.includes(neighborhood.id);
  const scoreColor = getScoreColor(neighborhood.overallScore);

  const amenityTypes = {
    schools: { label: 'Schools', icon: '🎓', data: neighborhood.amenities?.schools || [] },
    hospitals: { label: 'Hospitals', icon: '🏥', data: neighborhood.amenities?.hospitals || [] },
    markets: { label: 'Markets', icon: '🛒', data: neighborhood.amenities?.markets || [] },
    parks: { label: 'Parks', icon: '🌳', data: neighborhood.amenities?.parks || [] },
    restaurants: { label: 'Restaurants', icon: '🍽️', data: neighborhood.amenities?.restaurants || [] },
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
