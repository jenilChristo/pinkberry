export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  signalRHubUrl: import.meta.env.VITE_SIGNALR_HUB_URL || 'http://localhost:5000/hubs/sync',
  
  // Azure Configuration
  azure: {
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
  },

  // Feature Flags
  features: {
    cryAnalyzer: import.meta.env.VITE_ENABLE_CRY_ANALYZER === 'true',
    growthTracking: import.meta.env.VITE_ENABLE_GROWTH_TRACKING === 'true',
  },

  // Storage Keys
  storage: {
    authToken: 'babychloe_auth_token',
    refreshToken: 'babychloe_refresh_token',
    currentBaby: 'babychloe_current_baby',
    theme: 'babychloe_theme',
  },

  // Date/Time Formats
  dateFormats: {
    short: 'MMM d, yyyy',
    long: 'MMMM d, yyyy',
    time: 'h:mm a',
    dateTime: 'MMM d, yyyy h:mm a',
  },
} as const;
