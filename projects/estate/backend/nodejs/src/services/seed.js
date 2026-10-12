const { Property, Agent } = require('../models/postgres');
const { Listing } = require('../models/mongo');

async function seed() {
  await Property.sync({ force: true });
  await Agent.sync({ force: true });

  const agents = await Agent.bulkCreate([
    { name: 'Sarah Mitchell', email: 'sarah@estate.dev', phone: '+1-555-0101', license: 'LA-2481' },
    { name: 'James Rodriguez', email: 'james@estate.dev', phone: '+1-555-0102', license: 'LA-2482' },
    { name: 'Emily Chen', email: 'emily@estate.dev', phone: '+1-555-0103', license: 'LA-2483' },
  ]);

  await Property.bulkCreate([
    {
      title: 'Modern Downtown Loft',
      description: 'Sleek urban loft with floor-to-ceiling windows and open concept living.',
      price: 425000,
      location: 'Austin, TX',
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      area: 1180,
      agentId: agents[0].id,
    },
    {
      title: 'Family Home with Garden',
      description: 'Spacious 4-bedroom family home on a quiet cul-de-sac.',
      price: 675000,
      location: 'Portland, OR',
      type: 'house',
      bedrooms: 4,
      bathrooms: 3,
      area: 2450,
      agentId: agents[1].id,
    },
    {
      title: 'Commercial Retail Space',
      description: 'Prime retail corner lot in the heart of the business district.',
      price: 1200000,
      location: 'Seattle, WA',
      type: 'commercial',
      bedrooms: 0,
      bathrooms: 2,
      area: 3800,
      agentId: agents[2].id,
    },
  ]);

  await Listing.create([
    {
      title: 'Lakefront Retreat',
      description: 'Stunning lakefront property with private dock and panoramic views.',
      price: 895000,
      location: { city: 'Lake Tahoe', state: 'CA', country: 'USA', coordinates: { lat: 39.0968, lng: -120.0324 } },
      features: ['Lakefront', 'Private Dock', 'Fireplace', 'Wine Cellar'],
      images: ['/images/lakefront-1.jpg', '/images/lakefront-2.jpg'],
    },
    {
      title: 'Mountain Cabin Hideaway',
      description: 'Cozy timber cabin nestled in the pines with ski access.',
      price: 389000,
      location: { city: 'Aspen', state: 'CO', country: 'USA', coordinates: { lat: 39.1911, lng: -106.8175 } },
      features: ['Ski Access', 'Hot Tub', 'Sauna', 'Rustic Timber'],
      images: ['/images/cabin-1.jpg'],
    },
    {
      title: 'Penthouse with Skyline Views',
      description: 'Top-floor penthouse with wraparound terrace overlooking the skyline.',
      price: 2400000,
      location: { city: 'New York', state: 'NY', country: 'USA', coordinates: { lat: 40.7128, lng: -74.006 } },
      features: ['Penthouse', 'Terrace', 'Concierge', 'Smart Home'],
      images: ['/images/penthouse-1.jpg', '/images/penthouse-2.jpg', '/images/penthouse-3.jpg'],
    },
  ]);

  console.log('Seed complete: 3 agents, 3 properties (PostgreSQL), 3 listings (MongoDB)');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});