import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Armchair, 
  Save, 
  X, 
  AlertTriangle, 
  Check, 
  Sparkles,
  Eye,
  Sliders
} from 'lucide-react';
import { 
  selectAllTheatres, 
  addTheatre, 
  updateTheatre, 
  updateTheatreLayout, 
  deleteTheatre 
} from '../../features/theatres/theatreSlice';
import { selectAllShows } from '../../features/shows/showSlice';
import { selectAllBookings } from '../../features/bookings/bookingSlice';
import { generateDefaultSeatLayout } from '../../utils/storage';
import { checkLayoutConflictWithBookings } from '../../utils/validation';
import { formatINR } from '../../utils/pricing';
import SeatGrid from '../../components/SeatGrid';

export default function ManageTheatres() {
  const dispatch = useDispatch();
  const theatres = useSelector(selectAllTheatres);
  const allShows = useSelector(selectAllShows);
  const allBookings = useSelector(selectAllBookings);

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);

  // Theatre Details Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    city: 'Metropolis',
    address: '',
    totalRows: 8,
    totalCols: 10,
    defaultPrice: 250,
    amenities: 'IMAX Laser, Dolby Atmos, Luxury Recliners'
  });
  const [formErrors, setFormErrors] = useState({});

  // Layout Designer State
  const [activeLayoutTheatre, setActiveLayoutTheatre] = useState(null);
  const [designerLayout, setDesignerLayout] = useState([]);
  const [designerRows, setDesignerRows] = useState(8);
  const [designerCols, setDesignerCols] = useState(10);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [layoutWarning, setLayoutWarning] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // Open Add Theatre Modal
  const handleOpenAdd = () => {
    setEditingTheatre(null);
    setFormData({
      name: '',
      location: '',
      city: 'Metropolis',
      address: '',
      totalRows: 8,
      totalCols: 10,
      defaultPrice: 250,
      amenities: 'IMAX Laser, Dolby Atmos, Luxury Recliners'
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Edit Theatre Details
  const handleOpenEdit = (theatre) => {
    setEditingTheatre(theatre);
    setFormData({
      name: theatre.name,
      location: theatre.location,
      city: theatre.city || 'Metropolis',
      address: theatre.address,
      totalRows: theatre.totalRows,
      totalCols: theatre.totalCols,
      defaultPrice: theatre.defaultPrice,
      amenities: Array.isArray(theatre.amenities) ? theatre.amenities.join(', ') : theatre.amenities
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  // Open Layout Designer Modal
  const handleOpenDesigner = (theatre) => {
    setActiveLayoutTheatre(theatre);
    setDesignerRows(theatre.totalRows);
    setDesignerCols(theatre.totalCols);
    // Deep clone layout
    setDesignerLayout(JSON.parse(JSON.stringify(theatre.seatLayout || [])));
    setSelectedSeatIds([]);
    setLayoutWarning(null);
    setSaveSuccessMsg(null);
    setIsEditorOpen(true);
  };

  // Submit Theatre Details Form
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Theatre name is required';
    if (!formData.location.trim()) errors.location = 'Location area is required';
    if (!formData.address.trim()) errors.address = 'Street address is required';
    const rows = Number(formData.totalRows);
    const cols = Number(formData.totalCols);
    const price = Number(formData.defaultPrice);

    if (!rows || rows < 1 || rows > 26) errors.totalRows = 'Rows must be between 1 and 26 (A-Z)';
    if (!cols || cols < 1 || cols > 30) errors.totalCols = 'Columns must be between 1 and 30';
    if (!price || price < 50) errors.defaultPrice = 'Default price must be at least ₹50';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const amenitiesList = formData.amenities.split(',').map(a => a.trim()).filter(Boolean);

    if (editingTheatre) {
      // If rows or cols changed, re-sync layout dimensions
      let newLayout = editingTheatre.seatLayout;
      if (rows !== editingTheatre.totalRows || cols !== editingTheatre.totalCols) {
        newLayout = generateDefaultSeatLayout(rows, cols, price);
      }

      dispatch(updateTheatre({
        id: editingTheatre.id,
        name: formData.name.trim(),
        location: formData.location.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        totalRows: rows,
        totalCols: cols,
        defaultPrice: price,
        seatLayout: newLayout,
        amenities: amenitiesList
      }));
    } else {
      dispatch(addTheatre({
        name: formData.name.trim(),
        location: formData.location.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        totalRows: rows,
        totalCols: cols,
        defaultPrice: price,
        amenities: amenitiesList
      }));
    }

    setIsFormOpen(false);
  };

  // Delete Theatre
  const handleDeleteTheatre = (theatre) => {
    if (window.confirm(`Are you sure you want to delete "${theatre.name}"? This will also affect scheduled shows.`)) {
      dispatch(deleteTheatre(theatre.id));
    }
  };

  // Layout Designer: Toggle seat selection
  const handleSeatClickInEditor = (seat) => {
    setSelectedSeatIds(prev => {
      if (prev.includes(seat.seatId)) {
        return prev.filter(id => id !== seat.seatId);
      } else {
        return [...prev, seat.seatId];
      }
    });
  };

  // Layout Designer: Batch set selected seats category
  const handleSetCategoryForSelected = (category) => {
    if (selectedSeatIds.length === 0) return;
    setDesignerLayout(prev => prev.map(seat => {
      if (selectedSeatIds.includes(seat.seatId)) {
        const isVip = category === 'VIP';
        const customPrice = isVip 
          ? Math.round((activeLayoutTheatre.defaultPrice || 250) * 1.5)
          : (activeLayoutTheatre.defaultPrice || 250);
        return {
          ...seat,
          category,
          status: 'ACTIVE',
          customPrice
        };
      }
      return seat;
    }));
    setSelectedSeatIds([]);
  };

  // Layout Designer: Batch toggle active / disabled (aisle gap)
  const handleToggleDisabledForSelected = () => {
    if (selectedSeatIds.length === 0) return;
    setDesignerLayout(prev => prev.map(seat => {
      if (selectedSeatIds.includes(seat.seatId)) {
        return {
          ...seat,
          status: seat.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED'
        };
      }
      return seat;
    }));
    setSelectedSeatIds([]);
  };

  // Layout Designer: Regenerate whole grid
  const handleRegenerateGrid = () => {
    if (window.confirm('Reset current layout to default rectangular configuration? Custom edits will be overwritten.')) {
      setDesignerLayout(generateDefaultSeatLayout(designerRows, designerCols, activeLayoutTheatre.defaultPrice));
      setSelectedSeatIds([]);
    }
  };

  // Save Layout with Destructive Booking Conflict Check
  const handleSaveLayout = () => {
    // Check conflicts
    const conflicts = checkLayoutConflictWithBookings(
      activeLayoutTheatre.id,
      designerLayout,
      allShows,
      allBookings
    );

    if (conflicts.length > 0) {
      setLayoutWarning(
        `Warning: Saving this layout will remove or disable seats (${conflicts.map(c => c.seatId).join(', ')}) that are currently referenced by active bookings! Please review before confirming.`
      );
      if (!window.confirm(`DESTRUCTIVE CHANGE WARNING: This layout change modifies seats already booked (${conflicts.length} affected tickets). Do you want to proceed anyway?`)) {
        return;
      }
    }

    dispatch(updateTheatreLayout({
      theatreId: activeLayoutTheatre.id,
      seatLayout: designerLayout,
      totalRows: designerRows,
      totalCols: designerCols
    }));

    setSaveSuccessMsg('Seating layout saved and synchronized with local storage!');
    setTimeout(() => {
      setIsEditorOpen(false);
      setSaveSuccessMsg(null);
      setLayoutWarning(null);
    }, 1200);
  };

  return (
    <div className="container page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">
            <Building2 size={26} color="var(--primary)" /> Theatre & Seating Management
          </h1>
          <p className="section-subtitle">
            Configure cinema auditoriums, screen dimensions, ticket tiers, and interactive seating layout matrices
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Add New Theatre
        </button>
      </div>

      {/* Theatres List Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Theatre Name</th>
              <th>Location</th>
              <th>Dimensions</th>
              <th>Total Capacity</th>
              <th>Base Price</th>
              <th>Amenities</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {theatres.map(theatre => {
              const activeSeats = (theatre.seatLayout || []).filter(s => s.status === 'ACTIVE').length;
              const vipSeats = (theatre.seatLayout || []).filter(s => s.category === 'VIP' && s.status === 'ACTIVE').length;

              return (
                <tr key={theatre.id}>
                  <td>
                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '1rem' }}>{theatre.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{theatre.address}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>{theatre.location}, {theatre.city}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">
                      {theatre.totalRows} Rows × {theatre.totalCols} Cols
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{activeSeats} Active Seats</div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>{vipSeats} VIP Seats</div>
                  </td>
                  <td style={{ fontWeight: '700', color: '#ff4d58' }}>
                    {formatINR(theatre.defaultPrice)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {(theatre.amenities || []).slice(0, 2).map((a, i) => (
                        <span key={i} className="amenity-chip" style={{ fontSize: '0.68rem' }}>{a}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenDesigner(theatre)}
                        className="btn btn-primary btn-sm"
                        title="Design Seating Layout Grid"
                      >
                        <Armchair size={14} /> Design Seats
                      </button>
                      <button
                        onClick={() => handleOpenEdit(theatre)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Theatre Info"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTheatre(theatre)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Delete Theatre"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: ADD / EDIT THEATRE DETAILS */}
      {isFormOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>
                {editingTheatre ? 'Edit Theatre Details' : 'Add New Cinema Theatre'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Theatre Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CINEMAX Laser Luxe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', borderColor: formErrors.name ? '#ef4444' : undefined }}
                />
                {formErrors.name && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.name}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Location / Mall *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Downtown Plaza"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.location ? '#ef4444' : undefined }}
                  />
                  {formErrors.location && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.location}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Metropolis"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Full Street Address *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Level 4, Orion Mall, Metro Road"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', borderColor: formErrors.address ? '#ef4444' : undefined }}
                />
                {formErrors.address && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.address}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Rows (1-26) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="26"
                    value={formData.totalRows}
                    onChange={(e) => setFormData({ ...formData, totalRows: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.totalRows ? '#ef4444' : undefined }}
                  />
                  {formErrors.totalRows && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{formErrors.totalRows}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Columns (1-30) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formData.totalCols}
                    onChange={(e) => setFormData({ ...formData, totalCols: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.totalCols ? '#ef4444' : undefined }}
                  />
                  {formErrors.totalCols && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{formErrors.totalCols}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={formData.defaultPrice}
                    onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.defaultPrice ? '#ef4444' : undefined }}
                  />
                  {formErrors.defaultPrice && <span style={{ color: '#ef4444', fontSize: '0.72rem' }}>{formErrors.defaultPrice}</span>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="IMAX 4K Laser, Dolby Atmos 128-ch, VIP Recliner"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> {editingTheatre ? 'Save Changes' : 'Create Theatre & Generate Grid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE SEATING LAYOUT DESIGNER */}
      {isEditorOpen && activeLayoutTheatre && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '960px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Armchair size={20} color="var(--primary)" /> Seating Layout Designer: {activeLayoutTheatre.name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  Click individual seats to select, then apply categories (Regular vs VIP) or create aisle walkways.
                </p>
              </div>

              <button onClick={() => setIsEditorOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={22} />
              </button>
            </div>

            {/* Warning / Success Messages */}
            {layoutWarning && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#ff6b6b', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                <span>{layoutWarning}</span>
              </div>
            )}

            {saveSuccessMsg && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#34d399', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Designer Toolbar */}
            <div style={{
              background: 'var(--bg-elevated)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.8rem',
              marginBottom: '1.2rem'
            }}>
              {/* Selected Count & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '600' }}>
                  {selectedSeatIds.length} Seats Selected:
                </span>

                <button
                  type="button"
                  disabled={selectedSeatIds.length === 0}
                  onClick={() => handleSetCategoryForSelected('VIP')}
                  className="btn btn-sm"
                  style={{ background: '#10b981', color: '#fff', opacity: selectedSeatIds.length === 0 ? 0.4 : 1 }}
                >
                  Set as VIP (Green)
                </button>

                <button
                  type="button"
                  disabled={selectedSeatIds.length === 0}
                  onClick={() => handleSetCategoryForSelected('REGULAR')}
                  className="btn btn-sm btn-primary"
                  style={{ opacity: selectedSeatIds.length === 0 ? 0.4 : 1 }}
                >
                  Set as Regular (Red)
                </button>

                <button
                  type="button"
                  disabled={selectedSeatIds.length === 0}
                  onClick={handleToggleDisabledForSelected}
                  className="btn btn-sm btn-secondary"
                  style={{ opacity: selectedSeatIds.length === 0 ? 0.4 : 1 }}
                >
                  Toggle Aisle Gap / Disabled (Grey)
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleRegenerateGrid}
                  className="btn btn-secondary btn-sm"
                  title="Reset to default grid"
                >
                  Reset Grid
                </button>
              </div>
            </div>

            {/* Interactive Grid Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center' }}>
              <SeatGrid
                seatInventory={designerLayout}
                selectedSeatIds={selectedSeatIds}
                onSeatClick={handleSeatClickInEditor}
                mode="admin-editor"
              />
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Colors: <strong>Red</strong> (Regular Active) • <strong>Green</strong> (VIP Recliner) • <strong>Blue</strong> (Selected in Editor) • <strong>Grey</strong> (Aisle Gap)
              </div>

              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button type="button" onClick={() => setIsEditorOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="button" onClick={handleSaveLayout} className="btn btn-primary">
                  <Save size={16} /> Save Layout & Persist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
