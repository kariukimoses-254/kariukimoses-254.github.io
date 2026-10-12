const { DataTypes } = require('sequelize');
const { sequelize } = require('../services/db');

const Property = sequelize.define('Property', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('house', 'apartment', 'land', 'commercial'), allowNull: false },
  bedrooms: { type: DataTypes.INTEGER, defaultValue: 0 },
  bathrooms: { type: DataTypes.INTEGER, defaultValue: 0 },
  area: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('available', 'sold', 'pending'), defaultValue: 'available' },
}, { tableName: 'properties', underscored: true });

const Agent = sequelize.define('Agent', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING },
  license: { type: DataTypes.STRING },
}, { tableName: 'agents', underscored: true });

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'buyer', 'seller'), defaultValue: 'buyer' },
}, { tableName: 'users', underscored: true });

Agent.hasMany(Property, { foreignKey: 'agentId', as: 'properties' });
Property.belongsTo(Agent, { foreignKey: 'agentId', as: 'agent' });

module.exports = { Property, Agent, User };