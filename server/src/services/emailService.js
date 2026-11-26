const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (env.emailDevMode || !env.smtpHost || !env.smtpUser || !env.smtpPass) {
    // Development preview transport using jsonTransport (no external network call)
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });

  return transporter;
}

/**
 * Send an email or log a preview in development mode.
 * Returns { status: 'SENT' | 'PREVIEWED', info }
 */
async function sendEmail({ to, subject, html, text }) {
  const mailTransporter = getTransporter();
  const isDevPreview = env.emailDevMode || !env.smtpHost || !env.smtpUser || !env.smtpPass;

  const info = await mailTransporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
    html,
  });

  if (isDevPreview) {
    console.log('\n================ [PlaceTrack Email Dev Preview] ================');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${text}`);
    console.log('================================================================\n');
    return { status: 'PREVIEWED', messageId: info.messageId, preview: text };
  }

  return { status: 'SENT', messageId: info.messageId };
}

module.exports = { sendEmail };
