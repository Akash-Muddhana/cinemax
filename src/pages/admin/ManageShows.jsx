import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Calendar, 
  Clock, 
  Film, 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Check, 
  DollarSign, 
  Armchair,
  X,
  Save
} from 'lucide-react';
import { selectAllShows, addShow, updateShow, deleteShow } from '../../features/shows/showSlice';
import { selectAllMovies } from '../../features/movies/movieSlice';
import { selectAllTheatres } from '../../features/theatres/theatreSlice';
import { selectAllBookings } from '../../features/bookings/bookingSlice';
import { checkShowTimeConflict } from '../../utils/validation';
import { getRelativeDateString } from '../../utils/storage';
import { formatINR } from '../../utils/pricing';

export default function ManageShows() {
  const dispatch = useDispatch();
  const shows = useSelector(selectAllShows);
  const movies = useSelector(selectAllMovies);
  const theatres = useSelector(selectAllTheatres);
  const bookings = useSelector(selectAllBookings);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);

  const todayStr = getRelativeDateString(0);

  const [formData, setFormData] = useState({
    movieId: movies[0]?.id || '',
    theatreId: theatres[0]?.id || '',
    showDate: todayStr,
    startTime: '14:30',
    endTime: '17:15',
    basePrice: 280,
    vipPrice: 420
  });

  const [conflictError, setConflictError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingShow(null);
    const defaultTheatre = theatres[0];
    const defaultPrice = defaultTheatre ? defaultTheatre.defaultPrice : 250;

    setFormData({
      movieId: movies[0]?.id || '',
      theatreId: theatres[0]?.id || '',
      showDate: todayStr,
      startTime: '14:30',
      endTime: '17:15',
      basePrice: defaultPrice,
      vipPrice: Math.round(defaultPrice * 1.5)
    });
    setConflictError(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (show) => {
    setEditingShow(show);
    setFormData({
      movieId: show.movieId,
      theatreId: show.theatreId,
      showDate: show.showDate,
      startTime: show.startTime,
      endTime: show.endTime,
      basePrice: show.basePrice,
      vipPrice: show.categoryPricing?.VIP || Math.round(show.basePrice * 1.5)
    });
    setConflictError(null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleDelete = (show) => {
    // Check if bookings exist for this show
    const relatedBookings = bookings.filter(b => b.showId === show.id && b.status === 'CONFIRMED');
    if (relatedBookings.length > 0) {
      if (!window.confirm(`Warning: This show has ${relatedBookings.length} confirmed demo bookings! Deleting it will cancel these showtimes. Proceed?`)) {
        return;
      }
    } else {
      if (!window.confirm('Delete this scheduled show?')) return;
    }
    dispatch(deleteShow(show.id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setConflictError(null);

    const errors = {};
    if (!formData.movieId) errors.movieId = 'Please select a movie';
    if (!formData.theatreId) errors.theatreId = 'Please select a theatre';
    if (!formData.showDate) errors.showDate = 'Show date is required';
    if (!formData.startTime) errors.startTime = 'Start time is required';
    if (!formData.endTime) errors.endTime = 'End time is required';

    const basePrice = Number(formData.basePrice);
    const vipPrice = Number(formData.vipPrice);
    if (!basePrice || basePrice < 50) errors.basePrice = 'Base price must be at least ₹50';
    if (!vipPrice || vipPrice < basePrice) errors.vipPrice = 'VIP price must be greater than or equal to base price';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Schedule conflict verification: Prevent overlapping shows in the same theatre
    const conflict = checkShowTimeConflict(
      shows,
      formData.theatreId,
      formData.showDate,
      formData.startTime,
      formData.endTime,
      editingShow ? editingShow.id : null,
      15 // 15-minute cleaning buffer
    );

    if (conflict) {
      setConflictError(conflict);
      return;
    }

    const selectedTheatre = theatres.find(t => t.id === formData.theatreId);

    if (editingShow) {
      dispatch(updateShow({
        id: editingShow.id,
        movieId: formData.movieId,
        theatreId: formData.theatreId,
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        basePrice,
        categoryPricing: {
          REGULAR: basePrice,
          VIP: vipPrice
        }
      }));
    } else {
      dispatch(addShow({
        movieId: formData.movieId,
        theatreId: formData.theatreId,
        theatreSeatLayout: selectedTheatre?.seatLayout || [],
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        basePrice,
        categoryPricing: {
          REGULAR: basePrice,
          VIP: vipPrice
        }
      }));
    }

    setIsModalOpen(false);
  };

  return (
    <div className="container page-wrapper">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="section-title">
            <Calendar size={26} color="var(--primary)" /> Showtime Scheduling
          </h1>
          <p className="section-subtitle">
            Schedule movie screenings across cinema auditoriums with conflict collision prevention and independent seat inventory
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus size={16} /> Schedule New Show
        </button>
      </div>

      {/* Shows Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Movie</th>
              <th>Theatre / Auditorium</th>
              <th>Date</th>
              <th>Showtime</th>
              <th>Base / VIP Price</th>
              <th>Seat Availability</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shows.map(show => {
              const movie = movies.find(m => m.id === show.movieId);
              const theatre = theatres.find(t => t.id === show.theatreId);
              
              const totalInventory = show.seatInventory?.length || 0;
              const bookedCount = show.seatInventory?.filter(s => s.status === 'BOOKED').length || 0;
              const availableCount = show.seatInventory?.filter(s => s.status === 'AVAILABLE').length || 0;

              return (
                <tr key={show.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={movie?.posterUrl} 
                        alt={movie?.title}
                        style={{ width: '36px', height: '52px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{movie?.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{movie?.language} • {movie?.duration}m</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>{theatre?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{theatre?.location}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Calendar size={13} color="var(--primary)" />
                      <span>{show.showDate}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#fff' }}>
                      <Clock size={13} />
                      <span>{show.startTime} - {show.endTime}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '600', color: '#fff' }}>
                      Reg: {formatINR(show.basePrice)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#10b981' }}>
                      VIP: {formatINR(show.categoryPricing?.VIP || Math.round(show.basePrice * 1.5))}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#34d399' }}>
                      {availableCount} Available
                    </div>
                    <div style={{ fontSize: '0.72rem', color: bookedCount > 0 ? '#ff6b6b' : 'var(--text-muted)' }}>
                      {bookedCount} Booked ({totalInventory} Total)
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-green">
                      {show.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenEdit(show)}
                        className="btn btn-secondary btn-sm"
                        title="Edit Showtime Details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(show)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#ef4444' }}
                        title="Delete Show"
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

      {/* SCHEDULE SHOW MODAL */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>
                {editingShow ? 'Edit Scheduled Show' : 'Schedule Movie Screening'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Overlap Error Banner */}
            {conflictError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-sm)', padding: '0.75rem', color: '#ff6b6b', fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} />
                <span>{conflictError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Select Movie *
                </label>
                <select
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                  style={{ width: '100%', borderColor: formErrors.movieId ? '#ef4444' : undefined }}
                >
                  <option value="">-- Choose a movie --</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.duration} mins - {m.language})
                    </option>
                  ))}
                </select>
                {formErrors.movieId && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.movieId}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Select Theatre / Auditorium *
                </label>
                <select
                  value={formData.theatreId}
                  onChange={(e) => {
                    const thId = e.target.value;
                    const th = theatres.find(t => t.id === thId);
                    const defPrice = th ? th.defaultPrice : 250;
                    setFormData({ 
                      ...formData, 
                      theatreId: thId,
                      basePrice: defPrice,
                      vipPrice: Math.round(defPrice * 1.5)
                    });
                  }}
                  style={{ width: '100%', borderColor: formErrors.theatreId ? '#ef4444' : undefined }}
                >
                  <option value="">-- Choose a theatre --</option>
                  {theatres.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} - {t.location} ({t.totalRows * t.totalCols} seats)
                    </option>
                  ))}
                </select>
                {formErrors.theatreId && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.theatreId}</span>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Screening Date *
                </label>
                <input
                  type="date"
                  value={formData.showDate}
                  onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                  style={{ width: '100%', borderColor: formErrors.showDate ? '#ef4444' : undefined }}
                />
                {formErrors.showDate && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.showDate}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Start Time (HH:mm) *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.startTime ? '#ef4444' : undefined }}
                  />
                  {formErrors.startTime && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.startTime}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    End Time (HH:mm) *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.endTime ? '#ef4444' : undefined }}
                  />
                  {formErrors.endTime && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.endTime}</span>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    Regular Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.basePrice ? '#ef4444' : undefined }}
                  />
                  {formErrors.basePrice && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.basePrice}</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                    VIP Seat Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="10"
                    value={formData.vipPrice}
                    onChange={(e) => setFormData({ ...formData, vipPrice: e.target.value })}
                    style={{ width: '100%', borderColor: formErrors.vipPrice ? '#ef4444' : undefined }}
                  />
                  {formErrors.vipPrice && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.vipPrice}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> {editingShow ? 'Update Showtime' : 'Schedule Screening & Create Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
