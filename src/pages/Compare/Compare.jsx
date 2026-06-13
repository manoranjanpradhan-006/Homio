import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, X, Sparkles, Users, GraduationCap, Banknote, TrendingUp } from 'lucide-react';
import { getScoreColor, getScoreLabel } from '../../data/mockData';
import { getNeighborhoods } from '../../services/dataService';
import Footer from '../../components/Footer/Footer';
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
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      setLoading(true);
      const data = await getNeighborhoods();
      setNeighborhoods(data || []);
      if (data && data.length > 0) {
        setSelected(data.slice(0, 3));
      }
      setLoading(false);
    };
    fetchNeighborhoods();
  }, []);

  const addNeighborhood = (n) => {
    if (selected.length >= 3) return;
    if (selected.find(s => s.id === n.id)) return;
    setSelected([...selected, n]);
  };

  const removeNeighborhood = (id) => {
    setSelected(selected.filter(s => s.id !== id));
  };

  const getVal = (n, key) => {
    if (key === 'overallScore') return n.overallScore;
    return n.scores[key];
  };

  const getBest = (key) => {
    if (selected.length < 2) return null;
    return selected.reduce((best, n) => getVal(n, key) >= getVal(best, key) ? n : best, selected[0]).id;
  };

  const available = neighborhoods.filter(n => !selected.find(s => s.id === n.id));

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

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32 }}>
        <div className="compare-header">
          <div>
            <h1 className="section-title">Compare Neighborhoods</h1>
            <p className="section-subtitle">Compare up to 3 neighborhoods side by side</p>
          </div>
          {selected.length < 3 && available.length > 0 && (
            <div className="add-neighborhood">
              <span className="add-label">Add neighborhood:</span>
              {available.map(n => (
                <button key={n.id} className="add-chip" onClick={() => addNeighborhood(n)}>
                  <Plus size={13} /> {n.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comparison Table */}
        {selected.length > 0 ? (
          <motion.div
            className="compare-table-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-feature-col">Feature</th>
                  {selected.map(n => (
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
                  {selected.length < 3 && (
                    <th>
                      <div className="add-slot">
                        <Plus size={20} />
                        <span>Add Area</span>
                      </div>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {scoreRows.map(({ key, label, icon }, ri) => {
                  const bestId = getBest(key);
                  return (
                    <tr key={key} className={ri % 2 === 0 ? 'row-alt' : ''}>
                      <td className="feature-cell">
                        <span className="feature-icon">{icon}</span>
                        <span>{label}</span>
                      </td>
                      {selected.map(n => {
                        const val = getVal(n, key);
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
                      {selected.length < 3 && <td />}
                    </tr>
                  );
                })}

                {/* Cost of Living Row */}
                <tr>
                  <td className="feature-cell"><span className="feature-icon">🏠</span><span>Avg Rent</span></td>
                  {selected.map(n => (
                    <td key={n.id} className="score-cell">
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{(n.avgRent / 1000).toFixed(0)}K/mo
                      </span>
                    </td>
                  ))}
                  {selected.length < 3 && <td />}
                </tr>
              </tbody>
            </table>
          </motion.div>
        ) : (
          <div className="empty-compare">
            <p>Select neighborhoods to compare</p>
            <div className="flex gap-3 flex-wrap justify-center" style={{ marginTop: 16 }}>
              {neighborhoods.map(n => (
                <button key={n.id} className="btn btn-secondary" onClick={() => addNeighborhood(n)}>
                  <Plus size={14} /> {n.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <div className="ai-recommendations">
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
