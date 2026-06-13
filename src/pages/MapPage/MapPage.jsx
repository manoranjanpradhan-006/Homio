import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, X, SlidersHorizontal, Bed, Bath, Star, ArrowRight, ChevronDown, Home, Navigation } from 'lucide-react';
import { formatPrice, getScoreColor } from '../../data/mockData';
import { getProperties, getNeighborhoods } from '../../services/dataService';
import { loadGoogleMaps, createCustomMarkerClass } from '../../utils/mapLoader';
import { lightMapStyle, darkMapStyle } from '../../utils/mapStyles';
import { useTheme } from '../../context/ThemeContext';
import './MapPage.css';

export default function MapPage() {
  const [properties, setProperties] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [filterScore, setFilterScore] = useState(0);
  
  const { theme } = useTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const customMarkersRef = useRef([]);

  useEffect(() => {
    const loadMapData = async () => {
      const [pData, nData] = await Promise.all([getProperties(), getNeighborhoods()]);
      setProperties(pData || []);
      setNeighborhoods(nData || []);
    };
    loadMapData();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    loadGoogleMaps().then((google) => {
      const mapOptions = {
        center: { lat: 20.3150, lng: 85.8150 }, // Bhubaneswar center
        zoom: 12.5,
        styles: theme === 'dark' ? darkMapStyle : lightMapStyle,
        disableDefaultUI: true,
        zoomControl: false,
        gestureHandling: 'cooperative'
      };

      const map = new google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;
    }).catch(err => {
      console.warn("Failed to load Google Map, falling back to mock UI:", err);
    });
  }, []);

  // React to theme changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({
        styles: theme === 'dark' ? darkMapStyle : lightMapStyle
      });
    }
  }, [theme]);

  const filtered = properties.filter(p => {
    if (filterType !== 'All' && p.listingType !== filterType) return false;
    if (p.neighborhoodScore < filterScore) return false;
    return true;
  });

  // Sync Markers when filtered properties or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    const google = window.google;
    const CustomMarker = createCustomMarkerClass(google);

    // Clear previous custom markers
    customMarkersRef.current.forEach(m => {
      if (m.onRemove) m.onRemove();
    });
    customMarkersRef.current = [];

    // 1. Add properties markers
    filtered.forEach((prop) => {
      if (!prop.lat || !prop.lng) return;
      const latlng = new google.maps.LatLng(prop.lat, prop.lng);
      
      const isActive = selectedProperty?.id === prop.id;
      const html = `
        <button class="property-pin ${isActive ? 'active' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>${formatPrice(prop.price, prop.listingType)}</span>
        </button>
      `;

      const marker = new CustomMarker(latlng, mapInstanceRef.current, html, () => {
        setSelectedProperty(isActive ? null : prop);
      });

      customMarkersRef.current.push(marker);
    });

    // 2. Add neighborhood score markers
    const neighborhoodCoords = {
      1: { lat: 20.3550, lng: 85.8180 }, // Patia
      2: { lat: 20.2780, lng: 85.7820 }, // Khandagiri
      3: { lat: 20.3150, lng: 85.8100 }, // CSP
      4: { lat: 20.2950, lng: 85.8000 }  // Nayapalli
    };

    neighborhoods.forEach((neigh) => {
      const coords = neighborhoodCoords[neigh.id];
      if (!coords) return;
      
      const latlng = new google.maps.LatLng(coords.lat, coords.lng);
      const scoreColor = getScoreColor(neigh.overallScore);
      
      const html = `
        <a href="#/neighborhoods/${neigh.id}" class="neighborhood-pin" style="background: ${scoreColor}">
          ${neigh.overallScore}
        </a>
      `;

      const marker = new CustomMarker(latlng, mapInstanceRef.current, html, () => {
        window.location.hash = `/neighborhoods/${neigh.id}`;
      });

      customMarkersRef.current.push(marker);
    });

  }, [filtered, selectedProperty, neighborhoods]);

  const handleSelectFromSidebar = (prop) => {
    setSelectedProperty(prop);
    if (mapInstanceRef.current && window.google) {
      mapInstanceRef.current.panTo({ lat: prop.lat, lng: prop.lng });
      mapInstanceRef.current.setZoom(15);
    }
  };

  const handleZoom = (diff) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + diff);
  };

  const recenterMap = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setCenter({ lat: 20.3150, lng: 85.8150 });
    mapInstanceRef.current.setZoom(12.5);
    setSelectedProperty(null);
  };

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

            <div className="map-listings">
              <div className="map-listings-title">Properties on map</div>
              {filtered.map(p => (
                <div
                  key={p.id}
                  className={`map-list-item ${selectedProperty?.id === p.id ? 'active' : ''}`}
                  onClick={() => handleSelectFromSidebar(p)}
                >
                  <img src={p.images[0]} alt={p.title} className="map-list-img" />
                  <div>
                    <div className="map-list-price">{formatPrice(p.price, p.listingType)}</div>
                    <div className="map-list-name">{p.title}</div>
                    <div className="map-list-loc"><MapPin size={11} />{p.neighborhoodName}</div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8125rem', padding: '10px 0' }}>No matching properties found.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Area */}
      <div className="map-area">
        {/* Google Map Div Ref */}
        <div ref={mapContainerRef} className="map-bg">
          {/* Fallback mock map container shown only when API fails to load */}
          <div className="map-fallback-grid">
            <div className="map-label" style={{ top: '42%', left: '40%' }}>Loading Google Maps...</div>
          </div>
        </div>

        {/* Floating Property Card Popup */}
        <AnimatePresence>
          {selectedProperty && (
            <motion.div
              className="map-floating-popup"
              initial={{ opacity: 0, y: 40, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              transition={{ duration: 0.25 }}
            >
              <button className="popup-close" onClick={() => setSelectedProperty(null)}><X size={12} /></button>
              <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="popup-img" />
              <div className="popup-body">
                <div className="popup-price">{formatPrice(selectedProperty.price, selectedProperty.listingType)}</div>
                <div className="popup-title">{selectedProperty.title}</div>
                <div className="popup-loc"><MapPin size={11} />{selectedProperty.neighborhoodName}</div>
                <div className="popup-specs">
                  <span><Bed size={11} />{selectedProperty.bedrooms} Beds</span>
                  <span><Bath size={11} />{selectedProperty.bathrooms} Baths</span>
                  <span><Star size={11} />{selectedProperty.neighborhoodScore} Score</span>
                </div>
                <Link to={`/property/${selectedProperty.id}`} className="popup-btn">
                  View Details <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom Controls */}
        <div className="map-zoom-controls">
          <button className="zoom-btn" onClick={() => handleZoom(1)}>+</button>
          <button className="zoom-btn" onClick={() => handleZoom(-1)}>−</button>
          <button className="zoom-btn" onClick={recenterMap}><Navigation size={14} /></button>
        </div>

        {/* Legend */}
        <div className="map-legend">
          <div className="legend-item"><div className="legend-dot property-dot" /><span>Property</span></div>
          <div className="legend-item"><div className="legend-dot score-dot" /><span>Neighborhood Score</span></div>
        </div>
      </div>
    </div>
  );
}
