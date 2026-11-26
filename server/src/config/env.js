const dotenv = require('dotenv');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  // Load .env.local (Neon env vars) first, then server/.env and root .env
  dotenv.config({ path: path.resolve(__dirname, '../../../.env.local') });
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

const nodeEnv = process.env.NODE_ENV || 'development';
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const jwtSecret = process.env.JWT_SECRET || '';
const cookieSecret = process.env.COOKIE_SECRET || '';
const smtpHost = process.env.SMTP_HOST || '';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';
const emailDevMode =
  process.env.EMAIL_DEV_MODE === undefined
    ? nodeEnv !== 'production'
    : process.env.EMAIL_DEV_MODE === 'true';

if (nodeEnv === 'production') {
  const isHttpsOrigin = (() => {
    try {
      const url = new URL(clientUrl);
      return url.protocol === 'https:' && url.origin === clientUrl;
    } catch {
      return false;
    }
  })();

  if (jwtSecret.length < 32 || cookieSecret.length < 32) {
    throw new Error(
      'JWT_SECRET and COOKIE_SECRET must each be at least 32 characters in production.'
    );
  }

  if (!isHttpsOrigin) {
    throw new Error('CLIENT_URL must be an HTTPS origin without a path in production.');
  }
}

if (!emailDevMode && (!smtpHost || !smtpUser || !smtpPass)) {
  throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASS are required when EMAIL_DEV_MODE=false.');
}

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  clientUrl,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: jwtSecret || 'dev-fallback-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecret: cookieSecret || 'dev-cookie-secret',
  emailDevMode,
  smtpHost,
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === 'true',
  smtpUser,
  smtpPass,
  emailFrom: process.env.EMAIL_FROM || `PlaceTrack <${smtpUser || 'noreply@placetrack.local'}>`,
};

module.exports = env;
