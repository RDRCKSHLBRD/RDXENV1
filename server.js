// server.js - RDXENV1 Portfolio (Cloud Run optimized)
const app = require('./src/app');

const port = parseInt(process.env.PORT) || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`RDXENV portfolio server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});