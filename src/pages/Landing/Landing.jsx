import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Shield, MessageSquare, Sparkles, ArrowRight, TrendingUp, Home, ChevronRight } from 'lucide-react';
import { getNeighborhoods, getProperties } from '../../services/dataService';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import NeighborhoodCard from '../../components/NeighborhoodCard/NeighborhoodCard';
import Footer from '../../components/Footer/Footer';
import './Landing.css';

import Loader from '../../components/Loader/Loader';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [nData, pData] = await Promise.all([getNeighborhoods(), getProperties()]);
      setNeighborhoods(nData || []);
      setProperties(pData || []);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return <Loader message="Loading Homio Neighborhood Insights..." />;
  }

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const featuredProperties = properties.filter(p => p.isFeatured).slice(0, 8);

  return (
    <div className="page-wrapper">
      {/* ====== HERO ====== */}
      <section className="hero">
        <div className="container hero-container">
          <motion.div
            className="hero-content"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="hero-eyebrow">
              <Sparkles size={14} />
              AI-Powered Home Discovery
              <span className="eyebrow-dot" />
              Trusted by 50,000+ residents
            </motion.div>

            <motion.h1 variants={fadeUp} className="hero-title">
              Find the right <span className="gradient-text">neighborhood.</span>
              <br />
              Find the right <span className="gradient-text">home.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="hero-subtitle">
              Real insights. Real reviews. Better decisions. <br />
              Discover, compare, and choose your perfect place to live.
            </motion.p>

            {/* Search Bar */}
            <motion.form variants={fadeUp} className="hero-search" onSubmit={handleSearch}>
              <div className="hero-search-inner">
                <div className="search-field">
                  <MapPin size={18} className="search-field-icon" />
                  <input
                    className="hero-search-input"
                    placeholder="Search location or neighborhood..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    id="hero-search-input"
                  />
                </div>
                <button type="submit" className="btn btn-primary hero-search-btn" id="hero-find-homes">
                  <Search size={16} />
                  Find Homes
                </button>
              </div>
            </motion.form>

            {/* Quick Links */}
            <motion.div variants={fadeUp} className="hero-quick">
              <span className="quick-label">Popular:</span>
              {neighborhoods.slice(0, 3).map(n => (
                <Link key={n.id} to={`/neighborhoods/${n.id}`} className="quick-chip">
                  {n.name}
                </Link>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeUp} className="hero-stats">
              {[
                { value: '10,000+', label: 'Properties' },
                { value: '500+', label: 'Neighborhoods' },
                { value: '50,000+', label: 'Reviews' },
                { value: '4.8★', label: 'Avg Rating' },
              ].map(s => (
                <div key={s.label} className="hero-stat">
                  <span className="stat-value">{s.value}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="hero-visual-dashboard">
              <div className="visual-db-header">
                <Sparkles size={16} className="visual-db-spark" />
                <span className="visual-db-title">AI Assessment Engine</span>
                <span className="visual-db-live">LIVE INDEX</span>
              </div>
              
              <div className="visual-db-console">
                <span className="console-prompt">&gt; homio --assess "Patia, BBSR"</span>
                <p className="console-text">"Patia is an exceptionally safe family-centric neighborhood with top tier schools (DAV, SAI) and high-speed fiber."</p>
              </div>

              <div className="visual-db-stats">
                <div className="visual-db-row">
                  <div className="vdb-label">🛡️ Safety Score</div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <motion.div className="progress-fill" style={{ width: '90%', background: '#10b981' }} initial={{ width: 0 }} animate={{ width: '90%' }} transition={{ duration: 1, delay: 0.5 }} />
                  </div>
                  <div className="vdb-value" style={{ color: '#10b981' }}>9.0</div>
                </div>

                <div className="visual-db-row">
                  <div className="vdb-label">🎓 School Grade</div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <motion.div className="progress-fill" style={{ width: '80%', background: '#10b981' }} initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ duration: 1, delay: 0.7 }} />
                  </div>
                  <div className="vdb-value" style={{ color: '#10b981' }}>8.0</div>
                </div>

                <div className="visual-db-row">
                  <div className="vdb-label">🏥 Health Facilities</div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <motion.div className="progress-fill" style={{ width: '90%', background: '#10b981' }} initial={{ width: 0 }} animate={{ width: '90%' }} transition={{ duration: 1, delay: 0.9 }} />
                  </div>
                  <div className="vdb-value" style={{ color: '#10b981' }}>9.0</div>
                </div>

                <div className="visual-db-row">
                  <div className="vdb-label">🚗 Traffic Flow</div>
                  <div className="progress-bar" style={{ height: 6 }}>
                    <motion.div className="progress-fill" style={{ width: '70%', background: '#f59e0b' }} initial={{ width: 0 }} animate={{ width: '70%' }} transition={{ duration: 1, delay: 1.1 }} />
                  </div>
                  <div className="vdb-value" style={{ color: '#f59e0b' }}>7.0</div>
                </div>
              </div>

              {/* Floating cards removed as requested */}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ====== FEATURE CARDS ====== */}
      <section className="section features-section">
        <div className="container">
          <motion.div
            className="features-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {[
              {
                icon: <TrendingUp size={24} />,
                color: '#10b981',
                title: 'Neighborhood Score',
                desc: 'Comprehensive scoring based on safety, schools, hospitals, connectivity, and more.',
                link: '/compare',
              },
              {
                icon: <MessageSquare size={24} />,
                color: '#8b5cf6',
                title: 'Verified Reviews',
                desc: 'Authentic resident reviews with verified pros, cons, and helpful ratings.',
                link: '/reviews/1',
              },
              {
                icon: <Sparkles size={24} />,
                color: '#f59e0b',
                title: 'AI Insights',
                desc: 'AI-generated neighborhood analysis to help you make smarter decisions.',
                link: '/neighborhoods',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="feature-card"
                variants={fadeUp}
                whileHover={{ y: -6 }}
              >
                <div className="feature-icon" style={{ background: `${f.color}20`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <Link to={f.link} className="feature-link">
                  Learn more <ChevronRight size={14} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== POPULAR NEIGHBORHOODS ====== */}
      <section className="section">
        <div className="container">
          <div className="section-header flex justify-between items-center">
            <div>
              <h2 className="section-title">Popular Neighborhoods</h2>
              <p className="section-subtitle">Top-rated areas based on resident reviews and AI analysis</p>
            </div>
            <Link to="/neighborhoods" className="section-link hide-mobile">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <motion.div
            className="neighborhoods-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {neighborhoods.map((n, i) => (
              <motion.div key={n.id} variants={fadeUp} custom={i}>
                <NeighborhoodCard neighborhood={n} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ====== FEATURED HOMES ====== */}
      <section className="section featured-homes-section">
        <div className="container">
          <div className="section-header flex justify-between items-center">
            <div>
              <h2 className="section-title">Featured Homes</h2>
              <p className="section-subtitle">Handpicked properties in top-rated neighborhoods</p>
            </div>
            <Link to="/search" className="section-link hide-mobile">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <motion.div
            className="homes-grid"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {featuredProperties.map((p, i) => (
              <motion.div key={p.id} variants={fadeUp} custom={i}>
                <PropertyCard property={p} />
              </motion.div>
            ))}
          </motion.div>
          <div className="flex justify-center" style={{ marginTop: 40 }}>
            <Link to="/search" className="btn btn-secondary btn-lg">
              Browse All Properties <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ====== CTA BANNER ====== */}
      <section className="section cta-section">
        <div className="container">
          <motion.div
            className="cta-banner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="cta-blob" />
            <div className="cta-content">
              <h2>Own a property? List it on HOMIO</h2>
              <p>Reach thousands of verified home-seekers. Free listing for the first month.</p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/add-property" className="btn btn-primary btn-lg" id="cta-add-property">
                  Add Your Property <ArrowRight size={16} />
                </Link>
                <Link to="/search" className="btn btn-ghost btn-lg" id="cta-explore">
                  Explore Homes
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
