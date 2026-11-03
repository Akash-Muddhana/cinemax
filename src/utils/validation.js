/**
 * Validation utilities for CINEMAX forms and scheduling
 */

export function validateEmail(email) {
  if (!email) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email.trim())) return 'Please enter a valid email address';
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

export function validatePhone(phone) {
  if (!phone) return null; // optional
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  if (cleaned.length < 10) return 'Please enter a valid 10-digit phone number';
  return null;
}

/**
 * Converts 'HH:mm' string to minutes from midnight
 */
export function timeStringToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Checks if a proposed showtime overlaps with any existing show in the same theatre on the same date
 * Optional buffer in minutes (e.g. 15 mins for cleaning between shows)
 */
export function checkShowTimeConflict(existingShows, theatreId, showDate, startTime, endTime, excludeShowId = null, bufferMinutes = 15) {
  const newStart = timeStringToMinutes(startTime);
  const newEnd = timeStringToMinutes(endTime);

  if (newEnd <= newStart) {
    return 'End time must be after start time';
  }

  const matchingShows = existingShows.filter(show => 
    show.theatreId === theatreId &&
    show.showDate === showDate &&
    show.id !== excludeShowId &&
    show.status !== 'CANCELLED'
  );

  for (const show of matchingShows) {
    const existingStart = timeStringToMinutes(show.startTime);
    const existingEnd = timeStringToMinutes(show.endTime) + bufferMinutes; // buffer interval

    // Overlap condition: startA < endB && startB < endA
    if (newStart < existingEnd && existingStart < newEnd + bufferMinutes) {
      return `Schedule conflict! Theatre already has a show from ${show.startTime} to ${show.endTime} (+${bufferMinutes} min cleaning buffer).`;
    }
  }

  return null;
}

/**
 * Checks if modifying a theatre's layout affects existing bookings
 * Warns the admin before destructive changes
 */
export function checkLayoutConflictWithBookings(theatreId, newLayout, allShows, allBookings) {
  const affectedSeats = [];
  
  // Find all upcoming shows for this theatre
  const theatreShows = allShows.filter(s => s.theatreId === theatreId);
  const showIds = new Set(theatreShows.map(s => s.id));

  // Find bookings for these shows
  const activeBookings = allBookings.filter(b => showIds.has(b.showId) && b.status === 'CONFIRMED');

  const newActiveSeatIds = new Set(
    newLayout.filter(s => s.status === 'ACTIVE').map(s => s.seatId)
  );

  for (const booking of activeBookings) {
    for (const seat of booking.seats) {
      if (!newActiveSeatIds.has(seat.seatId)) {
        affectedSeats.push({
          bookingRef: booking.bookingReference,
          seatId: seat.seatId,
          showDate: booking.showDate,
          showTime: booking.startTime
        });
      }
    }
  }

  return affectedSeats;
}
