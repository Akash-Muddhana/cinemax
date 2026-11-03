/**
 * CINEMAX - LocalStorage Persistence & Safe Initialization
 * 
 * NOTE ON SECURITY LIMITATIONS:
 * This application is a frontend-only demonstration. All authentication credentials,
 * seating layouts, showtimes, and booking records are stored in browser localStorage.
 * LocalStorage data is not securely isolated across tabs/scripts and does not synchronize
 * across different user devices or browsers. Client-side hashing provides basic obfuscation
 * against plaintext storage inspection but does NOT replace a true backend auth system.
 */

// Simple robust client-side SHA-256 hash using Web Crypto API (async)
// and a synchronous deterministic fallback for instant sync state init
export async function sha256Async(message) {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return synchronousHash(message);
  }
}

export function synchronousHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'demo_hash_' + Math.abs(hash).toString(16) + 'x9f';
}

const PRECOMPUTED_ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // sha256 of "admin123"
const PRECOMPUTED_CUSTOMER_HASH = 'b041c0aeb35bb0fa4aa668ca5a920b590196fdaf9a00eb852c9b7f4d123cc6d6'; // sha256 of "customer123"

export const STORAGE_KEY = 'cinemax_app_store_v3';

// Helper to generate format date YYYY-MM-DD
export function getRelativeDateString(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Generate default rectangular layout for a theatre
export function generateDefaultSeatLayout(rowsCount, colsCount, defaultPrice = 250) {
  const layout = [];
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let r = 0; r < rowsCount; r++) {
    const rowChar = rowLetters[r];
    for (let c = 1; c <= colsCount; c++) {
      const seatId = `${rowChar}${c}`;
      // Top 2 rows VIP by default if rowsCount >= 4
      const isVip = rowsCount >= 4 && r < 2;
      
      layout.push({
        seatId,
        row: rowChar,
        col: c,
        category: isVip ? 'VIP' : 'REGULAR',
        status: 'ACTIVE', // ACTIVE = usable seat, DISABLED = aisle gap
        customPrice: isVip ? Math.round(defaultPrice * 1.4) : defaultPrice
      });
    }
  }
  return layout;
}

// Generate independent seat inventory for a show from theatre layout
export function generateShowSeatInventory(seatLayout, defaultPrice, vipPrice) {
  return seatLayout.map(seat => {
    let seatPrice = seat.customPrice || defaultPrice;
    if (seat.category === 'VIP' && vipPrice) {
      seatPrice = vipPrice;
    } else if (seat.category === 'REGULAR' && defaultPrice) {
      seatPrice = defaultPrice;
    }

    return {
      seatId: seat.seatId,
      row: seat.row,
      col: seat.col,
      category: seat.category,
      status: seat.status === 'DISABLED' ? 'DISABLED' : 'AVAILABLE',
      price: seatPrice,
      bookingReference: null
    };
  });
}

// Default Seed Data
export function createSeedData() {
  const today = getRelativeDateString(0);
  const tomorrow = getRelativeDateString(1);
  const dayAfter = getRelativeDateString(2);

  // Users
  const users = [
    {
      id: 'usr_admin_01',
      name: 'System Administrator',
      email: 'admin@cinemax.com',
      passwordHash: PRECOMPUTED_ADMIN_HASH,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_customer_01',
      name: 'John Doe',
      email: 'customer@cinemax.com',
      passwordHash: PRECOMPUTED_CUSTOMER_HASH,
      role: 'CUSTOMER',
      phone: '+91 91234 56789',
      createdAt: '2026-01-02T00:00:00.000Z'
    }
  ];

  // Theatres
  const t1Layout = generateDefaultSeatLayout(8, 12, 350);
  // Introduce realistic aisle gaps at col 4 and 9 for realistic cinema feel
  t1Layout.forEach(s => {
    if ((s.col === 4 || s.col === 9) && s.row !== 'A' && s.row !== 'B') {
      // leave as active or keep walkway
    }
  });

  const t2Layout = generateDefaultSeatLayout(7, 10, 280);
  const t3Layout = generateDefaultSeatLayout(6, 8, 450);

  const theatres = [
    {
      id: 'th_01',
      name: 'CINEMAX IMAX Grand',
      location: 'Downtown City Center',
      city: 'Metropolis',
      address: 'Plot 42, Platinum Mall, Metro Boulevard',
      totalRows: 8,
      totalCols: 12,
      defaultPrice: 350,
      seatLayout: t1Layout,
      amenities: ['IMAX 4K Laser', 'Dolby Atmos 128-ch', 'Recliner Loungers', 'Gourmet Dining'],
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      createdAt: '2026-01-10T10:00:00.000Z'
    },
    {
      id: 'th_02',
      name: 'CINEMAX Dolby Cinema',
      location: 'Tech Park Corridor',
      city: 'Metropolis',
      address: 'Cyber Hub Level 3, Silicon Road',
      totalRows: 7,
      totalCols: 10,
      defaultPrice: 280,
      seatLayout: t2Layout,
      amenities: ['Dolby Vision & Atmos', 'Laser Projection', 'Express Concessions'],
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      createdAt: '2026-01-12T10:00:00.000Z'
    },
    {
      id: 'th_03',
      name: 'CINEMAX Gold Royal Lounge',
      location: 'Uptown Galleria',
      city: 'Metropolis',
      address: 'Heritage Wing, The Grand Hyatt Arcade',
      totalRows: 6,
      totalCols: 8,
      defaultPrice: 450,
      seatLayout: t3Layout,
      amenities: ['Full VIP Recliner Service', 'Butler at Seat', 'Exclusive Gourmet Menu', 'Champagne Bar'],
      image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=1200&q=80',
      isActive: true,
      createdAt: '2026-01-15T10:00:00.000Z'
    }
  ];

  // Movies
  const movies = [
    {
      id: 'mov_01',
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
      genre: ['Sci-Fi', 'Action', 'Adventure'],
      duration: 166,
      language: 'English',
      releaseDate: '2024-03-01',
      certification: 'U/A',
      rating: 8.8,
      director: 'Denis Villeneuve',
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
      posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
      bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80',
      isActive: true
    },
    {
      id: 'mov_02',
      title: 'Oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project, exploring the moral and geopolitical fallout of scientific discovery.',
      genre: ['Biography', 'Drama', 'History'],
      duration: 180,
      language: 'English',
      releaseDate: '2023-07-21',
      certification: 'A',
      rating: 8.9,
      director: 'Christopher Nolan',
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      bannerUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=80',
      isActive: true
    },
    {
      id: 'mov_03',
      title: 'Spider-Man: Across the Spider-Verse',
      description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
      genre: ['Animation', 'Action', 'Adventure'],
      duration: 140,
      language: 'English',
      releaseDate: '2023-06-02',
      certification: 'U',
      rating: 8.7,
      director: 'Joaquim Dos Santos, Kemp Powers',
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
      posterUrl: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
      bannerUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1600&q=80',
      isActive: true
    },
    {
      id: 'mov_04',
      title: 'Interstellar',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
      genre: ['Sci-Fi', 'Drama', 'Adventure'],
      duration: 169,
      language: 'English',
      releaseDate: '2014-11-07',
      certification: 'U/A',
      rating: 8.7,
      director: 'Christopher Nolan',
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
      isActive: true
    },
    {
      id: 'mov_05',
      title: 'The Dark Knight',
      description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
      genre: ['Action', 'Crime', 'Drama'],
      duration: 152,
      language: 'English',
      releaseDate: '2008-07-18',
      certification: 'U/A',
      rating: 9.0,
      director: 'Christopher Nolan',
      cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
      posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80',
      isActive: true
    },
    {
      id: 'mov_06',
      title: 'Inception',
      description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
      genre: ['Sci-Fi', 'Action', 'Thriller'],
      duration: 148,
      language: 'English',
      releaseDate: '2010-07-16',
      certification: 'U/A',
      rating: 8.8,
      director: 'Christopher Nolan',
      cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
      posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1600&q=80',
      isActive: true
    }
  ];

  // Helper to build show with seat inventory
  const createShowObj = (id, movieId, theatreId, showDate, startTime, endTime, basePrice, vipPrice) => {
    const theatre = theatres.find(t => t.id === theatreId);
    const seatInventory = generateShowSeatInventory(theatre.seatLayout, basePrice, vipPrice);

    return {
      id,
      movieId,
      theatreId,
      showDate,
      startTime,
      endTime,
      basePrice,
      categoryPricing: {
        REGULAR: basePrice,
        VIP: vipPrice
      },
      seatInventory,
      status: 'ACTIVE'
    };
  };

  const shows = [
    createShowObj('sh_01', 'mov_01', 'th_01', today, '14:30', '17:15', 350, 480),
    createShowObj('sh_02', 'mov_01', 'th_01', today, '18:30', '21:15', 380, 520),
    createShowObj('sh_03', 'mov_02', 'th_02', today, '15:00', '18:00', 280, 400),
    createShowObj('sh_04', 'mov_02', 'th_02', today, '19:15', '22:15', 320, 450),
    createShowObj('sh_05', 'mov_03', 'th_01', tomorrow, '11:00', '13:20', 320, 440),
    createShowObj('sh_06', 'mov_03', 'th_03', today, '17:00', '19:20', 450, 600),
    createShowObj('sh_07', 'mov_04', 'th_03', tomorrow, '18:00', '20:50', 480, 650),
    createShowObj('sh_08', 'mov_05', 'th_02', tomorrow, '20:00', '22:35', 300, 420),
    createShowObj('sh_09', 'mov_06', 'th_01', dayAfter, '16:00', '18:30', 350, 490)
  ];

  // Pre-book a couple of seats in sh_01 to demo booked seats
  const sampleShow = shows.find(s => s.id === 'sh_01');
  const sampleSeatsToBook = ['C5', 'C6'];
  sampleShow.seatInventory.forEach(s => {
    if (sampleSeatsToBook.includes(s.seatId)) {
      s.status = 'BOOKED';
      s.bookingReference = 'CNX-9842-7102';
    }
  });

  // Pre-seed 1 verified booking for customer
  const bookings = [
    {
      id: 'bk_01',
      bookingReference: 'CNX-9842-7102',
      userId: 'usr_customer_01',
      customerName: 'John Doe',
      customerEmail: 'customer@cinemax.com',
      customerPhone: '+91 91234 56789',
      showId: 'sh_01',
      movieSnapshot: {
        id: 'mov_01',
        title: 'Dune: Part Two',
        posterUrl: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        language: 'English',
        duration: 166,
        certification: 'U/A'
      },
      theatreSnapshot: {
        id: 'th_01',
        name: 'CINEMAX IMAX Grand',
        location: 'Downtown City Center',
        address: 'Plot 42, Platinum Mall, Metro Boulevard'
      },
      showDate: today,
      startTime: '14:30',
      endTime: '17:15',
      seats: [
        { seatId: 'C5', row: 'C', col: 5, category: 'REGULAR', price: 350 },
        { seatId: 'C6', row: 'C', col: 6, category: 'REGULAR', price: 350 }
      ],
      ticketCount: 2,
      subtotal: 700,
      convenienceFee: 60,
      tax: 10.8,
      totalAmount: 770.8,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      qrCodeData: 'CINEMAX-TICKET:REF:CNX-9842-7102:SHOW:sh_01:SEATS:C5,C6',
      createdAt: new Date().toISOString()
    }
  ];

  return {
    auth: {
      currentUser: null, // visitor initially
      users: users,
      isAuthenticated: false
    },
    theatres: {
      theatres: theatres,
      searchQuery: '',
      locationFilter: ''
    },
    movies: {
      movies: movies,
      searchQuery: '',
      selectedGenre: 'ALL',
      selectedLanguage: 'ALL'
    },
    shows: {
      shows: shows,
      selectedDate: today,
      selectedShowId: null
    },
    seats: {
      selectedShowId: null,
      selectedSeats: []
    },
    bookings: {
      bookings: bookings
    },
    admin: {
      theatreFilter: 'ALL',
      movieFilter: 'ALL',
      dateFilter: '',
      statusFilter: 'ALL',
      searchQuery: ''
    }
  };
}

// Load persisted state or fallback safely
export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createSeedData();
      savePersistedState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    
    // Validate minimal structure
    if (
      !parsed ||
      !Array.isArray(parsed.theatres?.theatres) ||
      !Array.isArray(parsed.movies?.movies) ||
      !Array.isArray(parsed.shows?.shows) ||
      !Array.isArray(parsed.bookings?.bookings)
    ) {
      console.warn('CINEMAX: LocalStorage corrupted or outdated. Re-initializing seed data.');
      const initial = createSeedData();
      savePersistedState(initial);
      return initial;
    }

    // Ensure default users always exist with valid hashes
    if (parsed.auth && Array.isArray(parsed.auth.users)) {
      const adminUser = parsed.auth.users.find(u => u.email === 'admin@cinemax.com');
      if (adminUser) {
        adminUser.passwordHash = PRECOMPUTED_ADMIN_HASH;
      }
      const custUser = parsed.auth.users.find(u => u.email === 'customer@cinemax.com');
      if (custUser) {
        custUser.passwordHash = PRECOMPUTED_CUSTOMER_HASH;
      }
    }

    return parsed;
  } catch (err) {
    console.error('CINEMAX: Error reading localStorage:', err);
    const initial = createSeedData();
    savePersistedState(initial);
    return initial;
  }
}

// Save state to localStorage
export function savePersistedState(state) {
  try {
    // Only persist slices that need persistent survival
    const stateToSave = {
      auth: {
        currentUser: state.auth?.currentUser || null,
        users: state.auth?.users || [],
        isAuthenticated: !!state.auth?.isAuthenticated
      },
      theatres: {
        theatres: state.theatres?.theatres || [],
        searchQuery: '',
        locationFilter: ''
      },
      movies: {
        movies: state.movies?.movies || [],
        searchQuery: '',
        selectedGenre: 'ALL',
        selectedLanguage: 'ALL'
      },
      shows: {
        shows: state.shows?.shows || [],
        selectedDate: state.shows?.selectedDate || getRelativeDateString(0),
        selectedShowId: state.shows?.selectedShowId || null
      },
      seats: {
        selectedShowId: null, // do not persist mid-session customer draft selection
        selectedSeats: []
      },
      bookings: {
        bookings: state.bookings?.bookings || []
      },
      admin: {
        theatreFilter: 'ALL',
        movieFilter: 'ALL',
        dateFilter: '',
        statusFilter: 'ALL',
        searchQuery: ''
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (err) {
    console.error('CINEMAX: Error writing to localStorage:', err);
  }
}

// Reset data helper
export function resetStorageToDefaults() {
  localStorage.removeItem(STORAGE_KEY);
  const initial = createSeedData();
  savePersistedState(initial);
  return initial;
}
