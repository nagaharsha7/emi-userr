# PayTrack - Premium EMI & Loan Tracker

PayTrack is a modern, responsive, and visually stunning fintech web application designed for tracking personal loans, monitoring monthly EMI schedules, and analyzing repayment progress. 

The application is styled with a premium dashboard aesthetic (similar to Google Pay, CRED, and PhonePe) and features dual-operation: it fully integrates with Firebase for authentication and Firestore data storage, and includes an automatic **Local Storage Mock Mode** fallback if Firebase credentials are not provided.

---

## Key Features

- **Authentication System**: Secure registration, login (with "Remember Me" credential preservation), forgot password, and profile settings using Firebase Authentication.
- **Interactive Dashboard Analytics**:
  - Summary metrics: Total Loans, Active Loans, Remaining Outstanding Balance, and Repaid Capital.
  - Due Reminder Panel: Alerts for EMIs due **Today**, **Upcoming** (next 15 days), or **Overdue** (past active due dates).
  - Repayment Progress Chart: Stacked bars comparing repaid vs outstanding balances per loan.
  - Monthly Cash Spend Chart: Area curve outlining payment outflows over the last 6 months.
- **Loan Portfolio Vault**:
  - Add new loan records with lenders, principal, EMI, interest rate, duration, and notes.
  - Complete list grid with live search, status filtering, and sorting (by date, amount, A-Z).
- **In-depth Loan Analysis**:
  - Repayment timeline analysis and next due date projections.
  - Interactive **PAY EMI** dialog drawer to record payments (UPI, Cards, Cash) and decrease balances.
- **Centralized Ledger**: Export transaction logs to CSV spreadsheets.
- **Premium UX details**:
  - Glassmorphic card layouts.
  - Transitions and micro-animations.
  - Global custom Toast Notification system.
  - **Dark Mode** toggle.

---

## Tech Stack

- **Framework**: React.js 19 (scaffolded via Vite)
- **Styling**: Tailwind CSS v3 & PostCSS
- **Database / Backend**: Firebase Firestore & Firebase Auth
- **Visual Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## Directory Layout

```text
src/
├── assets/         # Project images and assets
├── components/     # Reusable presentation and utility components
│   ├── Navbar.jsx           # Global sticky navigation header and theme switcher
│   ├── Sidebar.jsx          # Desktop layout sidebar & mobile overlay drawer
│   ├── LoanCard.jsx         # Card template for loan specs & progress bars
│   ├── DashboardCard.jsx    # Metric indicator card
│   ├── ProgressBar.jsx      # Reusable progression line
│   ├── PaymentTable.jsx     # Responsive transaction log table
│   ├── ProtectedRoute.jsx   # Route guard for authenticated pages
│   └── LoadingSpinner.jsx   # Tailwind CSS animation loaders
├── pages/          # Core views
│   ├── Home.jsx             # Hero landing page
│   ├── Login.jsx            # Account authentication form
│   ├── Register.jsx         # Account signup form
│   ├── Dashboard.jsx        # Analytics charts & EMI schedules
│   ├── AddLoan.jsx          # New loan submission form
│   ├── LoanDetails.jsx      # Progress timelines & PAY EMI actions
│   ├── PaymentHistory.jsx   # Exportable payment ledger
│   ├── Profile.jsx          # Account settings & password changes
│   └── NotFound.jsx         # 404 handler page
├── context/
│   └── AuthContext.jsx      # User sessions & custom Toast system
├── services/
│   ├── firebase.js          # Client initialization checks
│   ├── authService.js       # Firebase Auth/Local Storage controller
│   └── loanService.js       # Firestore/Local Storage data controller
├── App.jsx         # Main router and layout wrappers
└── main.jsx        # Mount entrypoint
```

---

## Installation & Setup

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Clone the repository and install dependencies
Navigate to the project root directory and run:
```bash
npm install --legacy-peer-deps
```
*(Note: `--legacy-peer-deps` is recommended to resolve peer dependencies cleanly with React 19).*

### 2. Configure Firebase Environment Variables
Create a `.env` file in the root directory and populate your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Local Storage Fallback (Optional)
If you **do not** have a Firebase project setup yet, simply leave the `.env` file blank. The application will detect this and automatically load into **Local Storage Mock Mode**, enabling you to add mock loans, sign up users, record repayments, and view charts immediately!

---

## Running the Application

### Start Development Server
```bash
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

### Production Build
```bash
npm run build
```
Verify compiled output inside the `dist` directory.
