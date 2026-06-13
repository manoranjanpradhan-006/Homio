import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Navbar from './components/Navbar/Navbar';
import Landing from './pages/Landing/Landing';
import SearchResults from './pages/SearchResults/SearchResults';
import PropertyDetails from './pages/PropertyDetails/PropertyDetails';
import MapPage from './pages/MapPage/MapPage';
import NeighborhoodDetails from './pages/NeighborhoodDetails/NeighborhoodDetails';
import Compare from './pages/Compare/Compare';
import Reviews from './pages/Reviews/Reviews';
import AddProperty from './pages/AddProperty/AddProperty';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/property/:id" element={<PropertyDetails />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/neighborhoods/:id" element={<NeighborhoodDetails />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/reviews/:id" element={<Reviews />} />
            <Route path="/add-property" element={<AddProperty />} />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </ThemeProvider>
  );
}

export default App;
