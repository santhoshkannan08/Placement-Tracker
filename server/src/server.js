const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');
const { startReminderCron } = require('./services/reminderCron');

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL via Prisma.');

    startReminderCron();

    app.listen(env.port, () => {
      console.log(`PlaceTrack server running on http://localhost:${env.port} (${env.nodeEnv})`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
