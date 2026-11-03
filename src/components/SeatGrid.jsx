import React from 'react';
import { Sparkles, Check, Ban } from 'lucide-react';
import { formatINR } from '../utils/pricing';

export default function SeatGrid({
  seatInventory = [],
  selectedSeatIds = [],
  onSeatClick,
  mode = 'customer', // 'customer' or 'admin-editor'
  onAdminToggleCategory,
  onAdminToggleDisabled
}) {
  // Group seats by row character
  const rowsMap = {};
  seatInventory.forEach(seat => {
    if (!rowsMap[seat.row]) {
      rowsMap[seat.row] = [];
    }
    rowsMap[seat.row].push(seat);
  });

  // Sort rows alphabetically A-Z
  const sortedRowKeys = Object.keys(rowsMap).sort();

  // Sort each row's seats by column number
  sortedRowKeys.forEach(rowKey => {
    rowsMap[rowKey].sort((a, b) => a.col - b.col);
  });

  const getSeatClass = (seat) => {
    const isSelected = selectedSeatIds.includes(seat.seatId);
    if (isSelected) return 'seat-selected';
    if (seat.status === 'DISABLED') return 'seat-disabled';
    if (seat.status === 'BOOKED') return 'seat-booked';
    if (seat.category === 'VIP') return 'seat-vip';
    return 'seat-available'; // Regular available (Red)
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Screen Indicator */}
      <div className="screen-container">
        <div className="cinema-screen"></div>
        <div className="screen-text">All Eyes This Way • Cinema Screen</div>
      </div>

      {/* Seating Grid */}
      <div className="seating-area">
        {sortedRowKeys.map(rowKey => (
          <div key={rowKey} className="seat-row">
            {/* Left Row Label */}
            <span className="seat-row-label">{rowKey}</span>

            {/* Seats in this row */}
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              {rowsMap[rowKey].map(seat => {
                const isSelected = selectedSeatIds.includes(seat.seatId);
                const isBooked = seat.status === 'BOOKED';
                const isDisabled = seat.status === 'DISABLED';
                const seatClass = getSeatClass(seat);

                if (mode === 'admin-editor') {
                  return (
                    <button
                      key={seat.seatId}
                      type="button"
                      className={`seat-item ${seatClass}`}
                      onClick={() => onSeatClick && onSeatClick(seat)}
                      title={`Seat ${seat.seatId} | ${seat.category} | ${seat.status} | Price: ₹${seat.customPrice || seat.price || 0} (Click to toggle)`}
                      style={{
                        position: 'relative',
                        border: isSelected ? '2px solid #ffffff' : undefined
                      }}
                    >
                      {isDisabled ? '•' : seat.col}
                    </button>
                  );
                }

                // Customer Mode
                return (
                  <button
                    key={seat.seatId}
                    type="button"
                    className={`seat-item ${seatClass}`}
                    disabled={isBooked || isDisabled}
                    onClick={() => onSeatClick && onSeatClick(seat)}
                    title={
                      isDisabled 
                        ? 'Aisle Gap' 
                        : isBooked 
                        ? `Seat ${seat.seatId} (Booked)` 
                        : `Seat ${seat.seatId} (${seat.category}) - ${formatINR(seat.price)}`
                    }
                  >
                    {isDisabled ? '' : seat.col}
                  </button>
                );
              })}
            </div>

            {/* Right Row Label */}
            <span className="seat-row-label">{rowKey}</span>
          </div>
        ))}
      </div>

      {/* Required Visible Legend */}
      <div className="seat-legend">
        <div className="legend-item">
          <div className="legend-swatch" style={{ backgroundColor: 'var(--primary)', border: '1px solid var(--primary-dark)' }}></div>
          <span>Available (Red)</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch" style={{ backgroundColor: 'var(--accent-vip)', border: '1px solid #059669' }}></div>
          <span>VIP Recliner (Green)</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch" style={{ backgroundColor: 'var(--accent-selected)', border: '1px solid #1d4ed8' }}></div>
          <span>Selected by You (Blue)</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch" style={{ backgroundColor: 'var(--accent-booked)', border: '1px solid #334155' }}></div>
          <span>Booked / Reserved (Grey)</span>
        </div>
        <div className="legend-item">
          <div className="legend-swatch" style={{ backgroundColor: 'var(--accent-disabled)', border: '1px dashed rgba(255,255,255,0.2)' }}></div>
          <span>Aisle Gap / Empty</span>
        </div>
      </div>
    </div>
  );
}
