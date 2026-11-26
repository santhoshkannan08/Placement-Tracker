const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const test = require('node:test');

const configPath = path.resolve(__dirname, '../src/config/env.js');

function loadProductionEnv(overrides = {}, unset = []) {
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    CLIENT_URL: 'https://placetrack.vercel.app',
    JWT_SECRET: 'test-jwt-secret-with-at-least-32-characters',
    COOKIE_SECRET: 'test-cookie-secret-with-at-least-32-characters',
    EMAIL_DEV_MODE: 'false',
    SMTP_HOST: 'smtp.gmail.com',
    SMTP_USER: 'sender@example.com',
    SMTP_PASS: 'test-app-password',
    ...overrides,
  };

  unset.forEach((key) => delete env[key]);

  return spawnSync(
    process.execPath,
    [
      '-e',
      `const env = require(${JSON.stringify(configPath)}); process.stdout.write(JSON.stringify({ emailDevMode: env.emailDevMode, emailFrom: env.emailFrom }))`,
    ],
    { env, encoding: 'utf8' }
  );
}

test('production requires SMTP credentials when live email is enabled', () => {
  const result = loadProductionEnv({ SMTP_PASS: '' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SMTP_HOST, SMTP_USER, and SMTP_PASS are required/);
});

test('production rejects missing-strength signing secrets', () => {
  const result = loadProductionEnv({ JWT_SECRET: 'too-short' });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /JWT_SECRET and COOKIE_SECRET must each be at least 32 characters/);
});

test('production defaults to live SMTP and uses the authenticated Gmail sender', () => {
  const result = loadProductionEnv({ EMAIL_FROM: '', SMTP_USER: 'sender@example.com' }, [
    'EMAIL_DEV_MODE',
  ]);

  assert.equal(result.status, 0, result.stderr);
  const config = JSON.parse(result.stdout);
  assert.equal(config.emailDevMode, false);
  assert.equal(config.emailFrom, 'PlaceTrack <sender@example.com>');
});
