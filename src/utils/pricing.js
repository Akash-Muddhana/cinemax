/**
 * Pricing calculation utilities for CINEMAX
 */

export const CONVENIENCE_FEE_PER_TICKET = 30; // ₹30 per ticket demo fee
export const TAX_RATE_ON_FEE = 0.18; // 18% GST on convenience fee

/**
 * Calculates pricing breakdown from an array of selected seats
 * @param {Array} selectedSeats - Array of seat objects { seatId, category, price }
 * @returns {Object} pricing details
 */
export function calculatePricing(selectedSeats = []) {
  const ticketCount = selectedSeats.length;
  
  const subtotal = selectedSeats.reduce((sum, seat) => {
    return sum + (Number(seat.price) || 0);
  }, 0);

  const convenienceFee = ticketCount > 0 ? ticketCount * CONVENIENCE_FEE_PER_TICKET : 0;
  const tax = Number((convenienceFee * TAX_RATE_ON_FEE).toFixed(2));
  const totalAmount = Number((subtotal + convenienceFee + tax).toFixed(2));

  // Category breakdown
  const categoryCounts = selectedSeats.reduce((acc, seat) => {
    const cat = seat.category || 'REGULAR';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return {
    ticketCount,
    subtotal,
    convenienceFee,
    tax,
    totalAmount,
    categoryCounts
  };
}

/**
 * Formats a number into Indian Rupee currency format (e.g. ₹770.80 or ₹1,250)
 */
export function formatINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(amount);
}
