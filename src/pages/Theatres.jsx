import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { MapPin, Search, Sparkles, RotateCcw } from 'lucide-react';
import { selectAllTheatres, selectUniqueLocations } from '../features/theatres/theatreSlice';
import TheatreCard from '../components/TheatreCard';

export default function Theatres() {
  const theatres = useSelector(selectAllTheatres);
  const locations = ['ALL', ...useSelector(selectUniqueLocations)];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL');

  const filteredTheatres = theatres.filter(theatre => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      theatre.name.toLowerCase().includes(q) ||
      theatre.location.toLowerCase().includes(q) ||
      theatre.address.toLowerCase().includes(q);

    const matchesLocation = selectedLocation === 'ALL' ||
      theatre.location.toLowerCase() === selectedLocation.toLowerCase();

    return matchesSearch && matchesLocation && theatre.isActive;
  });

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedLocation('ALL');
  };

  return (
    <div className="container page-wrapper">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="section-title">
          <MapPin size={26} color="var(--primary)" /> Cinema Locations
        </h1>
        <p className="section-subtitle">
          Find luxury CINEMAX auditoriums, screen formats, and available movie shows near you
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              color="var(--text-muted)" 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search by theatre name, mall, or street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Location Dropdown */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{ width: '100%' }}
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>
                  Location: {loc === 'ALL' ? 'All Areas' : loc}
                </option>
              ))}
            </select>
          </div>

          {/* Reset */}
          <div>
            <button 
              type="button" 
              onClick={handleResetFilters}
              className="btn btn-secondary btn-block"
              style={{ height: '42px' }}
            >
              <RotateCcw size={15} /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
        Showing <strong>{filteredTheatres.length}</strong> cinema theatres
      </div>

      {/* Grid */}
      <div className="theatre-grid">
        {filteredTheatres.map(theatre => (
          <TheatreCard key={theatre.id} theatre={theatre} />
        ))}
      </div>

      {filteredTheatres.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <MapPin size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No Theatres Found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            We could not find any cinema locations matching your query.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
            View All Locations
          </button>
        </div>
      )}
    </div>
  );
}
