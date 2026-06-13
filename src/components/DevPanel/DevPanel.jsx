import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, X, Check, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { isConfigured, firebaseConfig } from '../../firebase';
import { seedFirestore } from '../../services/dataService';
import './DevPanel.css';

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [seedState, setSeedState] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSeed = async () => {
    setSeedState('loading');
    setErrorMsg('');
    try {
      await seedFirestore();
      setSeedState('success');
      setTimeout(() => setSeedState('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSeedState('error');
      setErrorMsg(err.message || 'Seeding failed. See console.');
    }
  };

  const getEnvStatus = (val) => {
    if (!val) return { label: 'Missing', class: 'status-missing', icon: <X size={12} /> };
    if (val.startsWith('your_')) return { label: 'Placeholder', class: 'status-placeholder', icon: <AlertTriangle size={12} /> };
    return { label: 'Configured', class: 'status-ok', icon: <Check size={12} /> };
  };

  return (
    <>
      {/* Floating Status Button */}
      <button 
        className={`dev-floating-btn ${isConfigured ? 'configured' : 'fallback'}`}
        onClick={() => setIsOpen(true)}
        title={isConfigured ? 'Firebase Active (Click to inspect)' : 'Using Mock Fallback Data (Click to inspect)'}
      >
        <Database size={20} className={isConfigured ? 'pulse-db' : ''} />
        <span className="btn-label">Database</span>
        <span className="status-dot"></span>
      </button>

      {/* Slide-over Dev Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div 
              className="dev-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Panel Card */}
            <motion.div 
              className="dev-panel glass-card"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="panel-header">
                <div className="header-title">
                  <Database size={18} className="title-icon" />
                  <h3>Dev Database Console</h3>
                </div>
                <button className="panel-close-btn" onClick={() => setIsOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="panel-body">
                {/* Connection Status Card */}
                <div className={`status-card ${isConfigured ? 'card-ok' : 'card-warn'}`}>
                  <div className="status-header">
                    <h4>Backend State</h4>
                    <span className={`status-badge ${isConfigured ? 'badge-ok' : 'badge-warn'}`}>
                      {isConfigured ? 'Firestore Mode' : 'Mock Fallback Mode'}
                    </span>
                  </div>
                  <p className="status-desc">
                    {isConfigured 
                      ? 'Homio is currently connected to Firebase Firestore and saving/retrieving data in real-time.' 
                      : 'Homio is currently using static local data because the Firebase credentials are missing or unconfigured.'}
                  </p>
                </div>

                {/* Env Diagnostics */}
                <div className="diag-section">
                  <h4 className="section-header">Environment Variables</h4>
                  <div className="diag-list">
                    {[
                      { name: 'VITE_FIREBASE_API_KEY', val: firebaseConfig.apiKey },
                      { name: 'VITE_FIREBASE_PROJECT_ID', val: firebaseConfig.projectId },
                      { name: 'VITE_FIREBASE_AUTH_DOMAIN', val: firebaseConfig.authDomain },
                      { name: 'VITE_FIREBASE_APP_ID', val: firebaseConfig.appId },
                    ].map((env, i) => {
                      const stat = getEnvStatus(env.val);
                      return (
                        <div key={i} className="diag-item">
                          <span className="env-name">{env.name}</span>
                          <span className={`env-status ${stat.class}`}>
                            {stat.icon}
                            {stat.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Seeding Controls */}
                <div className="seeding-section">
                  <h4 className="section-header">Database Seeding</h4>
                  <p className="section-desc">
                    If your Firestore instance is new and empty, click the button below to automatically seed the collections for neighborhoods, properties, and reviews.
                  </p>

                  <button 
                    className={`btn dev-seed-btn ${!isConfigured ? 'disabled' : ''} ${seedState}`}
                    onClick={handleSeed}
                    disabled={!isConfigured || seedState === 'loading'}
                  >
                    {seedState === 'loading' && <RefreshCw size={14} className="spin" />}
                    {seedState === 'success' && <Check size={14} />}
                    {seedState === 'error' && <AlertTriangle size={14} />}
                    
                    {seedState === 'idle' && 'Seed Mock Data to Firestore'}
                    {seedState === 'loading' && 'Seeding collections...'}
                    {seedState === 'success' && 'Seeded Successfully!'}
                    {seedState === 'error' && 'Failed to Seed'}
                  </button>

                  {errorMsg && (
                    <div className="seed-error-alert">
                      <AlertTriangle size={14} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {!isConfigured && (
                    <p className="seed-help-text">
                      ⚠️ Seeding is disabled because Firebase is not configured.
                    </p>
                  )}
                </div>
              </div>

              <div className="panel-footer">
                <Layers size={14} />
                <span>Homio Developers Console · v1.0</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
