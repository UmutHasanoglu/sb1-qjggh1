import express from 'express';
import session from 'express-session';
import passport from 'passport';
import conversionRouter from './api/conversionRouter';
import authRouter from './api/authRouter';
import { authConfig } from './config/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Session middleware
app.use(session({
  secret: authConfig.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: authConfig.session.cookie
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api', conversionRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
