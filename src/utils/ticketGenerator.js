/**
 * Ticket generator and reference utilities for CINEMAX
 */

/**
 * Generates an 8-character unique alphanumeric booking reference
 * Format: CNX-XXXX-XXXX
 */
export function generateBookingReference() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude similar characters 0/O, 1/I
  const randomPart1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const randomPart2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `CNX-${randomPart1}-${randomPart2}`;
}

/**
 * Creates safe QR code content string encoding non-sensitive demo booking identifier
 * Does NOT contain passwords, user personal data, or payment info.
 */
export function generateDemoQRCodeData(bookingRef, showId, seats = []) {
  const seatList = seats.map(s => s.seatId).join(',');
  return `CINEMAX-TICKET:REF:${bookingRef}:SHOW:${showId}:SEATS:${seatList}`;
}
