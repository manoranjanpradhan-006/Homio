import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Upload, X, ChevronDown, MapPin, Home, CheckCircle } from 'lucide-react';
import Footer from '../../components/Footer/Footer';
import './AddProperty.css';

export default function AddProperty() {
  const [images, setImages] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [listingType, setListingType] = useState('Rent');
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setImages(prev => [...prev, url]);
    });
  };

  const removeImage = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ paddingTop: 80, textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="success-icon"
          >
            <CheckCircle size={60} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 12 }}>Property Submitted!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: '1.0625rem' }}>
              Your property has been submitted for review. We'll list it within 24 hours.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/" className="btn btn-primary btn-lg">Go to Home</Link>
              <button className="btn btn-secondary btn-lg" onClick={() => setSubmitted(false)}>Add Another</button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container ap-container">
        <div className="ap-header">
          <h1 className="section-title">Add New Property</h1>
          <p className="section-subtitle">List your property and reach thousands of verified home seekers</p>
        </div>

        <form className="ap-form" onSubmit={handleSubmit}>
          <div className="ap-layout">
            {/* Left Form */}
            <div className="ap-main">
              {/* Property Images */}
              <div className="ap-section">
                <h3 className="ap-section-title">
                  <span className="ap-step">1</span> Property Images
                </h3>
                <div
                  className={`image-upload-zone ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); handleFileChange({ target: { files: e.dataTransfer.files } }); }}
                  onClick={() => document.getElementById('img-upload').click()}
                >
                  <Upload size={28} className="upload-icon" />
                  <div className="upload-text">
                    <strong>Drag & drop images here</strong>
                    <span>or click to upload</span>
                    <small>PNG, JPG up to 10MB each</small>
                  </div>
                  <input id="img-upload" type="file" multiple accept="image/*" className="hidden-input" onChange={handleFileChange} />
                </div>
                {images.length > 0 && (
                  <div className="image-preview-grid">
                    {images.map((img, i) => (
                      <div key={i} className="preview-thumb">
                        <img src={img} alt={`Upload ${i+1}`} />
                        <button className="remove-img" type="button" onClick={() => removeImage(i)}><X size={12} /></button>
                        {i === 0 && <span className="main-badge">Main</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Details */}
              <div className="ap-section">
                <h3 className="ap-section-title">
                  <span className="ap-step">2</span> Property Details
                </h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="label">Property Type</label>
                    <div className="select-wrap">
                      <select className="select" required>
                        <option value="">Select Type</option>
                        <option>Apartment</option>
                        <option>Villa</option>
                        <option>Independent Floor</option>
                        <option>Studio</option>
                        <option>Penthouse</option>
                      </select>
                      <ChevronDown size={14} className="select-icon" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Listing Type</label>
                    <div className="tabs">
                      {['Rent', 'Buy'].map(t => (
                        <button key={t} type="button" className={`tab ${listingType === t ? 'active' : ''}`}
                          onClick={() => setListingType(t)}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Price {listingType === 'Rent' ? '(₹/month)' : '(₹)'}</label>
                    <input className="input" type="number" placeholder={listingType === 'Rent' ? 'e.g. 15000' : 'e.g. 4500000'} required />
                  </div>

                  <div className="form-group">
                    <label className="label">Bedrooms</label>
                    <div className="select-wrap">
                      <select className="select" required>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                        <option>5+</option>
                      </select>
                      <ChevronDown size={14} className="select-icon" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Bathrooms</label>
                    <div className="select-wrap">
                      <select className="select" required>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                      </select>
                      <ChevronDown size={14} className="select-icon" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Built-up Area (sq.ft)</label>
                    <input className="input" type="number" placeholder="e.g. 1100" required />
                  </div>

                  <div className="form-group">
                    <label className="label">Furnishing</label>
                    <div className="select-wrap">
                      <select className="select">
                        <option>Fully Furnished</option>
                        <option>Semi Furnished</option>
                        <option>Unfurnished</option>
                      </select>
                      <ChevronDown size={14} className="select-icon" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Floor</label>
                    <input className="input" placeholder="e.g. 3rd Floor" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="ap-section">
                <h3 className="ap-section-title">
                  <span className="ap-step">3</span> Location Details
                </h3>
                <div className="form-grid-2">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label className="label">Full Address</label>
                    <div className="input-with-icon">
                      <MapPin size={16} className="input-icon" />
                      <input className="input has-icon" placeholder="Plot no., Street, Area, City, State" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Neighborhood</label>
                    <div className="select-wrap">
                      <select className="select" required>
                        <option value="">Select Neighborhood</option>
                        <option>Patia</option>
                        <option>Khandagiri</option>
                        <option>Chandrasekharpur</option>
                        <option>Nayapalli</option>
                      </select>
                      <ChevronDown size={14} className="select-icon" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="label">Nearest Market</label>
                    <input className="input" placeholder="e.g. Patia Market" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="ap-section">
                <h3 className="ap-section-title">
                  <span className="ap-step">4</span> Description
                </h3>
                <div className="form-group">
                  <label className="label">Property Description</label>
                  <textarea
                    className="textarea"
                    rows={5}
                    placeholder="Describe the property, its surroundings, amenities, and what makes it special..."
                    style={{ minHeight: 140 }}
                  />
                </div>
              </div>

              {/* Owner Info */}
              <div className="ap-section">
                <h3 className="ap-section-title">
                  <span className="ap-step">5</span> Contact Details
                </h3>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="label">Your Name</label>
                    <input className="input" placeholder="Full name" required />
                  </div>
                  <div className="form-group">
                    <label className="label">Phone Number</label>
                    <input className="input" type="tel" placeholder="+91 98765 43210" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary */}
            <aside className="ap-sidebar">
              <div className="ap-summary-card">
                <h4>Listing Preview</h4>
                <div className="preview-placeholder">
                  {images[0] ? (
                    <img src={images[0]} alt="Preview" className="preview-main-img" />
                  ) : (
                    <div className="no-preview">
                      <Home size={32} />
                      <span>Images will appear here</span>
                    </div>
                  )}
                </div>
                <div className="preview-info">
                  <div className="preview-price">Price after submission</div>
                  <div className="preview-loc"><MapPin size={13} /> Location details</div>
                </div>
              </div>

              <div className="ap-tips">
                <h4>💡 Tips for Better Listings</h4>
                <ul>
                  <li>Upload at least 5 high-quality images</li>
                  <li>Mention exact distance to markets</li>
                  <li>Include all available amenities</li>
                  <li>Write a detailed description</li>
                  <li>Keep contact info up to date</li>
                </ul>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} id="submit-property-btn">
                <CheckCircle size={16} /> Submit Property
              </button>
            </aside>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
