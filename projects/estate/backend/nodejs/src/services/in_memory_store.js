const memStore = {
  listings: [],
  properties: [],
  memo: { listingSeq: 1, propertySeq: 1 },
};

function ensureSeedData() {
  if (memStore.listings.length === 0) {
    memStore.listings.push(
      {
        _id: 'mem-' + memStore.memo.listingSeq++,
        title: 'Lakefront Retreat',
        description: 'Stunning lakefront property with private dock and panoramic views.',
        price: 895000,
        location: { city: 'Lake Tahoe', state: 'CA', country: 'USA' },
        features: ['Lakefront', 'Private Dock', 'Fireplace'],
        images: [],
        status: 'available',
        views: 124,
        createdAt: new Date(),
      },
      {
        _id: 'mem-' + memStore.memo.listingSeq++,
        title: 'Mountain Cabin Hideaway',
        description: 'Cozy timber cabin nestled in the pines with ski access.',
        price: 389000,
        location: { city: 'Aspen', state: 'CO', country: 'USA' },
        features: ['Ski Access', 'Hot Tub', 'Sauna'],
        images: [],
        status: 'available',
        views: 87,
        createdAt: new Date(),
      },
      {
        _id: 'mem-' + memStore.memo.listingSeq++,
        title: 'Penthouse with Skyline Views',
        description: 'Top-floor penthouse with wraparound terrace overlooking the skyline.',
        price: 2400000,
        location: { city: 'New York', state: 'NY', country: 'USA' },
        features: ['Penthouse', 'Terrace', 'Concierge'],
        images: [],
        status: 'pending',
        views: 312,
        createdAt: new Date(),
      }
    );
  }
  if (memStore.properties.length === 0) {
    memStore.properties.push(
      {
        id: memStore.memo.propertySeq++,
        title: 'Modern Downtown Loft',
        description: 'Sleek urban loft with floor-to-ceiling windows and open concept living.',
        price: 425000,
        location: 'Austin, TX',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        area: 1180,
        status: 'available',
        createdAt: new Date(),
        agent: { id: 1, name: 'Sarah Mitchell', email: 'sarah@estate.dev', phone: '+1-555-0101', license: 'LA-2481' },
      },
      {
        id: memStore.memo.propertySeq++,
        title: 'Family Home with Garden',
        description: 'Spacious 4-bedroom family home on a quiet cul-de-sac.',
        price: 675000,
        location: 'Portland, OR',
        type: 'house',
        bedrooms: 4,
        bathrooms: 3,
        area: 2450,
        status: 'available',
        createdAt: new Date(),
        agent: { id: 2, name: 'James Rodriguez', email: 'james@estate.dev', phone: '+1-555-0102', license: 'LA-2482' },
      },
      {
        id: memStore.memo.propertySeq++,
        title: 'Commercial Retail Space',
        description: 'Prime retail corner lot in the heart of the business district.',
        price: 1200000,
        location: 'Seattle, WA',
        type: 'commercial',
        bedrooms: 0,
        bathrooms: 2,
        area: 3800,
        status: 'available',
        createdAt: new Date(),
        agent: { id: 3, name: 'Emily Chen', email: 'emily@estate.dev', phone: '+1-555-0103', license: 'LA-2483' },
      },
      {
        id: memStore.memo.propertySeq++,
        title: 'Hilltop Estate with Views',
        description: 'Grand estate on a hilltop with panoramic valley views.',
        price: 3200000,
        location: 'Beverly Hills, CA',
        type: 'house',
        bedrooms: 7,
        bathrooms: 8,
        area: 8900,
        status: 'available',
        createdAt: new Date(),
        agent: { id: 1, name: 'Sarah Mitchell', email: 'sarah@estate.dev', phone: '+1-555-0101', license: 'LA-2481' },
      },
      {
        id: memStore.memo.propertySeq++,
        title: 'Urban Condo with Amenities',
        description: 'Modern condo with rooftop pool and gym access.',
        price: 540000,
        location: 'Chicago, IL',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        area: 1150,
        status: 'pending',
        createdAt: new Date(),
        agent: { id: 2, name: 'James Rodriguez', email: 'james@estate.dev', phone: '+1-555-0102', license: 'LA-2482' },
      }
    );
  }
}

ensureSeedData();

function matches(filter = {}, item) {
  if (filter.type && item.type !== filter.type) return false;
  if (filter.status && item.status !== filter.status) return false;
  if (filter.minPrice !== undefined && Number(item.price) < Number(filter.minPrice)) return false;
  if (filter.maxPrice !== undefined && Number(item.price) > Number(filter.maxPrice)) return false;
  if (filter.city && (!item.location || item.location.city !== filter.city)) return false;
  return true;
}

module.exports = {
  ensureSeedData,

  findListings(filter = {}) {
    return memStore.listings.filter((l) => matches(filter, l));
  },
  findListingById(id) {
    return memStore.listings.find((l) => String(l._id) === String(id)) || null;
  },
  createListing(data) {
    const listing = {
      _id: 'mem-' + memStore.memo.listingSeq++,
      title: data.title,
      description: data.description || '',
      price: Number(data.price) || 0,
      location: data.location || {},
      features: data.features || [],
      images: data.images || [],
      status: data.status || 'available',
      views: 0,
      createdAt: new Date(),
    };
    memStore.listings.push(listing);
    return listing;
  },
  incrementListingViews(id) {
    const listing = this.findListingById(id);
    if (listing) {
      listing.views = (listing.views || 0) + 1;
      return listing;
    }
    return null;
  },

  findProperties(filter = {}) {
    return memStore.properties.filter((p) => matches(filter, p));
  },
  findPropertyById(id) {
    return memStore.properties.find((p) => String(p.id) === String(id)) || null;
  },
  createProperty(data) {
    const property = {
      id: memStore.memo.propertySeq++,
      title: data.title,
      description: data.description || '',
      price: Number(data.price) || 0,
      location: data.location || 'Unknown',
      type: data.type || 'house',
      bedrooms: data.bedrooms || 0,
      bathrooms: data.bathrooms || 0,
      area: data.area || 0,
      status: data.status || 'available',
      agentId: data.agentId || null,
      createdAt: new Date(),
    };
    memStore.properties.push(property);
    return property;
  },
  agents() {
    const agents = new Map();
    memStore.properties.forEach((p) => {
      if (p.agent && p.agent.id) agents.set(p.agent.id, p.agent);
    });
    return Array.from(agents.values());
  },
  listingCount() {
    return memStore.listings.length;
  },
  propertyCount() {
    return memStore.properties.length;
  },
};