const app = require('./src/app');
const sequelize = require('./src/config/database');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test database connection
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    console.log(`📊 Database: ${process.env.DB_NAME || 'discover_tbilisi'}`);
    console.log(`🔗 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}`);
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log('📋 All tables will be created automatically');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        sequelize.close().then(() => {
          console.log('Database connection closed');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please check your database configuration in .env file');
    console.error('Make sure PostgreSQL is running');
    process.exit(1);
  }
}

startServer();