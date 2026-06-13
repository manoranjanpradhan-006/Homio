import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Star, Plus, X, ChevronDown } from 'lucide-react';
import { reviews, neighborhoods } from '../../data/mockData';
import Footer from '../../components/Footer/Footer';
import './Reviews.css';

const ALL_REVIEWS = [
  ...reviews,
  {
    id: 10, neighborhoodId: 1, user: "Aditya K.", avatar: "AK", avatarColor: "#0ea5e9",
    verified: true, rating: 5.0, date: "1 week ago",
    pros: ["Best place I've lived", "Extremely safe", "Great neighbors"],
    cons: ["Can be expensive"], helpful: 22, notHelpful: 0,
  },
  {
    id: 11, neighborhoodId: 2, user: "Smita R.", avatar: "SR", avatarColor: "#6366f1",
    verified: false, rating: 3.5, date: "3 months ago",
    pros: ["Heritage vibes", "Good air quality"], cons: ["Traffic near caves", "Limited entertainment"],
    helpful: 5, notHelpful: 3,
  },
];

export default function Reviews() {
  const { id } = useParams();
  const neighborhoodId = parseInt(id) || 1;
  const neighborhood = neighborhoods.find(n => n.id === neighborhoodId) || neighborhoods[0];

  const [tab, setTab] = useState('latest');
  const [addOpen, setAddOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [helpful, setHelpful] = useState({});

  const neighborhoodReviews = ALL_REVIEWS.filter(r => r.neighborhoodId === neighborhoodId);
  const avgRating = neighborhoodReviews.length
    ? neighborhoodReviews.reduce((s, r) => s + r.rating, 0) / neighborhoodReviews.length
    : 0;

  const sorted = [...neighborhoodReviews].sort((a, b) => {
    if (tab === 'helpful') return b.helpful - a.helpful;
    if (tab === 'highest') return b.rating - a.rating;
    return b.id - a.id;
  });

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: neighborhoodReviews.filter(r => Math.floor(r.rating) === star).length,
    pct: neighborhoodReviews.length
      ? Math.round((neighborhoodReviews.filter(r => Math.floor(r.rating) === star).length / neighborhoodReviews.length) * 100)
      : 0,
  }));

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: 32 }}>
        <div className="reviews-layout">
          {/* Left: Ratings Widget */}
          <aside className="reviews-sidebar">
            <div className="rating-widget">
              <div className="rw-header">
                <div className="rw-score">{avgRating.toFixed(1)}</div>
                <div>
                  <div className="rw-stars">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={20} fill={s <= avgRating ? '#f59e0b' : 'none'} color={s <= avgRating ? '#f59e0b' : 'var(--border-strong)'} />
                    ))}
                  </div>
                  <div className="rw-count">{neighborhoodReviews.length} reviews</div>
                </div>
              </div>
              <div className="rating-dist">
                {dist.map(({ star, count, pct }) => (
                  <div key={star} className="dist-row">
                    <span className="dist-star">{star} ★</span>
                    <div className="progress-bar">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        style={{ background: star >= 4 ? '#10b981' : star === 3 ? '#f59e0b' : '#ef4444' }}
                      />
                    </div>
                    <span className="dist-pct">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="neighborhood-summary-widget">
              <h4>{neighborhood.name}</h4>
              <div className="nsw-score">{neighborhood.overallScore}/10 · {neighborhood.city}</div>
              <p className="nsw-desc">{neighborhood.description.slice(0, 120)}...</p>
            </div>
          </aside>

          {/* Right: Reviews List */}
          <main className="reviews-main">
            <div className="reviews-toolbar">
              <h1 className="reviews-title">Reviews · {neighborhood.name}</h1>
              <button className="btn btn-primary" onClick={() => setAddOpen(true)} id="add-review-btn">
                <Plus size={15} /> Add Review
              </button>
            </div>

            {/* Tabs */}
            <div className="tabs reviews-tabs">
              {[
                { key: 'latest', label: 'Latest' },
                { key: 'helpful', label: 'Most Helpful' },
                { key: 'highest', label: 'Highest Rated' },
              ].map(t => (
                <button key={t.key} className={`tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Review Cards */}
            <div className="review-list">
              <AnimatePresence>
                {sorted.map((review, i) => (
                  <motion.div
                    key={review.id}
                    className="review-card-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="rcf-header">
                      <div className="rcf-avatar" style={{ background: review.avatarColor }}>{review.avatar}</div>
                      <div className="rcf-user-info">
                        <div className="rcf-name">
                          {review.user}
                          {review.verified && <span className="verified-tag">✓ Verified Resident</span>}
                        </div>
                        <div className="rcf-meta">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} fill={s <= review.rating ? '#f59e0b' : 'none'} color={s <= review.rating ? '#f59e0b' : 'var(--border-strong)'} />
                          ))}
                          <span>{review.rating}</span>
                          <span className="rcf-date">· {review.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="rcf-body">
                      {review.pros.length > 0 && (
                        <div className="rcf-section pros">
                          <div className="rcf-section-header"><ThumbsUp size={14} /> Pros</div>
                          <ul>{review.pros.map((p, j) => <li key={j}>{p}</li>)}</ul>
                        </div>
                      )}
                      {review.cons.length > 0 && (
                        <div className="rcf-section cons">
                          <div className="rcf-section-header"><ThumbsDown size={14} /> Cons</div>
                          <ul>{review.cons.map((c, j) => <li key={j}>{c}</li>)}</ul>
                        </div>
                      )}
                    </div>

                    <div className="rcf-footer">
                      <span className="helpful-label">Was this helpful?</span>
                      <button
                        className={`helpful-btn ${helpful[review.id] === 'yes' ? 'active' : ''}`}
                        onClick={() => setHelpful(h => ({ ...h, [review.id]: h[review.id] === 'yes' ? null : 'yes' }))}
                      >
                        <ThumbsUp size={13} /> {review.helpful + (helpful[review.id] === 'yes' ? 1 : 0)}
                      </button>
                      <button
                        className={`helpful-btn neg ${helpful[review.id] === 'no' ? 'active' : ''}`}
                        onClick={() => setHelpful(h => ({ ...h, [review.id]: h[review.id] === 'no' ? null : 'no' }))}
                      >
                        <ThumbsDown size={13} /> {review.notHelpful + (helpful[review.id] === 'no' ? 1 : 0)}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {sorted.length === 0 && (
                <div className="no-reviews-state">
                  <Star size={40} color="var(--text-tertiary)" />
                  <p>No reviews yet. Be the first!</p>
                  <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
                    <Plus size={14} /> Write a Review
                  </button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Add Review Button */}
      <button
        className="fab-add-review"
        onClick={() => setAddOpen(true)}
        id="fab-add-review"
        aria-label="Add review"
      >
        <Plus size={22} />
      </button>

      {/* Add Review Modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAddOpen(false)}
          >
            <motion.div
              className="add-review-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="arm-header">
                <h3>Write a Review</h3>
                <button onClick={() => setAddOpen(false)}><X size={20} /></button>
              </div>

              <div className="arm-body">
                <div className="form-group">
                  <label className="label">Neighborhood</label>
                  <div className="select-wrap">
                    <select className="select">
                      {neighborhoods.map(n => <option key={n.id}>{n.name}, {n.city}</option>)}
                    </select>
                    <ChevronDown size={14} className="select-icon" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Your Rating</label>
                  <div className="star-picker">
                    {[1,2,3,4,5].map(s => (
                      <Star
                        key={s}
                        size={28}
                        fill={(hoverRating || newRating) >= s ? '#f59e0b' : 'none'}
                        color={(hoverRating || newRating) >= s ? '#f59e0b' : 'var(--border-strong)'}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewRating(s)}
                      />
                    ))}
                    <span className="rating-text">{newRating}.0</span>
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Pros (comma separated)</label>
                  <input className="input" placeholder="Safe area, Good transport, Friendly neighbors" />
                </div>

                <div className="form-group">
                  <label className="label">Cons (comma separated)</label>
                  <input className="input" placeholder="Traffic congestion, Parking issues" />
                </div>

                <div className="form-group">
                  <label className="label">Full Review</label>
                  <textarea className="textarea" placeholder="Share your detailed experience..." rows={4} />
                </div>

                <div className="form-group">
                  <label className="label">Your Name</label>
                  <input className="input" placeholder="Enter your name" />
                </div>

                <button className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Review
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
