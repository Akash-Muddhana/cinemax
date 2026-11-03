# CINEMAX — Movie Theatre Ticket Booking System

A movie theatre ticket booking web application built with **React**, **Redux Toolkit**, and **Browser LocalStorage**.

> **IMPORTANT ARCHITECTURAL & SECURITY NOTICE (PORTFOLIO DEMONSTRATION):**
> This application is built **strictly using a 100% frontend architecture**. There is **NO backend server (Node.js/Express)** and **NO external database (MongoDB, PostgreSQL, Firebase, Supabase)** connected.
> 
> All session authentication, theatre seating grids, movies, showtimes, and booking records are stored in browser **`localStorage`**.
> - **Security Limitations**: `localStorage` is accessible to JavaScript running within the browser origin and is not a secure authentication mechanism for production banking or ticketing. Client-side SHA-256 hashing is implemented solely for demonstration purposes to avoid plaintext storage inspection.
> - **Isolation & Exclusivity**: Seating reservations, double-booking prevention, and demo tickets are enforced within the local browser state. They **do not synchronize** across different physical devices or separate web browsers.
> - **Demo QR Codes**: The generated QR codes encode a non-sensitive demo string (`CINEMAX-DEMO:REF...`) and do not constitute real admission credentials.

---

## Allowed Technologies Used

- **React 18** (Functional components, hooks)
- **Redux Toolkit & React Redux** (`configureStore`, `createSlice`, `useSelector`, `useDispatch`)
- **React Router 6** (Single Page App routing, protected customer & admin routes)
- **Plain CSS** (Reusable CSS variables, custom dark cinematic theme, responsive layout, `@media print`)
- **qrcode.react** (Scalable SVG digital QR code generation)
- **lucide-react** (Professional cinematic iconography)
- **Vite 5** (High-performance build tooling)

---

## Demo Accounts & Quick Credentials

The application initializes with demo accounts and rich starter data (theatres, movies, showtimes, bookings).

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@cinemax.com` | `admin123` | Dashboard metrics, theatre & seat editor, movies, shows, all bookings |
| **Customer** | `customer@cinemax.com` | `customer123` | Movie browsing, interactive seat booking, My Bookings, digital tickets |

*A 1-click **Quick Switch** pill is integrated into the header navigation bar to allow switching between Admin, Customer, and Guest modes without manual typing.*

---

## Core Feature Overview

### 1. Customer Experience
- **Cinematic Landing Page**: Hero banner with live search, Now Showing carousel, genre filters, and featured locations.
- **Movie Catalog (`/movies`)**: Instant search by title, cast, or director; filter by genre and audio language.
- **Movie Details (`/movies/:movieId`)**: High-res backdrop, synopsis, runtime, certification (`U/A`, `A`, `U`), cast chips, and screening showtimes grouped by theatre.
- **Theatre Explorer (`/theatres`, `/theatres/:theatreId`)**: View auditorium specifications, sound systems (Dolby Atmos, IMAX 4K Laser), and active screenings.
- **Interactive Seat Selection (`/seat-selection/:showId`)**:
  - Curved glowing screen indicator.
  - Interactive seating matrix with row letters (A–Z) and column numbers.
  - Real-time seat selection with immediate price derivation.
  - **Color Legend**:
    - **Red**: Available standard seat.
    - **Green**: VIP Recliner category.
    - **Blue**: Selected by the current customer.
    - **Grey**: Reserved/booked or aisle gap.
  - Built-in limit of 8 seats per booking.
  - Independent inventory: booking seats in Show A never impacts Show B.
- **Checkout & Price Breakdown (`/checkout/:showId`)**:
  - Breakdown: Subtotal + ₹30/ticket Convenience Fee + 18% GST = Final Total (₹ INR).
  - Pre-booking verification against inventory conflicts.
  - Generates unique reference: `CNX-XXXX-XXXX`.
- **Digital E-Ticket with QR Code (`/ticket/:bookingRef`)**:
  - Cinema ticket layout with tear-stub perforation styling.
  - Encrypted SVG QR code generated dynamically.
  - Browser-native **Print Ticket** stylesheet (`@media print`) and save/view capabilities.
- **My Bookings (`/my-bookings`)**: Customer-specific booking history filtered by user ID; persists across reloads.

### 2. Administrator Portal
- **Operations Dashboard (`/admin`)**:
  - KPI cards: Total Theatres, Movies, Scheduled Shows, Bookings, Tickets Sold, and Gross Simulated Revenue.
  - Recent booking transaction stream.
- **Theatre & Interactive Seat Layout Designer (`/admin/theatres`)**:
  - Create and edit theatres with custom row/column dimensions (up to 26 rows × 30 columns).
  - Visual seat layout grid editor: click seats to toggle VIP recliners, regular seats, or create aisle walkway gaps.
  - **Destructive Edit Conflict Safeguard**: Warns administrator if layout changes disable or remove seats already booked in upcoming shows.
- **Movie Catalog Manager (`/admin/movies`)**:
  - Add, edit, or remove movies with custom posters, banners, duration, genres, and ratings.
- **Showtime Scheduler (`/admin/shows`)**:
  - Schedule screenings with specific base price and VIP tier pricing.
  - **Collision Conflict Detector**: Prevents overlapping show schedules in the same auditorium (includes a 15-minute auditorium cleaning buffer).
  - Automatically initializes independent seat inventory from the theatre's layout.
- **All Bookings Explorer (`/admin/bookings`)**:
  - Multi-criteria filter: Theatre, Movie, Date, Customer, Booking Ref, and Status.
  - Toggle between **Flat Table** and **Grouped by Theatre** views.
  - Cancel booking action with automatic seat inventory release.

---

## Redux Store Architecture

Organized into feature-specific slices:

```
src/
├── app/
│   └── store.js               # Redux store configuration with localStorage sync
├── features/
│   ├── auth/authSlice.js      # Session, login, registration, role checks
│   ├── theatres/theatreSlice.js # Theatres CRUD, layouts, search & location filters
│   ├── movies/movieSlice.js   # Movies CRUD, genres, search
│   ├── shows/showSlice.js     # Show scheduling, independent seat inventory
│   ├── seats/seatSlice.js     # Customer draft selection, real-time total
│   ├── bookings/bookingSlice.js # Booking creation, references, customer selectors
│   └── admin/adminSlice.js    # Statistics, filters, sorting, grouped views
├── components/
│   ├── Header.jsx             # Nav, brand, demo switchers, reset button
│   ├── Footer.jsx             # Quick links, architecture notice
│   ├── MovieCard.jsx          # Poster, rating, genres, action buttons
│   ├── TheatreCard.jsx        # Amenities, screen info, now screening
│   ├── SeatGrid.jsx           # Screen curve, seat rows, color legends
│   ├── BookingSummary.jsx     # Live pricing breakdown sidebar
│   ├── Ticket.jsx             # Digital ticket with SVG QR code & print CSS
│   ├── ProtectedRoute.jsx     # Customer authentication guard
│   └── AdminRoute.jsx         # Administrator role guard
├── pages/
│   ├── Home.jsx
│   ├── Movies.jsx
│   ├── MovieDetails.jsx
│   ├── Theatres.jsx
│   ├── TheatreDetails.jsx
│   ├── SeatSelection.jsx
│   ├── Checkout.jsx
│   ├── TicketConfirmation.jsx
│   ├── MyBookings.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── ManageTheatres.jsx
│       ├── ManageMovies.jsx
│       ├── ManageShows.jsx
│       └── AllBookings.jsx
├── utils/
│   ├── storage.js             # LocalStorage persistence, seed data, client hash
│   ├── pricing.js             # INR formatting, fees, and tax calculations
│   ├── ticketGenerator.js     # Unique ref generator & QR payload creator
│   └── validation.js          # Collision detector & form validators
└── styles/
    ├── global.css             # Theme variables, typography, reset, buttons
    └── components.css         # Headers, grids, tickets, responsive rules
```

---

## Local Development & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build Production Distribution**:
   ```bash
   npm run build
   ```

4. **Run End-to-End Test Suite**:
   ```bash
   node test-journey.js
   ```

---

## License & Attribution

CINEMAX is developed as a frontend architecture showcase demonstrating Redux Toolkit state management, custom CSS design systems, and client-side persistence.
