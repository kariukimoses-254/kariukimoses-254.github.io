const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: { lat: Number, lng: Number },
    },
    features: [String],
    images: [String],
    status: {
      type: String,
      enum: ['available', 'sold', 'pending'],
      default: 'available',
    },
    views: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const agentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    ratings: [{ rating: Number, review: String }],
    averageRating: { type: Number, default: 0 },
    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);
const Agent = mongoose.model('Agent', agentSchema);

module.exports = { Listing, Agent };