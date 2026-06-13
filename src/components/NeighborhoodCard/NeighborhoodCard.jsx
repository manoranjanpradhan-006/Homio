import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ArrowRight } from 'lucide-react';
import { useFavorites } from '../../context/FavoritesContext';
import { getScoreColor, getScoreLabel } from '../../data/mockData';
import './NeighborhoodCard.css';

export default function NeighborhoodCard({ neighborhood }) {
  const { savedNeighborhoods, toggleNeighborhood } = useFavorites();
  const isSaved = savedNeighborhoods.includes(neighborhood.id);
  const scoreColor = getScoreColor(neighborhood.overallScore);

  return (
    <motion.div
      className="neighborhood-card"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="nc-image-wrap">
        <Link to={`/neighborhoods/${neighborhood.id}`}>
          <img src={neighborhood.image} alt={neighborhood.name} className="nc-img" loading="lazy" />
          <div className="nc-overlay" />
        </Link>
        <button
          className={`nc-save ${isSaved ? 'saved' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleNeighborhood(neighborhood.id); }}
        >
          <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <div className="nc-score" style={{ background: scoreColor }}>
          {neighborhood.overallScore}
        </div>
      </div>

      <div className="nc-content">
        <div>
          <Link to={`/neighborhoods/${neighborhood.id}`} className="nc-name">{neighborhood.name}</Link>
          <div className="nc-city"><MapPin size={12} />{neighborhood.city}, {neighborhood.state}</div>
        </div>
        <div className="nc-label" style={{ color: scoreColor, background: `${scoreColor}20` }}>
          {getScoreLabel(neighborhood.overallScore)}
        </div>
      </div>

      <Link to={`/neighborhoods/${neighborhood.id}`} className="nc-explore">
        Explore <ArrowRight size={13} />
      </Link>
    </motion.div>
  );
}
