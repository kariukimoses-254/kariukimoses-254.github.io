require('dotenv').config();

module.exports = {
  node: {
    port: process.env.PORT || 3000,
  },
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/fullstack_estate',
    options: { useNewUrlParser: true, useUnifiedTopology: true },
  },
  postgres: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432', 10),
    database: process.env.PG_DATABASE || 'fullstack_estate',
    username: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    dialect: 'postgres',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fullstack-demo-secret',
    expiresIn: process.env.JWT_EXPIRES || '7d',
  },
};