import { Link } from 'react-router-dom';
import { Home, Mail, Phone, Globe, Share2, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon"><Home size={16} /></div>
              <span>HOMIO</span>
            </Link>
            <p className="footer-tagline">Find the right neighborhood. Find the right home. Real insights, real reviews, better decisions.</p>
            <div className="footer-social">
              <a href="#" aria-label="Website"><Globe size={16} /></a>
              <a href="#" aria-label="Share"><Share2 size={16} /></a>
              <a href="#" aria-label="Contact"><Mail size={16} /></a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/search">Search Homes</Link></li>
              <li><Link to="/map">Interactive Map</Link></li>
              <li><Link to="/neighborhoods">Neighborhoods</Link></li>
              <li><Link to="/compare">Compare Areas</Link></li>
              <li><Link to="/reviews/1">Reviews</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>For Owners</h4>
            <ul>
              <li><Link to="/add-property">Add Property</Link></li>
              <li><a href="#">Premium Listings</a></li>
              <li><a href="#">Dashboard</a></li>
              <li><a href="#">Pricing</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@homio.in"><Mail size={13} /> hello@homio.in</a></li>
              <li><a href="tel:+919876543210"><Phone size={13} /> +91 98765 43210</a></li>
              <li><a href="#"><MapPin size={13} /> Bhubaneswar, Odisha</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 HOMIO. All rights reserved. Made with ♥ in Bhubaneswar.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
