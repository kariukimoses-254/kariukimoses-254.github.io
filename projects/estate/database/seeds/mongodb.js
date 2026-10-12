# ============================================================
# MongoDB Collections — fullstack_estate (via Node.js Mongoose)
# ============================================================

# --- Collection: listings ---
db.createCollection('listings');

db.listings.insertMany([
  {
    title: "Lakefront Retreat",
    description: "Stunning lakefront property with private dock and panoramic views.",
    price: 895000,
    location: { city: "Lake Tahoe", state: "CA", country: "USA", coordinates: { lat: 39.0968, lng: -120.0324 } },
    features: ["Lakefront", "Private Dock", "Fireplace", "Wine Cellar"],
    images: ["/images/lakefront-1.jpg", "/images/lakefront-2.jpg"],
    status: "available",
    views: 124,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Mountain Cabin Hideaway",
    description: "Cozy timber cabin nestled in the pines with ski access.",
    price: 389000,
    location: { city: "Aspen", state: "CO", country: "USA", coordinates: { lat: 39.1911, lng: -106.8175 } },
    features: ["Ski Access", "Hot Tub", "Sauna"],
    images: ["/images/cabin-1.jpg"],
    status: "available",
    views: 87,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Penthouse with Skyline Views",
    description: "Top-floor penthouse with wraparound terrace overlooking the skyline.",
    price: 2400000,
    location: { city: "New York", state: "NY", country: "USA", coordinates: { lat: 40.7128, lng: -74.006 } },
    features: ["Penthouse", "Terrace", "Concierge", "Smart Home"],
    images: ["/images/penthouse-1.jpg", "/images/penthouse-2.jpg"],
    status: "pending",
    views: 312,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

# --- Collection: agents ---
db.createCollection('agents');

db.agents.insertMany([
  {
    name: "Sarah Mitchell",
    email: "sarah@estate.dev",
    phone: "+1-555-0101",
    ratings: [{ rating: 5, review: "Excellent negotiator" }],
    averageRating: 4.8,
    listings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "James Rodriguez",
    email: "james@estate.dev",
    phone: "+1-555-0102",
    ratings: [],
    averageRating: 4.5,
    listings: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

# --- Indexes ---
db.listings.createIndex({ status: 1 });
db.listings.createIndex({ "location.city": 1 });
db.listings.createIndex({ price: 1 });
db.listings.createIndex({ createdAt: -1 });
db.agents.createIndex({ email: 1 }, { unique: true });