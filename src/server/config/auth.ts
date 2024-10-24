export const authConfig = {
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: 'http://localhost:3000/api/auth/google/callback'
  },
  session: {
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }
};
