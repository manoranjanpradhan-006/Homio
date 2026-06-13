import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bed, Bath, Maximize2, MapPin, Star, Phone, Calendar,
  Heart, Share2, ChevronLeft, ChevronRight, CheckCircle,
  Building, Zap, Shield, Navigation, ArrowLeft
} from 'lucide-react';
import { formatPrice, getScoreColor, getScoreLabel } from '../../data/mockData';
import { getPropertyById, getNeighborhoodById, getProperties } from '../../services/dataService';
import { loadGoogleMaps } from '../../utils/mapLoader';
import { lightMapStyle, darkMapStyle } from '../../utils/mapStyles';
import { useTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import Footer from '../../components/Footer/Footer';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import './PropertyDetails.css';

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [neighborhood, setNeighborhood] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const { savedProperties, toggleProperty } = useFavorites();
  const [activeImg, setActiveImg] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const loadProperty = async () => {
      setLoading(true);
      const propData = await getPropertyById(id);
      if (propData) {
        setProperty(propData);
        const [neighData, allProps] = await Promise.all([
          getNeighborhoodById(propData.neighborhoodId),
          getProperties()
        ]);
        setNeighborhood(neighData);
        if (allProps) {
          const relatedProps = allProps.filter(p => p.id !== propData.id && p.neighborhoodId === propData.neighborhoodId).slice(0, 3);
          setRelated(relatedProps);
        }
      }
      setLoading(false);
    };
    loadProperty();
  }, [id]);

  useEffect(() => {
    if (loading || !property || !mapRef.current) return;

    loadGoogleMaps().then((google) => {
      const latlng = { lat: property.lat || 20.3500, lng: property.lng || 85.8200 };
      
      const mapOptions = {
        center: latlng,
        zoom: 15,
        styles: theme === 'dark' ? darkMapStyle : lightMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Place single marker
      new google.maps.Marker({
        position: latlng,
        map: map,
        title: property.title,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }
      });
    }).catch(err => {
      console.warn("Failed to load property location map:", err);
    });
  }, [property, loading]);

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({
        styles: theme === 'dark' ? darkMapStyle : lightMapStyle
      });
    }
  }, [theme]);

  if (loading || !property) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: 40 }}>
          <div className="skeleton" style={{ height: 400, marginBottom: 24, width: '100%', borderRadius: 16 }} />
          <div className="skeleton" style={{ height: 32, marginBottom: 12, width: '60%' }} />
          <div className="skeleton" style={{ height: 16, marginBottom: 40, width: '40%' }} />
        </div>
        <Footer />
      </div>
    );
  }

  const isSaved = savedProperties.includes(property.id);
  const scoreColor = getScoreColor(property.neighborhoodScore);
  const scoreFactors = neighborhood ? Object.entries(neighborhood.scores) : [];

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 24 }}>
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/"><ArrowLeft size={14} /> Home</Link>
          <span>/</span>
          <Link to="/search">Search Results</Link>
          <span>/</span>
          <span>{property.title}</span>
        </nav>

        <div className="pd-layout">
          {/* ====== LEFT: Gallery + Info ====== */}
          <div className="pd-left">
            {/* Gallery */}
            <div className="gallery">
              <div className="gallery-main">
                <img
                  src={property.images[activeImg]}
                  alt={property.title}
                  className="gallery-main-img"
                />
                {property.images.length > 1 && (
                  <>
                    <button className="gallery-nav prev" onClick={() => setActiveImg(i => (i - 1 + property.images.length) % property.images.length)}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className="gallery-nav next" onClick={() => setActiveImg(i => (i + 1) % property.images.length)}>
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                <div className="gallery-badges">
                  <span className={`badge ${property.listingType === 'Rent' ? 'badge-blue' : 'badge-orange'}`}>{property.listingType}</span>
                  {property.isNew && <span className="badge badge-green">New</span>}
                </div>
              </div>
              {property.images.length > 1 && (
                <div className="gallery-thumbs">
                  {property.images.map((img, i) => (
                    <button key={i} className={`thumb ${activeImg === i ? 'active' : ''}`} onClick={() => setActiveImg(i)}>
                      <img src={img} alt={`View ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="pd-section">
              <h3 className="pd-section-title">About this Property</h3>
              <p className="pd-description">{property.description}</p>
            </div>

            {/* Amenities */}
            <div className="pd-section">
              <h3 className="pd-section-title">Amenities & Features</h3>
              <div className="amenities-grid">
                {(property.amenities || ["Power Backup", "Security", "Car Parking"]).map((a, i) => (
                  <div key={i} className="amenity-item">
                    <CheckCircle size={16} className="amenity-icon" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood Score */}
            {neighborhood && (
              <div className="pd-section">
                <h3 className="pd-section-title">Neighborhood Score</h3>
                <div className="score-overview">
                  <div className="score-big" style={{ color: scoreColor }}>
                    <span className="score-number">{neighborhood.overallScore}</span>
                    <span className="score-denom">/10</span>
                    <div className="score-label-text" style={{ color: scoreColor }}>{getScoreLabel(neighborhood.overallScore)}</div>
                  </div>
                  <div className="score-factors">
                    {scoreFactors.map(([key, val]) => (
                      <div key={key} className="score-factor-row">
                        <span className="factor-label">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                        <div className="progress-bar">
                          <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${val * 10}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                        <span className="factor-value">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div className="pd-section">
              <h3 className="pd-section-title">Location</h3>
              <div className="map-placeholder" style={{ display: 'block', height: 260, padding: 0 }}>
                <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 16 }} />
              </div>
            </div>
          </div>

          {/* ====== RIGHT: Info Card ====== */}
          <aside className="pd-right">
            <div className="pd-info-card">
              {/* Price */}
              <div className="pd-price-row">
                <span className="pd-price">{formatPrice(property.price, property.listingType)}</span>
                <div className="pd-actions">
                  <button
                    className={`save-btn-lg ${isSaved ? 'saved' : ''}`}
                    onClick={() => toggleProperty(property.id)}
                    aria-label="Save"
                  >
                    <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                  <button className="save-btn-lg" aria-label="Share"><Share2 size={18} /></button>
                </div>
              </div>

              <h1 className="pd-title">{property.title}</h1>
              <div className="pd-address"><MapPin size={14} />{property.address}</div>

              {/* Score Badge */}
              <div className="pd-score-badge" style={{ background: `${scoreColor}20`, borderColor: `${scoreColor}40` }}>
                <Star size={14} fill={scoreColor} color={scoreColor} />
                <span style={{ color: scoreColor, fontWeight: 700 }}>{property.neighborhoodScore}/10</span>
                <span style={{ color: 'var(--text-secondary)' }}>{getScoreLabel(property.neighborhoodScore)} Neighborhood</span>
              </div>

              <div className="divider" />

              {/* Specs Table */}
              <div className="specs-table">
                {[
                  { icon: <Bed size={16} />, label: 'Bedrooms', val: property.bedrooms },
                  { icon: <Bath size={16} />, label: 'Bathrooms', val: property.bathrooms },
                  { icon: <Maximize2 size={16} />, label: 'Area', val: `${property.area} sq.ft` },
                  { icon: <Building size={16} />, label: 'Property Type', val: property.type },
                  { icon: <Zap size={16} />, label: 'Furnishing', val: property.furnishing },
                  { icon: <Shield size={16} />, label: 'Floor', val: property.floor },
                  { icon: <Calendar size={16} />, label: 'Available From', val: property.availableFrom },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="spec-row">
                    <div className="spec-label">{icon}{label}</div>
                    <div className="spec-val">{val}</div>
                  </div>
                ))}
              </div>

              <div className="divider" />

              {/* Nearest Market */}
              <div className="nearest-market">
                <div className="nm-header">
                  <Navigation size={16} className="nm-icon" />
                  <span className="nm-title">Nearest Market</span>
                </div>
                <div className="nm-info">
                  <span className="nm-name">{property.nearestMarket}</span>
                  <span className="nm-dist">{property.marketDistance} away</span>
                </div>
              </div>

              <div className="divider" />

              {/* CTA Buttons */}
              <div className="pd-cta">
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={() => setContactOpen(true)}
                  id="contact-owner-btn"
                >
                  <Phone size={16} /> Contact Owner
                </button>
                <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} id="schedule-visit-btn">
                  <Calendar size={16} /> Schedule Visit
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Properties */}
        {related.length > 0 && (
          <div className="pd-related">
            <h2 className="section-title">More in {property.neighborhoodName}</h2>
            <div className="related-grid">
              {related.map(p => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {contactOpen && (
        <div className="modal-overlay" onClick={() => setContactOpen(false)}>
          <motion.div
            className="contact-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            <h3>Contact Owner</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Send a message or call directly</p>
            <div className="form-group">
              <label className="label">Your Name</label>
              <input className="input" placeholder="Enter your name" />
            </div>
            <div className="form-group">
              <label className="label">Phone Number</label>
              <input className="input" placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="label">Message</label>
              <textarea className="textarea" placeholder="I'm interested in this property..." rows={3} />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-primary flex-1">Send Message</button>
              <button className="btn btn-secondary flex-1" onClick={() => setContactOpen(false)}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
