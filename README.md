# Overbeck Museum Volunteer Management System

A full-stack web application for managing volunteers at the Overbeck Museum. The system handles volunteer registration, shift scheduling, and administrative tasks with AI-powered recommendations.

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **NextAuth.js** - Authentication
- **i18next** - Internationalization (English/German)
- **react-big-calendar** - Calendar component

### Backend
- **Node.js / Express** - Server framework
- **TypeScript** - Type safety
- **Firebase Admin SDK** - Authentication & Firestore database
- **Nodemailer** - Email notifications
- **Open AI** - Smart scheduling recommendations

## Features

### For Volunteers
- Account registration with admin approval
- Apply for time slots
- View personal schedule
- Request shift cancellations
- AI-powered shift recommendations based on availability

### For Admins
- Approve/reject volunteer registrations
- Manage time slot applications
- Create appointments directly
- Handle cancellation requests
- AI-powered scheduling suggestions (coverage gaps, volunteer matching)
- Manage time slots (create, edit, delete)
- Add new administrators

## Project Structure

```
overbeck-volunteer-system/
├── client/                     # Next.js frontend
│   ├── app/
│   │   ├── admin/             # Admin dashboard
│   │   ├── volunteer/         # Volunteer pages
│   │   ├── components/        # React components
│   │   ├── utils/
│   │   │   ├── api/          # API utilities
│   │   │   └── Firebase/     # Firebase config
│   │   └── i18n/             # Translations
│   ├── pages/api/auth/        # NextAuth configuration
│   └── types/                 # TypeScript definitions
│
├── server/                     # Express backend
│   └── src/
│       ├── controllers/       # Route handlers
│       ├── models/            # Data models (Firestore)
│       ├── routes/            # API routes
│       ├── services/          # Business logic
│       ├── middleware/        # Auth middleware
│       └── types/             # TypeScript definitions
```

## API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/volunteer-register` | Public | Register new volunteer |
| POST | `/api/auth/admin-register` | Admin | Register new admin |
| DELETE | `/api/auth/delete-user` | Authenticated | Delete user account |

### Volunteer
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/volunteer/apply-for-time-slot` | Authenticated | Apply for a shift |
| GET | `/api/volunteer/applied-time-slots/:email` | Authenticated | Get pending applications |
| GET | `/api/volunteer/my-time-slots/:email` | Authenticated | Get approved shifts |
| POST | `/api/volunteer/request-cancellation` | Authenticated | Request shift cancellation |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/admin/verify-time-slot-application` | Admin | Approve/reject application |
| POST | `/api/admin/verify-new-volunteer-application` | Admin | Approve/reject volunteer |
| GET | `/api/admin/pending-volunteers` | Admin | List pending registrations |
| GET | `/api/admin/approved-volunteers` | Admin | List approved volunteers |
| POST | `/api/admin/approve-cancellation` | Admin | Approve cancellation |
| POST | `/api/admin/reject-cancellation` | Admin | Reject cancellation |

### Slots
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/slots` | Public | List all time slots |
| POST | `/api/slots` | Admin | Create new slot |
| PUT | `/api/slots/:slotId` | Admin | Update slot |
| DELETE | `/api/slots/:slotId` | Admin | Delete slot |

### Recommendations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/recommendations/smart-recommendations/:email` | Authenticated | AI suggestions for volunteer |
| GET | `/api/recommendations/admin-recommendations` | Admin | AI suggestions for admins |

### Other
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/application/approved-timeslots` | Authenticated | All approved appointments |
| GET | `/api/application/pending-timeslots` | Authenticated | All pending applications |

## Setup

### Prerequisites
- Node.js 18+
- Firebase project with Firestore and Authentication enabled
- OpenAI API key (for AI recommendations)
- SMTP server for emails

### Environment Variables

**Client (`client/.env.local`)**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

**Server (`server/src/.env`)**
```env
# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# AI
OpenAI_API_KEY=
```

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd overbeck-volunteer-system

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### Running the Application

**Development**
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

**Production**
```bash
# Build and start backend
cd server
npm run build
npm start

# Build and start frontend
cd client
npm run build
npm start
```

## Authentication Flow

1. User signs in via NextAuth with Firebase credentials
2. Firebase Auth verifies credentials and returns ID token
3. Admin status is checked via Firebase Custom Claims (`admin: true`)
4. Frontend stores session via NextAuth
5. API requests include Firebase ID token in `Authorization: Bearer <token>` header
6. Backend middleware verifies token and checks admin claim for protected routes

## Internationalization

The application supports English and German. Translations are stored in:
- `client/app/i18n/locales/de.json`

Language can be switched via the LanguageSwitcher component in the UI.

## Email Notifications

The system sends emails for:
- New volunteer registration (to admins)
- Account approved/rejected (to volunteer)
- New time slot application (to admins)
- Application approved/rejected (to volunteer)
- New assignment (to volunteer)
- Cancellation request (to admins)
- Cancellation approved/rejected (to volunteer)
- New admin added (to new admin)

Email templates support both English and German.

## AI Recommendations

### For Volunteers
Suggests optimal shifts based on:
- Volunteer's preferred days
- Current coverage gaps
- Historical patterns

### For Admins
Suggests volunteers to fill gaps based on:
- Coverage analysis
- Volunteer availability
- Preferred days matching

Powered by OpenAI.

## Security

- All non-public endpoints require Firebase ID token authentication
- Admin endpoints verify `admin: true` custom claim
- Passwords handled by Firebase Auth (never stored in Firestore)
- CORS configured for frontend origin only

## License

MIT
