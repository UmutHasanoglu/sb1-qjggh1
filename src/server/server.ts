import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import conversionRouter from './api/conversionRouter';
import authRouter from './api/authRouter';
import { authConfig } from './config/auth';

const app = express();
const PORT = process.env.PORT || 3001; // Changed to 3001 to avoid conflict with Vite

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));

// Session middleware
app.use(session({
  secret: authConfig.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', conversionRouter);

// Create uploads directory if it doesn't exist
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
