import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, X, SlidersHorizontal, Bed, Bath, Star, ArrowRight, ChevronDown, Home, Navigation } from 'lucide-react';
import { formatPrice, getScoreColor } from '../../data/mockData';
import { getProperties, getNeighborhoods } from '../../services/dataService';
import './MapPage.css';

// Simple map visualization (without actual Leaflet to avoid CSS conflicts)
export default function MapPage() {
  const [properties, setProperties] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterScore, setFilterScore] = useState(0);

  useEffect(() => {
    const loadMapData = async () => {
      const [pData, nData] = await Promise.all([getProperties(), getNeighborhoods()]);
      setProperties(pData);
      setNeighborhoods(nData);
    };
    loadMapData();
  }, []);

  const filtered = properties.filter(p => {
    if (filterType !== 'All' && p.listingType !== filterType) return false;
    if (p.neighborhoodScore < filterScore) return false;
    return true;
  });

  // Map positions (normalized 0-100 for our fake map grid)
  const pinPositions = [
    { id: 1, x: 42, y: 28, type: 'property' },
    { id: 2, x: 22, y: 60, type: 'property' },
    { id: 3, x: 65, y: 38, type: 'property' },
    { id: 4, x: 48, y: 55, type: 'property' },
    { id: 5, x: 70, y: 35, type: 'property' },
    { id: 6, x: 40, y: 25, type: 'property' },
    { id: 7, x: 72, y: 33, type: 'property' },
    { id: 8, x: 20, y: 63, type: 'property' },
  ];

  const getNeighborhoodScore = (nId, defaultScore) => {
    const found = neighborhoods.find(n => n.id === nId);
    return found ? found.overallScore : defaultScore;
  };

  const neighborhoodPins = [
    { id: 1, x: 40, y: 30, label: 'Patia', score: getNeighborhoodScore(1, 8.4) },
    { id: 2, x: 20, y: 60, label: 'Khandagiri', score: getNeighborhoodScore(2, 7.6) },
    { id: 3, x: 65, y: 40, label: 'CSP', score: getNeighborhoodScore(3, 8.2) },
    { id: 4, x: 50, y: 53, label: 'Nayapalli', score: getNeighborhoodScore(4, 7.6) },
  ];

  return (
    <div className="map-page">
      {/* Floating Filter Button */}
      <button className="map-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
        <SlidersHorizontal size={16} />
        Filters
        <ChevronDown size={14} style={{ transform: filtersOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            className="map-filter-panel"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="map-filter-header">
              <span>Filters</span>
              <button onClick={() => setFiltersOpen(false)}><X size={18} /></button>
            </div>

            <div className="filter-group">
              <label className="label">Rent / Buy</label>
              <div className="tabs">
                {['All', 'Rent', 'Buy'].map(t => (
                  <button key={t} className={`tab ${filterType === t ? 'active' : ''}`}
                    onClick={() => setFilterType(t)}>{t}</button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="label">Min Neighborhood Score: {filterScore}+</label>
              <input type="range" className="range-slider" min={0} max={10} step={0.5}
                value={filterScore} onChange={e => setFilterScore(+e.target.value)} />
            </div>

            <div className="filter-group">
              <label className="label">Property Type</label>
              <div className="select-wrap">
                <select className="select">
                  <option>Any</option>
                  <option>Apartment</option>
                  <option>Villa</option>
                </select>
                <ChevronDown size={14} className="select-icon" />
              </div>
            </div>

            <div className="map-listings">
              <div className="map-listings-title">Properties on map</div>
              {filtered.map(p => (
                <div
                  key={p.id}
                  className={`map-list-item ${selectedProperty?.id === p.id ? 'active' : ''}`}
                  onClick={() => setSelectedProperty(p)}
                >
                  <img src={p.images[0]} alt={p.title} className="map-list-img" />
                  <div>
                    <div className="map-list-price">{formatPrice(p.price, p.listingType)}</div>
                    <div className="map-list-name">{p.title}</div>
                    <div className="map-list-loc"><MapPin size={11} />{p.neighborhoodName}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Area */}
      <div className="map-area">
        {/* Fake map background with city grid */}
        <div className="map-bg">
          <div className="map-road map-road-h" style={{ top: '40%' }} />
          <div className="map-road map-road-h" style={{ top: '65%' }} />
          <div className="map-road map-road-v" style={{ left: '35%' }} />
          <div className="map-road map-road-v" style={{ left: '60%' }} />
          <div className="map-block" style={{ top: '15%', left: '10%', width: '20%', height: '20%' }} />
          <div className="map-block" style={{ top: '15%', left: '40%', width: '15%', height: '18%' }} />
          <div className="map-block" style={{ top: '50%', left: '65%', width: '22%', height: '15%' }} />
          <div className="map-block" style={{ top: '70%', left: '10%', width: '18%', height: '22%' }} />
          <div className="map-park" style={{ top: '45%', left: '38%', width: '16%', height: '14%' }} />
          <div className="map-water" style={{ top: '20%', left: '62%', width: '28%', height: '14%' }} />
          <div className="map-label" style={{ top: '42%', left: '40%' }}>Patia</div>
          <div className="map-label" style={{ top: '57%', left: '22%' }}>Khandagiri</div>
          <div className="map-label" style={{ top: '35%', left: '63%' }}>CSP</div>
          <div className="map-label" style={{ top: '52%', left: '50%' }}>Nayapalli</div>
        </div>

        {/* Neighborhood Score Pins */}
        {neighborhoodPins.map(pin => (
          <Link
            key={pin.id}
            to={`/neighborhoods/${pin.id}`}
            className="neighborhood-pin"
            style={{ left: `${pin.x}%`, top: `${pin.y}%`, background: getScoreColor(pin.score) }}
          >
            {pin.score}
          </Link>
        ))}

        {/* Property Pins */}
        {filtered.map((prop, i) => {
          const pos = pinPositions.find(p => p.id === prop.id) || { x: 30 + i * 5, y: 30 + i * 8 };
          return (
            <div key={prop.id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, zIndex: selectedProperty?.id === prop.id ? 20 : 10 }}>
              <motion.button
                className={`property-pin ${selectedProperty?.id === prop.id ? 'active' : ''}`}
                onClick={() => setSelectedProperty(selectedProperty?.id === prop.id ? null : prop)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <Home size={11} />
                {formatPrice(prop.price, prop.listingType)}
              </motion.button>

              {/* Popup */}
              <AnimatePresence>
                {selectedProperty?.id === prop.id && (
                  <motion.div
                    className="map-popup"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                  >
                    <button className="popup-close" onClick={() => setSelectedProperty(null)}><X size={12} /></button>
                    <img src={prop.images[0]} alt={prop.title} className="popup-img" />
                    <div className="popup-body">
                      <div className="popup-price">{formatPrice(prop.price, prop.listingType)}</div>
                      <div className="popup-title">{prop.title}</div>
                      <div className="popup-loc"><MapPin size={11} />{prop.neighborhoodName}</div>
                      <div className="popup-specs">
                        <span><Bed size={11} />{prop.bedrooms}</span>
                        <span><Bath size={11} />{prop.bathrooms}</span>
                        <span><Star size={11} />{prop.neighborhoodScore}</span>
                      </div>
                      <Link to={`/property/${prop.id}`} className="popup-btn">
                        View Details <ArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Zoom Controls */}
        <div className="map-zoom-controls">
          <button className="zoom-btn">+</button>
          <button className="zoom-btn">−</button>
          <button className="zoom-btn"><Navigation size={14} /></button>
        </div>

        {/* Legend */}
        <div className="map-legend">
          <div className="legend-item"><div className="legend-dot property-dot" /><span>Property</span></div>
          <div className="legend-item"><div className="legend-dot score-dot" /><span>Neighborhood Score</span></div>
          <div className="legend-item"><div className="legend-block park-dot" /><span>Park/Green</span></div>
        </div>
      </div>
    </div>
  );
}
