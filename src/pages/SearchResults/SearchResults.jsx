import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProperties } from '../../services/dataService';
import PropertyCard from '../../components/PropertyCard/PropertyCard';
import Footer from '../../components/Footer/Footer';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import './SearchResults.css';

const PER_PAGE = 6;

export default function SearchResults() {
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({
    type: 'All', minPrice: 5000, maxPrice: 100000,
    neighborhood: 'All', bedrooms: 'Any',
    propType: 'Any', furnishing: 'Any',
  });
  const [sort, setSort] = useState('score');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProps = async () => {
      const data = await getProperties();
      setProperties(data);
    };
    fetchProps();
  }, []);

  const setFilter = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };

  const filtered = useMemo(() => {
    let list = [...properties];
    if (filters.type !== 'All') list = list.filter(p => p.listingType === filters.type);
    if (filters.neighborhood !== 'All') list = list.filter(p => p.neighborhoodName === filters.neighborhood);
    if (filters.bedrooms !== 'Any') list = list.filter(p => p.bedrooms === parseInt(filters.bedrooms));
    if (filters.propType !== 'Any') list = list.filter(p => p.type === filters.propType);
    if (filters.furnishing !== 'Any') list = list.filter(p => p.furnishing.includes(filters.furnishing));

    if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'score') list.sort((a, b) => b.neighborhoodScore - a.neighborhoodScore);
    else if (sort === 'newest') list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [filters, sort, properties]);

  const paginated = filtered;

  const FilterSidebar = () => (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <span className="filter-title">Filters</span>
        <button className="filter-clear" onClick={() => setFilters({ type: 'All', minPrice: 5000, maxPrice: 100000, neighborhood: 'All', bedrooms: 'Any', propType: 'Any', furnishing: 'Any' })}>
          Clear all
        </button>
      </div>

      {/* Budget */}
      <div className="filter-group">
        <label className="label">Budget (₹/month)</label>
        <div className="price-inputs">
          <input type="number" className="input" placeholder="Min" value={filters.minPrice}
            onChange={e => setFilter('minPrice', +e.target.value)} />
          <span>–</span>
          <input type="number" className="input" placeholder="Max" value={filters.maxPrice}
            onChange={e => setFilter('maxPrice', +e.target.value)} />
        </div>
        <input type="range" className="range-slider" min="5000" max="200000" step="1000"
          value={filters.maxPrice}
          onChange={e => setFilter('maxPrice', +e.target.value)}
        />
      </div>

      {/* Rent / Buy */}
      <div className="filter-group">
        <label className="label">Rent / Buy</label>
        <div className="tabs">
          {['All', 'Rent', 'Buy'].map(t => (
            <button key={t} className={`tab ${filters.type === t ? 'active' : ''}`} onClick={() => setFilter('type', t)}>{t}</button>
          ))}
        </div>
      </div>

      {/* Neighborhood */}
      <div className="filter-group">
        <label className="label">Neighborhood</label>
        <CustomSelect
          value={filters.neighborhood}
          onChange={e => setFilter('neighborhood', e.target.value)}
          options={[
            { value: 'All', label: 'All Areas' },
            { value: 'Patia', label: 'Patia' },
            { value: 'Khandagiri', label: 'Khandagiri' },
            { value: 'Chandrasekharpur', label: 'Chandrasekharpur' },
            { value: 'Nayapalli', label: 'Nayapalli' }
          ]}
        />
      </div>

      {/* Bedrooms */}
      <div className="filter-group">
        <label className="label">Bedrooms</label>
        <div className="bed-buttons">
          {['Any', '1', '2', '3', '4'].map(b => (
            <button key={b} className={`bed-btn ${filters.bedrooms === b ? 'active' : ''}`}
              onClick={() => setFilter('bedrooms', b)}>{b === '4' ? '4+' : b}</button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="filter-group">
        <label className="label">Property Type</label>
        <CustomSelect
          value={filters.propType}
          onChange={e => setFilter('propType', e.target.value)}
          options={[
            { value: 'Any', label: 'Any' },
            { value: 'Apartment', label: 'Apartment' },
            { value: 'Villa', label: 'Villa' },
            { value: 'Independent Floor', label: 'Independent Floor' },
            { value: 'Studio', label: 'Studio' }
          ]}
        />
      </div>

      {/* Furnishing */}
      <div className="filter-group">
        <label className="label">Furnishing</label>
        <CustomSelect
          value={filters.furnishing}
          onChange={e => setFilter('furnishing', e.target.value)}
          options={[
            { value: 'Any', label: 'Any' },
            { value: 'Fully', label: 'Fully Furnished' },
            { value: 'Semi', label: 'Semi Furnished' },
            { value: 'Unfurnished', label: 'Unfurnished' }
          ]}
        />
      </div>

      <button className="btn btn-primary w-full" style={{ width: '100%' }} onClick={() => setPage(1)}>
        Apply Filters
      </button>
    </aside>
  );

  return (
    <div className="page-wrapper search-page-wrapper">
      <div className="search-page">
        {/* Mobile Filter Toggle */}
        <div className="mobile-filter-bar">
          <span className="results-count-sm">{filtered.length} homes found</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
            <SlidersHorizontal size={15} /> Filters
          </button>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <motion.div className="mobile-filter-drawer"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.3 }}
            >
              <div className="mobile-filter-close">
                <span>Filters</span>
                <button onClick={() => setMobileFiltersOpen(false)}><X size={20} /></button>
              </div>
              <FilterSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Filter Sidebar */}
        <div className="filter-sidebar-wrap hide-mobile">
          <FilterSidebar />
        </div>

        {/* Main Content */}
        <main className="search-main">
          <div className="search-toolbar">
            <h1 className="search-count">{filtered.length} Homes Found</h1>
            <div className="sort-wrap">
              <ArrowUpDown size={15} />
              <CustomSelect
                value={sort}
                onChange={e => setSort(e.target.value)}
                options={[
                  { value: 'score', label: 'Best Score' },
                  { value: 'priceAsc', label: 'Lowest Price' },
                  { value: 'priceDesc', label: 'Highest Price' },
                  { value: 'newest', label: 'Newest' }
                ]}
                className="sort-custom-select"
              />
            </div>
          </div>

          {/* Results Grid */}
          <motion.div
            className="results-grid"
            key={`${JSON.stringify(filters)}-${sort}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {paginated.length > 0 ? (
              paginated.map(p => <PropertyCard key={p.id} property={p} />)
            ) : (
              <div className="no-results">
                <p>No properties found. Try adjusting your filters.</p>
              </div>
            )}
          </motion.div>

          <Footer />
        </main>
      </div>
    </div>
  );
}
