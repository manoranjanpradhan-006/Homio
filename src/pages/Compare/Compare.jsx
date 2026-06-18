import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, X, Sparkles, Users, GraduationCap, Banknote, TrendingUp, Home, MapPin, ArrowLeft } from 'lucide-react';
import { getScoreColor, getScoreLabel, formatPrice } from '../../data/mockData';
import { getNeighborhoods, getProperties } from '../../services/dataService';
import NeighborhoodCard from '../../components/NeighborhoodCard/NeighborhoodCard';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import Footer from '../../components/Footer/Footer';
import Loader from '../../components/Loader/Loader';
import './Compare.css';

const scoreRows = [
  { key: 'overallScore', label: 'Overall Score', icon: '⭐' },
  { key: 'safety', label: 'Safety', icon: '🛡️' },
  { key: 'traffic', label: 'Traffic', icon: '🚗' },
  { key: 'schools', label: 'Schools', icon: '🎓' },
  { key: 'hospitals', label: 'Hospitals', icon: '🏥' },
  { key: 'internet', label: 'Internet', icon: '📡' },
  { key: 'airQuality', label: 'Air Quality', icon: '🌿' },
  { key: 'costOfLiving', label: 'Cost of Living', icon: '💰' },
];

const aiRecommendations = [
  {
    icon: <Users size={20} />,
    label: 'Best For Families',
    color: '#10b981',
    name: 'Patia',
    reason: 'Great schools, hospitals and overall safety.',
    neighborhoodId: 1,
  },
  {
    icon: <GraduationCap size={20} />,
    label: 'Best For Students',
    color: '#8b5cf6',
    name: 'Chandrasekharpur',
    reason: 'Great educational institutions and internet connectivity.',
    neighborhoodId: 3,
  },
  {
    icon: <Banknote size={20} />,
    label: 'Best Budget Option',
    color: '#f59e0b',
    name: 'Khandagiri',
    reason: 'Lower living cost with essential amenities nearby.',
    neighborhoodId: 2,
  },
  {
    icon: <TrendingUp size={20} />,
    label: 'Best Investment',
    color: '#0ea5e9',
    name: 'Chandrasekharpur',
    reason: 'Highest property appreciation rate in Bhubaneswar.',
    neighborhoodId: 3,
  },
];

export default function Compare() {
  const [compareType, setCompareType] = useState(null); // null, 'homes', 'neighborhoods'
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState([]);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [nData, pData] = await Promise.all([
        getNeighborhoods(),
        getProperties()
      ]);
      setNeighborhoods(nData || []);
      setProperties(pData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loader message="Analyzing properties and neighborhoods..." />;
  }

  // Neighborhood comparison helpers
  const addNeighborhood = (n) => {
    if (selectedNeighborhoods.length >= 3) return;
    if (selectedNeighborhoods.find(s => s.id === n.id)) return;
    setSelectedNeighborhoods([...selectedNeighborhoods, n]);
  };

  const removeNeighborhood = (id) => {
    setSelectedNeighborhoods(selectedNeighborhoods.filter(s => s.id !== id));
  };

  const getNeighVal = (n, key) => {
    if (key === 'overallScore') return n.overallScore;
    return n.scores[key];
  };

  const getBestNeigh = (key) => {
    if (selectedNeighborhoods.length < 2) return null;
    return selectedNeighborhoods.reduce((best, n) => getNeighVal(n, key) >= getNeighVal(best, key) ? n : best, selectedNeighborhoods[0]).id;
  };

  // Property comparison helpers
  const addProperty = (p) => {
    if (selectedProperties.length >= 3) return;
    if (selectedProperties.find(s => s.id === p.id)) return;
    setSelectedProperties([...selectedProperties, p]);
  };

  const removeProperty = (id) => {
    setSelectedProperties(selectedProperties.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: 40 }}>
          <div className="skeleton" style={{ height: 60, marginBottom: 24, width: '40%' }} />
          <div className="skeleton" style={{ height: 350, marginBottom: 40, width: '100%', borderRadius: 16 }} />
        </div>
        <Footer />
      </div>
    );
  }

  // CHOICE VIEW
  if (compareType === null) {
    return (
      <div className="page-wrapper">
        <div className="container compare-choice-wrap">
          <div style={{ textAlign: 'center' }}>
            <span className="hero-eyebrow" style={{ margin: '0 auto 16px' }}>
              <Sparkles size={14} /> Compare Hub
            </span>
            <h1 className="section-title">What would you like to compare?</h1>
            <p className="section-subtitle">Make informed decisions by comparing neighborhoods or properties side by side</p>
          </div>

          <div className="compare-choices-grid">
            <motion.div
              className="compare-choice-card"
              whileHover={{ y: -6 }}
              onClick={() => setCompareType('neighborhoods')}
            >
              <div className="compare-choice-icon" style={{ background: 'var(--brand-gradient)' }}>
                <MapPin size={32} />
              </div>
              <h2 className="compare-choice-title">Compare Neighborhoods</h2>
              <p className="compare-choice-desc">
                Analyze safety ratings, connectivity, air quality, schools, and hospitals across different areas to find the right environment for you.
              </p>
              <button className="btn btn-primary" style={{ marginTop: 'auto' }}>Compare Areas</button>
            </motion.div>

            <motion.div
              className="compare-choice-card"
              whileHover={{ y: -6 }}
              onClick={() => setCompareType('homes')}
            >
              <div className="compare-choice-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #0ea5e9 100%)' }}>
                <Home size={32} />
              </div>
              <h2 className="compare-choice-title">Compare Homes</h2>
              <p className="compare-choice-desc">
                Evaluate prices, BHK sizes, square footage, furnishing status, location connectivity, and listed amenities of available listings.
              </p>
              <button className="btn btn-primary" style={{ marginTop: 'auto', background: 'linear-gradient(135deg, #8b5cf6 0%, #0ea5e9 100%)', boxShadow: '0 8px 24px rgba(139,92,246,0.25)' }}>Compare Properties</button>
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // NEIGHBORHOODS COMPARE VIEW
  if (compareType === 'neighborhoods') {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: 32 }}>
          <button className="compare-back-btn" onClick={() => setCompareType(null)}>
            <ArrowLeft size={16} /> Back to Hub
          </button>

          <div className="compare-header">
            <div>
              <h1 className="section-title">Compare Neighborhoods</h1>
              <p className="section-subtitle">Compare up to 3 neighborhoods side by side</p>
            </div>
          </div>

          {/* Table */}
          {selectedNeighborhoods.length > 0 ? (
            <motion.div
              className="compare-table-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-feature-col">Feature</th>
                    {selectedNeighborhoods.map(n => (
                      <th key={n.id}>
                        <div className="compare-th">
                          <img src={n.image} alt={n.name} className="compare-th-img" />
                          <div className="compare-th-info">
                            <Link to={`/neighborhoods/${n.id}`} className="compare-th-name">{n.name}</Link>
                            <div className="compare-th-city">{n.city}</div>
                          </div>
                          <button className="compare-remove" onClick={() => removeNeighborhood(n.id)}>
                            <X size={14} />
                          </button>
                        </div>
                      </th>
                    ))}
                    {selectedNeighborhoods.length < 3 && (
                      <th>
                        <div className="add-slot" style={{ height: '100%', justifyContent: 'center' }}>
                          <Plus size={20} />
                          <span>Add Area Below</span>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {scoreRows.map(({ key, label, icon }, ri) => {
                    const bestId = getBestNeigh(key);
                    return (
                      <tr key={key} className={ri % 2 === 0 ? 'row-alt' : ''}>
                        <td className="feature-cell">
                          <span className="feature-icon">{icon}</span>
                          <span>{label}</span>
                        </td>
                        {selectedNeighborhoods.map(n => {
                          const val = getNeighVal(n, key);
                          const isBest = n.id === bestId;
                          const color = getScoreColor(val);
                          return (
                            <td key={n.id} className={`score-cell ${isBest ? 'best-cell' : ''}`}>
                              <div className="score-display">
                                <span className="score-num" style={{ color }}>{val}</span>
                                <div className="score-mini-bar">
                                  <motion.div
                                    className="score-mini-fill"
                                    style={{ background: color }}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${val * 10}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                  />
                                </div>
                                {key === 'overallScore' && (
                                  <span className="score-label-sm" style={{ color }}>{getScoreLabel(val)}</span>
                                )}
                                {isBest && <span className="best-tag">Best</span>}
                              </div>
                            </td>
                          );
                        })}
                        {selectedNeighborhoods.length < 3 && <td />}
                      </tr>
                    );
                  })}
                  <tr>
                    <td className="feature-cell"><span className="feature-icon">🏠</span><span>Avg Rent</span></td>
                    {selectedNeighborhoods.map(n => (
                      <td key={n.id} className="score-cell">
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          ₹{(n.avgRent / 1000).toFixed(0)}K/mo
                        </span>
                      </td>
                    ))}
                    {selectedNeighborhoods.length < 3 && <td />}
                  </tr>
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="empty-compare" style={{ padding: '40px 0', marginBottom: 20 }}>
              <p>No neighborhoods selected. Pick options from the grid below to start comparing!</p>
            </div>
          )}

          {/* Postcard selection grid */}
          <div style={{ marginTop: 40, borderTop: '1px solid var(--border-default)', paddingTop: 32 }}>
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 6 }}>Select Neighborhoods to Compare</h2>
            <p className="section-subtitle" style={{ marginBottom: 24 }}>Choose up to 3 areas (click card to add or remove)</p>
            
            <div className="compare-selection-grid">
              {neighborhoods.map(n => {
                const isSelected = selectedNeighborhoods.some(s => s.id === n.id);
                return (
                  <div 
                    key={n.id} 
                    className={`compare-select-card-wrap ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        removeNeighborhood(n.id);
                      } else {
                        addNeighborhood(n);
                      }
                    }}
                  >
                    <NeighborhoodCard neighborhood={n} />
                    <div className="compare-card-overlay">
                      <div className="compare-select-indicator">
                        {isSelected ? '✓ Selected' : '+ Compare'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="ai-recommendations" style={{ borderTop: '1px solid var(--border-default)', paddingTop: 40 }}>
            <div className="ai-reco-header">
              <Sparkles size={20} className="ai-reco-icon" />
              <h2>AI Recommendations</h2>
            </div>
            <div className="ai-reco-grid">
              {aiRecommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  className="ai-reco-card"
                  style={{ '--reco-color': rec.color }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="ai-reco-icon-wrap" style={{ background: `${rec.color}20`, color: rec.color }}>
                    {rec.icon}
                  </div>
                  <div className="ai-reco-label" style={{ color: rec.color }}>{rec.label}</div>
                  <div className="ai-reco-name">{rec.name}</div>
                  <div className="ai-reco-reason">{rec.reason}</div>
                  <Link to={`/neighborhoods/${rec.neighborhoodId}`} className="ai-reco-link" style={{ color: rec.color }}>
                    Explore {rec.name} →
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // HOMES COMPARE VIEW
  if (compareType === 'homes') {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: 32 }}>
          <button className="compare-back-btn" onClick={() => setCompareType(null)}>
            <ArrowLeft size={16} /> Back to Hub
          </button>

          <div className="compare-header">
            <div>
              <h1 className="section-title">Compare Homes</h1>
              <p className="section-subtitle">Compare up to 3 homes side by side</p>
            </div>
          </div>

          {/* Table */}
          {selectedProperties.length > 0 ? (
            <motion.div
              className="compare-table-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <table className="compare-table">
                <thead>
                  <tr>
                    <th className="compare-feature-col">Property</th>
                    {selectedProperties.map(p => (
                      <th key={p.id}>
                        <div className="compare-th">
                          <img src={p.images[0]} alt={p.title} className="compare-th-img" />
                          <div className="compare-th-info">
                            <Link to={`/property/${p.id}`} className="compare-th-name">{p.title}</Link>
                            <div className="compare-th-city">{p.neighborhoodName}, {p.city}</div>
                          </div>
                          <button className="compare-remove" onClick={() => removeProperty(p.id)}>
                            <X size={14} />
                          </button>
                        </div>
                      </th>
                    ))}
                    {selectedProperties.length < 3 && (
                      <th>
                        <div className="add-slot" style={{ height: '100%', justifyContent: 'center' }}>
                          <Plus size={20} />
                          <span>Add Home Below</span>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="row-alt">
                    <td className="feature-cell"><span className="feature-icon">💰</span><span>Price</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                          {formatPrice(p.price, p.listingType)}
                        </span>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr>
                    <td className="feature-cell"><span className="feature-icon">📍</span><span>Neighborhood</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <Link to={`/neighborhoods/${p.neighborhoodId}`} style={{ color: 'var(--accent-blue)', fontWeight: 600, textDecoration: 'none' }}>
                          {p.neighborhoodName} ({p.neighborhoodScore}/10)
                        </Link>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr className="row-alt">
                    <td className="feature-cell"><span className="feature-icon">🏢</span><span>Type</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <span>{p.type}</span>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr>
                    <td className="feature-cell"><span className="feature-icon">🔑</span><span>Listed For</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <span className={`badge ${p.listingType === 'Rent' ? 'badge-blue' : 'badge-green'}`}>
                          {p.listingType}
                        </span>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr className="row-alt">
                    <td className="feature-cell"><span className="feature-icon">🛏️</span><span>BHK / Baths</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <span style={{ fontWeight: 600 }}>{p.bedrooms} BHK / {p.bathrooms} Bath</span>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr>
                    <td className="feature-cell"><span className="feature-icon">📐</span><span>Area</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <span>{p.area} sqft</span>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr className="row-alt">
                    <td className="feature-cell"><span className="feature-icon">🛋️</span><span>Furnishing</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <span>{p.furnishing}</span>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr>
                    <td className="feature-cell"><span className="feature-icon">🗓️</span><span>Availability</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <span>{p.availableFrom}</span>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr className="row-alt">
                    <td className="feature-cell"><span className="feature-icon">🛒</span><span>Nearest Market</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <span style={{ fontSize: '0.85rem' }}>{p.nearestMarket} ({p.marketDistance})</span>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr>
                    <td className="feature-cell"><span className="feature-icon">⚡</span><span>Amenities</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <div className="compare-amenities-tags">
                          {p.amenities.map((amenity, ai) => (
                            <span key={ai} className="compare-amenity-tag">{amenity}</span>
                          ))}
                        </div>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                  <tr className="row-alt">
                    <td className="feature-cell"><span className="feature-icon">🔗</span><span>Action</span></td>
                    {selectedProperties.map(p => (
                      <td key={p.id} className="score-cell">
                        <Link to={`/property/${p.id}`} className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
                          View Details
                        </Link>
                      </td>
                    ))}
                    {selectedProperties.length < 3 && <td />}
                  </tr>
                </tbody>
              </table>
            </motion.div>
          ) : (
            <div className="empty-compare" style={{ padding: '40px 0', marginBottom: 20 }}>
              <p>No properties selected. Pick options from the grid below to start comparing!</p>
            </div>
          )}

          {/* Postcard selection grid */}
          <div style={{ marginTop: 40, borderTop: '1px solid var(--border-default)', paddingTop: 32 }}>
            <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 6 }}>Select Homes to Compare</h2>
            <p className="section-subtitle" style={{ marginBottom: 24 }}>Choose up to 3 properties (click card to add or remove)</p>
            
            <div className="compare-selection-grid">
              {properties.map(p => {
                const isSelected = selectedProperties.some(s => s.id === p.id);
                return (
                  <div 
                    key={p.id} 
                    className={`compare-select-card-wrap ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isSelected) {
                        removeProperty(p.id);
                      } else {
                        addProperty(p);
                      }
                    }}
                  >
                    <PropertyCard property={p} compact />
                    <div className="compare-card-overlay">
                      <div className="compare-select-indicator">
                        {isSelected ? '✓ Selected' : '+ Compare'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}
