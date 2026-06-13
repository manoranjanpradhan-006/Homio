import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [savedProperties, setSavedProperties] = useState(() => {
    try { return JSON.parse(localStorage.getItem('homio-saved-props') || '[]'); } catch { return []; }
  });
  const [savedNeighborhoods, setSavedNeighborhoods] = useState(() => {
    try { return JSON.parse(localStorage.getItem('homio-saved-hoods') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('homio-saved-props', JSON.stringify(savedProperties));
  }, [savedProperties]);

  useEffect(() => {
    localStorage.setItem('homio-saved-hoods', JSON.stringify(savedNeighborhoods));
  }, [savedNeighborhoods]);

  const toggleProperty = (id) => {
    setSavedProperties(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };
  const toggleNeighborhood = (id) => {
    setSavedNeighborhoods(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <FavoritesContext.Provider value={{ savedProperties, savedNeighborhoods, toggleProperty, toggleNeighborhood }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
