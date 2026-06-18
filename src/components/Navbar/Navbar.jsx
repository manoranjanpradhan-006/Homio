import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, User, Search, MapPin, Home, Map, Star, GitCompare, MessageSquare, Plus, Heart, X, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getNeighborhoods, getProperties } from '../../services/dataService';
import './Navbar.css';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search Homes', icon: Search },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/neighborhoods', label: 'Neighborhoods', icon: MapPin },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/reviews/1', label: 'Reviews', icon: Star },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [properties, setProperties] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Load items for search suggestions dynamically
  useEffect(() => {
    const loadSearchItems = async () => {
      const [nData, pData] = await Promise.all([getNeighborhoods(), getProperties()]);
      setNeighborhoods(nData || []);
      setProperties(pData || []);
    };
    loadSearchItems();
  }, [location.pathname]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSuggestions([]); return; }
    const q = searchQuery.toLowerCase();
    const nSugg = neighborhoods.filter(n =>
      n.name.toLowerCase().includes(q) || n.city.toLowerCase().includes(q)
    ).map(n => ({ type: 'neighborhood', label: `${n.name}, ${n.city}`, score: n.overallScore, id: n.id }));
    const pSugg = properties.filter(p =>
      p.title.toLowerCase().includes(q) || p.neighborhoodName.toLowerCase().includes(q)
    ).slice(0, 2).map(p => ({ type: 'property', label: p.title, sub: p.address, id: p.id }));
    setSuggestions([...nSugg.slice(0, 3), ...pSugg]);
  }, [searchQuery, neighborhoods, properties]);

  const handleSuggestionClick = (s) => {
    if (s.type === 'neighborhood') navigate(`/neighborhoods/${s.id}`);
    else navigate(`/property/${s.id}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-icon">
              <Home size={16} />
            </div>
            <span>HOMIO</span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links hide-mobile">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`nav-link ${location.pathname === to ? 'active' : ''}`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="nav-actions">
            {/* Search */}
            <button className="btn-icon nav-icon-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={18} />
            </button>

            {/* Notifications */}
            <button className="btn-icon nav-icon-btn hide-mobile" style={{ position: 'relative' }} aria-label="Notifications">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>

            {/* Theme Toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </button>

            {/* Add Property */}
            <Link to="/add-property" className="btn btn-primary btn-sm hide-mobile" id="nav-add-property">
              <Plus size={15} />
              Add Property
            </Link>

            {/* User */}
            <button className="avatar-btn hide-mobile" aria-label="User profile">
              <User size={16} />
            </button>

            {/* Mobile Menu */}
            <button className="btn-icon nav-icon-btn" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: 'none' }} aria-label="Menu" id="mobile-menu-btn">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} className={`mobile-nav-link ${location.pathname === to ? 'active' : ''}`}>
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <Link to="/add-property" className="mobile-nav-link accent">
                <Plus size={16} /> Add Property
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
          >
            <motion.div
              className="search-modal"
              initial={{ y: -40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="search-modal-inner">
                <Search size={20} className="search-modal-icon" />
                <input
                  ref={searchRef}
                  autoFocus
                  className="search-modal-input"
                  placeholder="Search neighborhoods, homes, cities..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                />
                <button className="btn-icon" onClick={() => setSearchOpen(false)}><X size={18} /></button>
              </div>

              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.ul 
                    className="search-suggestions"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {suggestions.map((s, i) => (
                      <motion.li 
                        key={i} 
                        className="suggestion-item" 
                        onClick={() => handleSuggestionClick(s)}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.005, backgroundColor: 'var(--bg-tertiary)' }}
                      >
                        {s.type === 'neighborhood'
                          ? <><MapPin size={14} className="suggestion-icon" /><span>{s.label}</span><span className="suggestion-score">{s.score}/10</span></>
                          : <><Home size={14} className="suggestion-icon" /><div><span>{s.label}</span><small>{s.sub}</small></div></>
                        }
                      </motion.li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
