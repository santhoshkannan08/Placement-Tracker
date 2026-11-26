const crypto = require('crypto');
const env = require('../config/env');

const CSRF_COOKIE_NAME = 'XSRF-TOKEN';
const CSRF_HEADER_NAME = 'x-csrf-token';

const generateCsrfToken = () => crypto.randomBytes(24).toString('hex');

const setCsrfCookie = (res, token) => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Readable by frontend JS to echo in X-CSRF-Token header
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
};

const ensureCsrfToken = (req, res, next) => {
  if (!req.cookies?.[CSRF_COOKIE_NAME]) {
    setCsrfCookie(res, generateCsrfToken());
  }
  next();
};

const verifyCsrf = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt initial login/register/logout if client hasn't fetched a CSRF token yet,
  // or require it when cookie is present. Better: always require when XSRF-TOKEN cookie exists,
  // and frontend fetches /api/auth/csrf or receives it on initial GET /api/auth/me.
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken = req.headers?.[CSRF_HEADER_NAME];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    });
  }

  next();
};

module.exports = {
  CSRF_COOKIE_NAME,
  generateCsrfToken,
  setCsrfCookie,
  ensureCsrfToken,
  verifyCsrf,
};
