const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { COOKIE_NAME } = require('../middleware/auth');
const { generateCsrfToken, setCsrfCookie } = require('../middleware/csrf');
const { registerSchema, loginSchema, profileUpdateSchema } = require('../validators/schemas');

const SALT_ROUNDS = 12;

function signToken(userId) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function setAuthCookies(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
  setCsrfCookie(res, generateCsrfToken());
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailRemindersEnabled: user.emailRemindersEnabled,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const getCsrf = (req, res) => {
  const token = generateCsrfToken();
  setCsrfCookie(res, token);
  res.json({ success: true, csrfToken: token });
};

const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
  });

  const token = signToken(user.id);
  setAuthCookies(res, token);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await bcrypt.compare(data.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = signToken(user.id);
  setAuthCookies(res, token);

  res.json({
    success: true,
    message: 'Logged in successfully.',
    user: sanitizeUser(user),
  });
});

const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    path: '/',
  });
  res.json({ success: true, message: 'Logged out successfully.' });
};

const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const data = profileUpdateSchema.parse(req.body);
  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.emailRemindersEnabled !== undefined) {
    updateData.emailRemindersEnabled = data.emailRemindersEnabled;
  }

  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new AppError('Current password is required to set a new password.', 400);
    }
    const userRecord = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(data.currentPassword, userRecord.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect.', 400);
    }
    updateData.passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
  });

  res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: sanitizeUser(updated),
  });
});

module.exports = { getCsrf, register, login, logout, getMe, updateProfile };
