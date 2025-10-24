import app from './app';
import { env } from './config/env';

const port = env.port;
const server = app.listen(port, () => {
  console.log(`✓ Server running on http://localhost:${port}`);
  console.log(`✓ Environment: ${env.nodeEnv}`);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Closing server gracefully...`);
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    console.error('⚠ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});
