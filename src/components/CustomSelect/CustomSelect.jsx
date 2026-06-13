import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

export default function CustomSelect({
  options = [],
  value = '',
  onChange,
  name,
  required = false,
  placeholder = 'Select option...',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { name, value: val } });
    }
    setIsOpen(false);
  };

  const getOptionLabel = (val) => {
    const found = options.find(opt => 
      typeof opt === 'object' ? opt.value === val : opt === val
    );
    if (!found) return placeholder;
    return typeof found === 'object' ? found.label : found;
  };

  const getOptionValue = (opt) => {
    return typeof opt === 'object' ? opt.value : opt;
  };

  const getOptionDisplay = (opt) => {
    return typeof opt === 'object' ? opt.label : opt;
  };

  return (
    <div className={`custom-select-container ${className}`} ref={containerRef}>
      {/* Hidden input for HTML form submissions */}
      {name && (
        <input 
          type="hidden" 
          name={name} 
          value={value} 
          required={required} 
        />
      )}
      
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={!value ? 'placeholder-text' : ''}>
          {value ? getOptionLabel(value) : placeholder}
        </span>
        <ChevronDown size={14} className={`trigger-icon ${isOpen ? 'open' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="custom-select-dropdown"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <ul className="custom-select-options">
              {options.map((opt, i) => {
                const val = getOptionValue(opt);
                const display = getOptionDisplay(opt);
                const isSelected = val === value;
                return (
                  <li
                    key={i}
                    className={`custom-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(val)}
                  >
                    {display}
                    {isSelected && (
                      <span className="selected-dot" />
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
