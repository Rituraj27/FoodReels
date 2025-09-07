import { app } from './src/app.js';
import dotenv from 'dotenv';
import { connectDB } from './src/db/db.js';

dotenv.config({
  path: '.env',
});

if (!process.env.PORT) {
  console.error('❌ PORT is not defined in .env');
  process.exit(1);
}

const port = process.env.PORT || 8000;

(async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully');

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
})();
