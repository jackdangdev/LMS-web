/**
 * server.js - process entry point: load env -> connect DB -> listen.
 */
require('dotenv').config();

const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`[api] EduNova LMS running on http://localhost:${PORT}/api (${process.env.NODE_ENV})`);
    });

    const shutdown = async (signal) => {
      // eslint-disable-next-line no-console
      console.log(`\n[api] ${signal} received, closing gracefully...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };

    ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[api] Failed to start:', error.message);
    process.exit(1);
  }
};

start();
