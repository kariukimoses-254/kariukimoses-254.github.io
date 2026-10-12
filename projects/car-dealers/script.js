const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
menuToggle?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? '×' : '☰';
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle?.setAttribute('aria-expanded', 'false');
  if (menuToggle) menuToggle.textContent = '☰';
}));

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const form = document.querySelector('#car-search');
    const feedback = document.querySelector('#search-feedback');
    const selling = tab.dataset.mode === 'sell';
    form.querySelector('.search-btn').innerHTML = selling ? 'List Your Car ↗' : '<span>⌕</span> Search';
    feedback.textContent = selling ? 'Ready to sell? Choose “List Your Car” to start your listing.' : '';
  });
});

document.querySelector('#car-search')?.addEventListener('submit', event => {
  event.preventDefault();
  const brand = document.querySelector('#brand-filter').value;
  const feedback = document.querySelector('#search-feedback');
  const cards = [...document.querySelectorAll('.car-card')];
  let count = 0;
  cards.forEach(card => {
    const match = !brand || card.dataset.brand === brand;
    card.hidden = !match;
    if (match) count++;
  });
  if (document.querySelector('.tab.active')?.dataset.mode === 'sell') {
    feedback.textContent = 'To list your vehicle, contact our team using the contact details below.';
    cards.forEach(card => card.hidden = false);
  } else {
    feedback.textContent = count ? `${count} featured vehicle${count === 1 ? '' : 's'} match your search.` : 'No featured vehicles match this make. Try another brand.';
  }
});

document.querySelectorAll('.heart').forEach(button => {
  button.addEventListener('click', () => {
    const saved = button.classList.toggle('saved');
    button.textContent = saved ? '♥' : '♡';
    button.setAttribute('aria-pressed', String(saved));
  });
});

document.querySelector('#value-car')?.addEventListener('click', () => {
  const input = document.querySelector('.valuation-card input');
  const result = document.querySelector('#valuation-result');
  if (!input.value.trim()) {
    result.textContent = 'Please enter your car make and model.';
    input.focus();
    return;
  }
  result.textContent = 'Thanks! Our team can provide a tailored valuation.';
});

document.querySelector('#newsletter')?.addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#newsletter-message').textContent = 'Thanks for subscribing!';
  event.currentTarget.reset();
});

const testimonials = [
  [
    ['The process was smooth and professional. I found my dream car at a great price. Highly recommended!', 'James Carter', 'J'],
    ["Excellent service, great response, and very helpful support. I'd definitely shop here again.", 'Sarah Mitchell', 'S'],
    ['Fast car buying experience. The team helped me find a vehicle that was exactly what I needed.', 'Daniel Kim', 'D']
  ],
  [
    ['The team explained every step and helped me compare cars without any pressure.', 'Michael Reed', 'M'],
    ['A clean, simple experience from browsing to finding the right car. Very helpful staff.', 'Ava Thompson', 'A'],
    ['I found several good options quickly and got answers to all my questions.', 'David Brooks', 'D']
  ]
];
let testimonialPage = 0;
function renderTestimonials() {
  const grid = document.querySelector('#testimonial-grid');
  grid.innerHTML = testimonials[testimonialPage].map(([quote, name, initial]) => `
    <article class="testimonial"><span class="quote">“</span><p>${quote}</p>
      <div class="person"><span class="avatar">${initial}</span><div><b>${name}</b><small>★★★★★</small></div></div>
    </article>`).join('');
}
document.querySelector('#testimonial-prev')?.addEventListener('click', () => {
  testimonialPage = (testimonialPage + testimonials.length - 1) % testimonials.length;
  renderTestimonials();
});
document.querySelector('#testimonial-next')?.addEventListener('click', () => {
  testimonialPage = (testimonialPage + 1) % testimonials.length;
  renderTestimonials();
});

// Optional live inventory integration. If the API is offline, the original sample cards remain visible.
const ANTIXOR_API = 'http://localhost:5000/api';
function escapeVehicleText(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function vehicleImageUrl(url) {
  if (!url) return 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=80';
  return url.startsWith('/uploads/') ? `http://localhost:5000${url}` : url;
}
function renderLiveVehicles(vehicles) {
  const grid = document.querySelector('.car-grid');
  if (!grid || !Array.isArray(vehicles)) return;
  if (!vehicles.length) { grid.innerHTML = '<p style="color:#fff">No vehicles match your search. Try a different filter.</p>'; return; }
  grid.innerHTML = vehicles.map(vehicle => {
    const name = `${escapeVehicleText(vehicle.brand)} ${escapeVehicleText(vehicle.model)}`;
    const price = Number(vehicle.price || 0).toLocaleString(undefined, {style:'currency',currency:'USD',maximumFractionDigits:0});
    return `<article class="car-card" data-brand="${escapeVehicleText(vehicle.brand)}"><div class="car-image" style="background-image:url('${escapeVehicleText(vehicleImageUrl(vehicle.image_url))}')"><span class="pill">${vehicle.featured ? 'Featured' : 'Available'}</span><button class="heart" aria-label="Save ${name}">♡</button></div><div class="car-info"><h3>${name}</h3><p class="car-meta">${escapeVehicleText(vehicle.year)} <span>•</span> ${Number(vehicle.mileage || 0).toLocaleString()} mi <span>•</span> ${escapeVehicleText(vehicle.transmission || 'Automatic')}</p><div class="car-bottom"><strong>${price}</strong><a href="car-details.html?id=${encodeURIComponent(vehicle.id)}">View Details ↗</a></div><div class="car-tags"><span>${escapeVehicleText(vehicle.category || 'Vehicle')}</span><span>${escapeVehicleText(vehicle.fuel_type || 'Fuel')}</span><span>${escapeVehicleText(vehicle.status || 'available')}</span></div></div></article>`;
  }).join('');
  grid.querySelectorAll('.heart').forEach(button => button.addEventListener('click', () => { const saved = button.classList.toggle('saved'); button.textContent = saved ? '♥' : '♡'; button.setAttribute('aria-pressed', String(saved)); }));
  grid.querySelectorAll('[data-enquire-vehicle]').forEach(link => link.addEventListener('click', () => {
    const vehicle = vehicles.find(item => String(item.id) === link.dataset.enquireVehicle);
    if (vehicle) sessionStorage.setItem('antixor_enquiry_vehicle', `${vehicle.brand} ${vehicle.model} (ID ${vehicle.id})`);
  }));
}
async function fetchLiveVehicles() {
  try {
    const response = await fetch(`${ANTIXOR_API}/vehicles?limit=100`);
    if (!response.ok) return;
    const data = await response.json();
    renderLiveVehicles(data.vehicles);
  } catch (_error) { /* Keep screenshot-inspired sample inventory if API is not running. */ }
}
fetchLiveVehicles();
document.querySelector('#car-search')?.addEventListener('submit', async event => {
  event.preventDefault();
  if (document.querySelector('.tab.active')?.dataset.mode === 'sell') return;
  const brand = document.querySelector('#brand-filter')?.value || '';
  const feedback = document.querySelector('#search-feedback');
  try {
    const response = await fetch(`${ANTIXOR_API}/vehicles?limit=100${brand ? `&brand=${encodeURIComponent(brand)}` : ''}`);
    if (!response.ok) return;
    const data = await response.json();
    renderLiveVehicles(data.vehicles);
    if (feedback) feedback.textContent = `${data.vehicles.length} vehicle${data.vehicles.length === 1 ? '' : 's'} found in the live inventory.`;
  } catch (_error) { /* The existing client-side sample filter still works without the backend. */ }
});

// Submit customer enquiries to the Express API.
document.querySelector('#public-enquiry-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const feedback = document.querySelector('#public-enquiry-feedback');
  const fields = Object.fromEntries(new FormData(form).entries());
  const selectedVehicle = sessionStorage.getItem('antixor_enquiry_vehicle');
  if (selectedVehicle && !fields.message.includes(selectedVehicle)) fields.message = `Vehicle of interest: ${selectedVehicle}\n\n${fields.message}`;
  feedback.textContent = 'Sending your enquiry…';
  try {
    const response = await fetch(`${ANTIXOR_API}/enquiries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Could not send enquiry.');
    feedback.textContent = 'Enquiry sent successfully. Our team will be in touch.';
    form.reset(); sessionStorage.removeItem('antixor_enquiry_vehicle');
  } catch (error) {
    feedback.textContent = `Unable to send right now. Make sure the backend is running. ${error.message}`;
  }
});


// Financing page: simple budget guidance helper
const budgetButton = document.querySelector('#budget-check');
budgetButton?.addEventListener('click', () => {
  const amount = Number(document.querySelector('#budget-input')?.value || 0);
  const result = document.querySelector('#budget-result');
  if (!amount || amount < 0) { result.textContent = 'Please enter a valid budget amount.'; return; }
  result.textContent = `Your stated budget is ${amount.toLocaleString()}. Contact us to discuss vehicles and payment options in this range.`;
});

// Make the search tabs navigate to the appropriate dedicated workflow.
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    if (tab.dataset.mode === 'sell') window.location.href = 'sell.html#sell-listing-form';
    else if (!location.pathname.endsWith('cars.html')) window.location.href = 'cars.html';
  });
});

// Honour brand links from the brand-logo grid.
const requestedBrand = new URLSearchParams(window.location.search).get('brand');
if (requestedBrand) {
  const brandSelect = document.querySelector('#brand-filter');
  if (brandSelect) {
    const option = [...brandSelect.options].find(o => o.value.toLowerCase() === requestedBrand.toLowerCase() || o.text.toLowerCase() === requestedBrand.toLowerCase());
    if (option) { brandSelect.value = option.value; }
  }
  document.querySelectorAll('.car-card').forEach(card => { card.hidden = card.dataset.brand.toLowerCase() !== requestedBrand.toLowerCase(); });
  const feedback = document.querySelector('#search-feedback');
  if (feedback) feedback.textContent = `Showing vehicles from ${requestedBrand}.`;
}

// Dedicated car details page: supports both sample cars and database-backed vehicles.
const detailRoot = document.querySelector('#car-details-content');
if (detailRoot) {
  const carKey = new URLSearchParams(window.location.search).get('car');
  const liveId = new URLSearchParams(window.location.search).get('id');
  const sampleCars = {
    'mercedes-gle-350': {brand:'Mercedes-Benz',model:'GLE 350',year:2022,mileage:18500,transmission:'Automatic',fuel_type:'Diesel',price:68000,category:'Luxury SUV',image:'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=85',condition:'Excellent',description:'A premium SUV with a refined cabin, comfortable ride and practical space for everyday driving and longer journeys.'},
    'porsche-911-carrera': {brand:'Porsche',model:'911 Carrera',year:2023,mileage:7200,transmission:'Automatic',fuel_type:'Petrol',price:125000,category:'Sports car',image:'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85',condition:'Excellent',description:'An iconic sports car focused on performance, responsive handling and a driver-first interior.'},
    'range-rover-evoque': {brand:'Range Rover',model:'Evoque',year:2021,mileage:24000,transmission:'Automatic',fuel_type:'Petrol',price:56600,category:'Luxury SUV',image:'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1200&q=85',condition:'Very good',description:'A stylish compact luxury SUV with elevated seating, versatile storage and a confident road presence.'},
    'bmw-5-series': {brand:'BMW',model:'5 Series',year:2023,mileage:12000,transmission:'Automatic',fuel_type:'Diesel',price:62000,category:'Executive sedan',image:'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=85',condition:'Excellent',description:'An executive sedan combining comfort, technology and engaging road manners for daily use.'}
  };
  const escapeDetail = value => String(value ?? 'Not specified').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const renderDetail = car => {
    const name = `${car.brand || ''} ${car.model || ''}`.trim();
    const price = Number(car.price || 0).toLocaleString(undefined,{style:'currency',currency:'USD',maximumFractionDigits:0});
    const image = car.image_url ? vehicleImageUrl(car.image_url) : (car.image || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85');
    detailRoot.innerHTML = `<div class="details-layout"><div class="details-photo" role="img" aria-label="${escapeDetail(name)}" style="background-image:url('${escapeDetail(image)}')"></div><section class="details-panel"><p class="eyebrow orange-text">VEHICLE DETAILS</p><h1>${escapeDetail(name)}</h1><p class="muted">${escapeDetail(car.year)} · ${Number(car.mileage||0).toLocaleString()} miles · ${escapeDetail(car.category||'Vehicle')}</p><div class="details-price">${price}</div><div class="spec-grid"><div class="spec"><small>Year</small><b>${escapeDetail(car.year)}</b></div><div class="spec"><small>Mileage</small><b>${Number(car.mileage||0).toLocaleString()} mi</b></div><div class="spec"><small>Transmission</small><b>${escapeDetail(car.transmission||'Automatic')}</b></div><div class="spec"><small>Fuel type</small><b>${escapeDetail(car.fuel_type||'Not specified')}</b></div><div class="spec"><small>Vehicle type</small><b>${escapeDetail(car.category||'Car')}</b></div><div class="spec"><small>Condition</small><b>${escapeDetail(car.condition||'Contact us')}</b></div></div><div class="details-actions"><a class="btn btn-orange" href="contact.html?vehicle=${encodeURIComponent(name)}">Enquire About This Car ↗</a><a class="btn btn-dark" href="cars.html">Back to Cars</a></div><p class="details-description">${escapeDetail(car.description||'Contact our team for more information, service history, viewing arrangements and availability.')}</p></section></div>`;
    document.title = `${name} | Lil-Mosey Car Dealers`;
  };
  if (liveId) {
    fetch(`${ANTIXOR_API}/vehicles/${encodeURIComponent(liveId)}`).then(r=>{if(!r.ok) throw new Error('Vehicle not found');return r.json()}).then(data=>renderDetail(data.vehicle||data)).catch(()=>{detailRoot.innerHTML='<h2>Vehicle not found</h2><p>It may have been removed from inventory. <a href="cars.html">Browse available cars</a>.</p>';});
  } else if (sampleCars[carKey]) renderDetail(sampleCars[carKey]);
  else { detailRoot.innerHTML = '<h2>Choose a vehicle</h2><p>Select a car from the <a href="cars.html">car inventory</a> to see its details.</p>'; }
}

// Seller listing form supports image preview and sends the car details to the backend.
const sellForm = document.querySelector('#sell-listing-form');
const photoInput = document.querySelector('#sell-car-photo');
const photoPreview = document.querySelector('#sell-photo-preview');
photoInput?.addEventListener('change', () => {
  const file = photoInput.files?.[0];
  if (!file) { photoPreview.hidden = true; photoPreview.removeAttribute('src'); return; }
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
    photoInput.value = ''; photoPreview.hidden = true;
    document.querySelector('#public-enquiry-feedback').textContent = 'Please choose a JPG, PNG or WEBP image smaller than 5 MB.'; return;
  }
  photoPreview.src = URL.createObjectURL(file); photoPreview.hidden = false;
});
sellForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const feedback = document.querySelector('#public-enquiry-feedback');
  const data = new FormData(sellForm);
  const brand = data.get('brand'), model = data.get('model');
  data.set('message', `SELLER LISTING REQUEST: ${brand} ${model}. Year: ${data.get('year')}; expected price: ${data.get('price')}; mileage: ${data.get('mileage')||'not provided'}; transmission: ${data.get('transmission')}; fuel: ${data.get('fuel_type')}. Description: ${data.get('message')}`);
  feedback.textContent = 'Submitting your vehicle details…';
  try {
    const response = await fetch(`${ANTIXOR_API}/enquiries`, {method:'POST', body:data});
    const result = await response.json().catch(()=>({}));
    if (!response.ok) throw new Error(result.message || 'The server could not accept the listing.');
    feedback.textContent = 'Your car details have been submitted successfully. Our team will contact you by email or phone.';
    sellForm.reset(); photoPreview.hidden = true; photoPreview.removeAttribute('src');
  } catch (error) {
    feedback.textContent = `Could not submit online. Check that the backend and MySQL are running, then try again. ${error.message}`;
  }
});

// Carry the selected vehicle into the contact form.
const contactVehicle = new URLSearchParams(window.location.search).get('vehicle');
if (contactVehicle) {
  const messageField = document.querySelector('#public-enquiry-form [name="message"]');
  if (messageField && !messageField.value) messageField.value = `I would like to enquire about: ${contactVehicle}. Please contact me with more details.`;
}

const requestedCategory = new URLSearchParams(window.location.search).get('category');
if (requestedCategory) {
  const cardMatchesCategory = card => {
    const text = `${card.querySelector('h3')?.textContent || ''} ${card.querySelector('.car-tags')?.textContent || ''}`.toLowerCase();
    if (requestedCategory === 'suv') return /suv|rover|gle/.test(text);
    if (requestedCategory === 'sports') return /porsche|sports|911/.test(text);
    if (requestedCategory === 'sedan') return /sedan|series|bmw/.test(text);
    if (requestedCategory === 'truck') return /truck|pickup/.test(text);
    if (requestedCategory === 'electric') return /electric|ev|hybrid/.test(text);
    return true;
  };
  document.querySelectorAll('.car-card').forEach(card => card.hidden = !cardMatchesCategory(card));
  const feedback = document.querySelector('#search-feedback');
  if (feedback) feedback.textContent = `Showing vehicles matching the ${requestedCategory} category.`;
}
