/* ============================================
   Lil Mosey Estate 6G Edition - Static Demo Data
   ------------------------------------------------------------
   Provides an in-page data set + a tiny API shim so the frontend
   renders even when the Node/Express backend (port 5000) is not
   running - e.g. when hosted as a static site on GitHub Pages.

   `window.DemoData.get(endpoint)` returns an object shaped like a
   real API response for the supported read-only endpoints, or
   `null` when it has no demo data for that endpoint.
   ============================================ */
(function () {
  'use strict';

  var IMAGES = [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
  ];

  var AGENTS = [
    { first_name: 'Grace', last_name: 'Wanjiru', specialization: 'Luxury Homes', agent_rating: 4.9, agent_phone: '+254700111222', agent_email: 'grace@lilmoseyestate.co.ke' },
    { first_name: 'Brian', last_name: 'Otieno', specialization: 'Apartments & Rentals', agent_rating: 4.7, agent_phone: '+254700333444', agent_email: 'brian@lilmoseyestate.co.ke' },
    { first_name: 'Amina', last_name: 'Hassan', specialization: 'Coastal Properties', agent_rating: 4.8, agent_phone: '+254700555666', agent_email: 'amina@lilmoseyestate.co.ke' }
  ];

  function makeProperty(o, idx) {
    var a = AGENTS[idx % AGENTS.length];
    var image = o.image || IMAGES[idx % IMAGES.length];
    return {
      property_id: idx + 1,
      title: o.title,
      address: o.address || o.title,
      city: o.city,
      county: o.county,
      purpose: o.purpose,
      price: o.price,
      status: 'available',
      bedrooms: o.bedrooms,
      bathrooms: o.bathrooms,
      kitchens: o.kitchens || 1,
      parking_spaces: o.parking || 2,
      area_sqft: o.area_sqft,
      year_built: o.year_built || 2019,
      type_id: o.type_id,
      type_name: o.type_name,
      category_name: 'Residential',
      description: o.description,
      views_count: o.views || 120,
      is_featured: o.featured ? 1 : 0,
      is_booked: 0,
      latitude: o.lat,
      longitude: o.lng,
      primary_image: image,
      images: [
        { image_url: image },
        { image_url: IMAGES[(idx + 1) % IMAGES.length] },
        { image_url: IMAGES[(idx + 2) % IMAGES.length] },
        { image_url: IMAGES[(idx + 3) % IMAGES.length] }
      ],
      amenities: [
        { amenity_name: '6G Smart Home', icon: 'fa-tower-broadcast' },
        { amenity_name: 'Swimming Pool', icon: 'fa-water' },
        { amenity_name: '24/7 Security', icon: 'fa-shield-halved' },
        { amenity_name: 'Secure Parking', icon: 'fa-car' },
        { amenity_name: 'Fitness Centre', icon: 'fa-dumbbell' },
        { amenity_name: 'Solar Backup', icon: 'fa-solar-panel' }
      ],
      reviews: [
        { first_name: 'Peter', last_name: 'Kamau', rating: 5, comment: 'Fantastic property and a smooth viewing. Highly recommend.', created_at: '2025-11-02T10:00:00Z' },
        { first_name: 'Lucy', last_name: 'Njeri', rating: 4, comment: 'Great location and a very responsive agent.', created_at: '2025-12-18T10:00:00Z' }
      ],
      review_count: 2,
      agent_first_name: a.first_name,
      agent_last_name: a.last_name,
      specialization: a.specialization,
      agent_rating: a.agent_rating,
      agent_phone: a.agent_phone,
      agent_email: a.agent_email
    };
  }

  var RAW = [
    { title: 'Luxury Villa, Karen', city: 'Nairobi', county: 'Nairobi', purpose: 'sale', price: 78000000, bedrooms: 5, bathrooms: 4, area_sqft: 6500, type_id: 2, type_name: 'Villa', featured: 1, lat: -1.3192, lng: 36.7069, description: 'A sprawling five-bedroom villa in Karen set on mature gardens, with a private pool, staff quarters and full 6G smart-home automation.' },
    { title: 'Modern Penthouse, Westlands', city: 'Nairobi', county: 'Nairobi', purpose: 'rent', price: 350000, bedrooms: 4, bathrooms: 3, area_sqft: 3200, type_id: 1, type_name: 'Penthouse', featured: 1, lat: -1.2673, lng: 36.8065, description: 'Top-floor penthouse with panoramic city views, an open-plan living area, private lift access and rooftop terrace.' },
    { title: 'Family Townhouse, Kiambu', city: 'Kiambu', county: 'Kiambu', purpose: 'sale', price: 24500000, bedrooms: 4, bathrooms: 3, area_sqft: 2800, type_id: 3, type_name: 'Townhouse', featured: 1, lat: -1.1714, lng: 36.8356, description: 'Well-appointed four-bedroom townhouse in a gated community with a shared playground and reliable water supply.' },
    { title: 'Beachfront Home, Nyali', city: 'Mombasa', county: 'Mombasa', purpose: 'sale', price: 53000000, bedrooms: 3, bathrooms: 3, area_sqft: 3400, type_id: 2, type_name: 'Villa', featured: 1, lat: -4.0333, lng: 39.7000, description: 'Direct beach access, an infinity pool and shaded verandas make this Nyali home the perfect coastal retreat.' },
    { title: 'Elegant Apartment, Kilimani', city: 'Nairobi', county: 'Nairobi', purpose: 'rent', price: 95000, bedrooms: 2, bathrooms: 2, area_sqft: 1400, type_id: 1, type_name: 'Apartment', featured: 1, lat: -1.2921, lng: 36.7833, description: 'Bright two-bedroom apartment close to schools, hospitals and shopping, with a gym and backup generator.' },
    { title: 'Garden Maisonette, Runda', city: 'Nairobi', county: 'Nairobi', purpose: 'sale', price: 62000000, bedrooms: 5, bathrooms: 4, area_sqft: 5200, type_id: 3, type_name: 'Maisonette', featured: 1, lat: -1.2200, lng: 36.8000, description: 'A serene five-bedroom maisonette in Runda with a large garden, borehole and solar water heating.' },
    { title: 'City Studio, Ngara', city: 'Nairobi', county: 'Nairobi', purpose: 'rent', price: 35000, bedrooms: 1, bathrooms: 1, area_sqft: 620, type_id: 1, type_name: 'Studio', lat: -1.2800, lng: 36.8300, description: 'Compact, fully furnished studio ideal for professionals, minutes from the CBD with excellent transport links.' },
    { title: 'Lakeview Villa, Naivasha', city: 'Naivasha', county: 'Nakuru', purpose: 'sale', price: 39500000, bedrooms: 4, bathrooms: 3, area_sqft: 4100, type_id: 2, type_name: 'Villa', lat: -0.7167, lng: 36.4333, description: 'Escapist four-bedroom villa overlooking Lake Naivasha, with a boathouse, fireplace and expansive decking.' },
    { title: 'Executive Apartment, Milimani', city: 'Kisumu', county: 'Kisumu', purpose: 'rent', price: 75000, bedrooms: 3, bathrooms: 2, area_sqft: 1800, type_id: 1, type_name: 'Apartment', lat: -0.1000, lng: 34.7500, description: 'Spacious three-bedroom apartment in leafy Milimani with lake breezes, a pool and secure parking.' },
    { title: 'Riverside Townhouse, Lavington', city: 'Nairobi', county: 'Nairobi', purpose: 'sale', price: 41000000, bedrooms: 4, bathrooms: 4, area_sqft: 3600, type_id: 3, type_name: 'Townhouse', lat: -1.2833, lng: 36.7667, description: 'Contemporary four-bedroom townhouse in Lavington with a private garden and shared amenities.' },
    { title: 'Seaview Apartment, Nyali', city: 'Mombasa', county: 'Mombasa', purpose: 'rent', price: 120000, bedrooms: 3, bathrooms: 2, area_sqft: 1900, type_id: 1, type_name: 'Apartment', lat: -4.0400, lng: 39.7100, description: 'Airy three-bedroom apartment with sweeping ocean views, a shared pool and 24-hour security.' },
    { title: 'Prime Plot, Kilimani', city: 'Nairobi', county: 'Nairobi', purpose: 'sale', price: 88000000, bedrooms: 0, bathrooms: 0, area_sqft: 22000, type_id: 4, type_name: 'Land', lat: -1.2900, lng: 36.7800, description: 'Half-acre prime residential plot in Kilimani, ready for development with water and power at the boundary.' }
  ];

  var PROPERTIES = RAW.map(makeProperty);

  function listResponse(list, page, limit) {
    var p = Math.max(1, parseInt(page, 10) || 1);
    var l = Math.max(1, parseInt(limit, 10) || 9);
    var start = (p - 1) * l;
    return {
      data: {
        properties: list.slice(start, start + l),
        pagination: {
          total: list.length,
          page: p,
          limit: l,
          totalPages: Math.max(1, Math.ceil(list.length / l))
        }
      }
    };
  }

  function filterProperties(params) {
    var list = PROPERTIES.slice();
    var city = params.get('city');
    var typeId = params.get('type_id');
    var purpose = params.get('purpose');
    var minPrice = params.get('min_price');
    var maxPrice = params.get('max_price');
    var bedrooms = params.get('bedrooms');
    var bathrooms = params.get('bathrooms');
    if (city) list = list.filter(function (x) { return (x.city || '').toLowerCase() === city.toLowerCase(); });
    if (typeId) list = list.filter(function (x) { return String(x.type_id) === String(typeId); });
    if (purpose) list = list.filter(function (x) { return x.purpose === purpose; });
    if (minPrice) list = list.filter(function (x) { return Number(x.price) >= Number(minPrice); });
    if (maxPrice) list = list.filter(function (x) { return Number(x.price) <= Number(maxPrice); });
    if (bedrooms) list = list.filter(function (x) { return Number(x.bedrooms) >= Number(bedrooms); });
    if (bathrooms) list = list.filter(function (x) { return Number(x.bathrooms) >= Number(bathrooms); });
    return list;
  }

  window.DemoData = {
    properties: PROPERTIES,
    agents: AGENTS,
    get: function (endpoint) {
      var parts = String(endpoint).split('?');
      var path = parts[0];
      var params = new URLSearchParams(parts[1] || '');

      var detail = path.match(/^\/properties\/(\d+)$/);
      if (detail) {
        var id = Number(detail[1]);
        var property = PROPERTIES.find(function (x) { return x.property_id === id; }) || PROPERTIES[0];
        return { data: { property: property } };
      }

      if (path === '/properties') {
        if (params.get('featured')) {
          var featured = PROPERTIES.filter(function (x) { return x.is_featured; });
          return listResponse(featured, params.get('page'), params.get('limit') || 6);
        }
        return listResponse(filterProperties(params), params.get('page'), params.get('limit') || 9);
      }

      if (path === '/agents') {
        return { data: { agents: AGENTS } };
      }

      return null;
    }
  };
})();
