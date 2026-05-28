# Baby Chloe - Web Application

Modern baby tracking application built with React, TypeScript, and Fluent UI.

## Features

- 👶 **Baby Profile Management** - Track multiple babies with photos and details
- 😴 **Sleep Tracking** - Log and monitor sleep patterns and quality
- 🍼 **Feeding Tracker** - Record breast, bottle, and solid food feedings
- 🧷 **Diaper Changes** - Track diaper changes and monitor for rashes
- 📈 **Growth Charts** - Visualize weight, height, and head circumference over time
- 😢 **Cry Analyzer** - AI-powered cry analysis to understand baby's needs
- 📊 **Dashboard** - Comprehensive overview of daily activities
- 👥 **Multi-Caregiver** - Share tracking with family members (coming soon)
- 🎨 **Fluent Design** - Beautiful Microsoft Fluent UI components
- 🌓 **Dark Mode** - Automatic dark/light theme support

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Fluent UI (Microsoft)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Charts**: Recharts
- **Build Tool**: Vite
- **API Client**: Fetch API with TypeScript
- **Audio**: Web Audio API for cry analysis

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with microphone access (for cry analyzer)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_SIGNALR_HUB_URL=http://localhost:5000/hubs/sync
   VITE_ENABLE_CRY_ANALYZER=true
   VITE_ENABLE_GROWTH_TRACKING=true
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── common/         # Reusable components (Loading, Toast, etc.)
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── pages/              # Page components
│   ├── auth/          # Login, Register
│   ├── DashboardPage.tsx
│   ├── SleepPage.tsx
│   ├── FeedingPage.tsx
│   ├── DiaperPage.tsx
│   ├── GrowthPage.tsx
│   ├── CryAnalyzerPage.tsx
│   ├── ActivityPage.tsx
│   └── SettingsPage.tsx
├── services/           # API services
│   └── api/           # API client and service modules
├── store/             # Zustand stores (auth, baby, UI)
├── types/             # TypeScript type definitions
├── config/            # App configuration
├── App.tsx            # Main app component
├── router.tsx         # Route configuration
└── main.tsx          # App entry point
```

## API Integration

The app expects a REST API backend with the following endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/babies` - List babies
- `POST /api/babies` - Create baby
- `GET /api/sleep/:babyId` - Get sleep records
- `POST /api/sleep` - Create sleep record
- `GET /api/feedings/:babyId` - Get feeding records
- `POST /api/feedings` - Create feeding
- `GET /api/diapers/:babyId` - Get diaper changes
- `POST /api/diapers` - Create diaper change
- `GET /api/growth/:babyId` - Get growth measurements
- `POST /api/growth` - Create growth measurement
- `POST /api/cryanalysis/analyze` - Analyze cry audio
- `GET /api/cryanalysis/history/:babyId` - Get cry analysis history
- `GET /api/dashboard/:babyId` - Get dashboard summary
- `GET /api/activity/:babyId` - Get activity feed

See `src/services/api/` for detailed request/response types.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |
| `VITE_API_TIMEOUT` | API request timeout (ms) | `30000` |
| `VITE_SIGNALR_HUB_URL` | SignalR hub URL | `http://localhost:5000/hubs/sync` |
| `VITE_ENABLE_CRY_ANALYZER` | Enable cry analyzer feature | `true` |
| `VITE_ENABLE_GROWTH_TRACKING` | Enable growth tracking | `true` |
| `VITE_AZURE_TENANT_ID` | Azure AD tenant ID | - |
| `VITE_AZURE_CLIENT_ID` | Azure AD client ID | - |

## Features in Detail

### Sleep Tracking
- Start/stop sleep sessions in real-time
- Log completed sleep with quality ratings
- View sleep duration and patterns
- Historical sleep data with timestamps

### Feeding Tracker
- Support for breast (with side tracking), bottle (with amount), and solid food
- Duration tracking for nursing sessions
- Feeding history with notes
- Quick-log from dashboard

### Diaper Changes
- Track wet, dirty, both, or dry diapers
- Rash monitoring with severity levels
- Change frequency analytics
- Notes for each change

### Growth Charts
- Weight, height, and head circumference tracking
- Visual charts showing growth over time
- Measurement history
- Optional notes for each measurement

### Cry Analyzer (AI)
- Record baby's cry with browser microphone
- AI-powered reason detection (hungry, tired, discomfort, etc.)
- Confidence levels for predictions
- Suggested actions based on analysis
- Historical cry patterns

### Dashboard
- Today's summary (sleep hours, feedings, diaper changes)
- Recent activity feed
- Quick-add buttons
- Last feeding/sleep/diaper info

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Microphone access required for Cry Analyzer feature.

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - see LICENSE file for details

## Related Projects

- **Backend API**: See `../api` folder for .NET Core backend
- **Mobile App**: Coming soon (React Native)

## Support

For issues or questions, please open a GitHub issue.
