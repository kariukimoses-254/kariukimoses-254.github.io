const API = 'http://localhost:5000/api';
const $ = selector => document.querySelector(selector);
let token = sessionStorage.getItem('antixor_admin_token') || '';
let inventory = [];
let enquiries = [];
const money = value => Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
async function request(url, options = {}) {
  const headers = { ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const response = await fetch(`${API}${url}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}
function showDashboard() { $('#login-panel').hidden = true; $('#dashboard').hidden = false; $('#logout').hidden = false; loadDashboard(); }
function showLogin() { $('#login-panel').hidden = false; $('#dashboard').hidden = true; $('#logout').hidden = true; }
function openTab(id) {
  document.querySelectorAll('.dash-section').forEach(section => section.hidden = section.id !== id);
  document.querySelectorAll('.dash-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.tab === id));
}
document.querySelectorAll('.dash-tab').forEach(button => button.addEventListener('click', () => openTab(button.dataset.tab)));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => openTab(button.dataset.go)));
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault(); $('#login-message').textContent = 'Signing in…';
  const form = new FormData(event.currentTarget);
  try {
    const result = await request('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.get('email'), password: form.get('password') }) });
    if (result.user.role !== 'admin') throw new Error('This account is not an administrator.');
    token = result.token; sessionStorage.setItem('antixor_admin_token', token); $('#login-message').textContent = ''; showDashboard();
  } catch (error) { $('#login-message').textContent = error.message; }
});
$('#logout').addEventListener('click', () => { token = ''; sessionStorage.removeItem('antixor_admin_token'); showLogin(); });
$('#refresh').addEventListener('click', loadDashboard);
async function loadDashboard() {
  try {
    const [stats, vehicles, enquiryData] = await Promise.all([request('/admin/stats'), request('/admin/vehicles'), request('/enquiries')]);
    $('#total-vehicles').textContent = stats.total_vehicles ?? 0;
    $('#available-vehicles').textContent = stats.available_vehicles ?? 0;
    $('#total-users').textContent = stats.total_users ?? 0;
    $('#total-enquiries').textContent = stats.total_enquiries ?? 0;
    inventory = vehicles.vehicles || [];
    enquiries = enquiryData.enquiries || [];
    renderInventory(inventory); renderEnquiries(enquiries); renderSellers(enquiries); renderRecentEnquiries(enquiries);
  } catch (error) {
    if (/token|auth|administrator|expired/i.test(error.message)) { $('#login-message').textContent = error.message; token = ''; sessionStorage.removeItem('antixor_admin_token'); showLogin(); }
    else alert(`${error.message}\n\nCheck that the backend is running and MySQL is connected.`);
  }
}
function renderInventory(items) {
  $('#inventory-body').innerHTML = items.length ? items.map(v => `<tr><td><strong>${escapeHtml(v.brand)} ${escapeHtml(v.model)}</strong><br>${escapeHtml(v.year)}</td><td>${money(v.price)}</td><td><span class="status status-${escapeHtml(v.status)}">${escapeHtml(v.status)}</span></td><td><button class="table-action" data-edit="${v.id}">Edit</button> <button class="table-action danger" data-delete="${v.id}">Delete</button></td></tr>`).join('') : '<tr><td colspan="4">No vehicles found.</td></tr>';
}
function renderEnquiries(items) {
  const query = ($('#enquiry-search')?.value || '').toLowerCase();
  const filtered = items.filter(e => `${e.full_name} ${e.email} ${e.phone || ''} ${e.message} ${e.brand || ''} ${e.model || ''}`.toLowerCase().includes(query));
  $('#enquiry-body').innerHTML = filtered.length ? filtered.map(e => `<tr><td><strong>${escapeHtml(e.full_name)}</strong><br><a href="mailto:${encodeURIComponent(e.email)}">${escapeHtml(e.email)}</a>${e.phone ? `<br><a href="tel:${escapeHtml(e.phone)}">${escapeHtml(e.phone)}</a>` : ''}</td><td>${escapeHtml((e.brand || '') + ' ' + (e.model || ''))}<br>${escapeHtml(e.message)}</td><td>${new Date(e.created_at).toLocaleString()}</td><td><select class="status-select" data-status-id="${e.id}"><option value="new" ${e.status === 'new' ? 'selected' : ''}>New</option><option value="in_progress" ${e.status === 'in_progress' ? 'selected' : ''}>In progress</option><option value="resolved" ${e.status === 'resolved' ? 'selected' : ''}>Resolved</option></select></td><td><button class="table-action" data-save-status="${e.id}">Save</button></td></tr>`).join('') : '<tr><td colspan="5">No enquiries found.</td></tr>';
}
function renderRecentEnquiries(items) {
  const recent = items.slice(0, 5);
  $('#recent-enquiries').innerHTML = recent.length ? recent.map(e => `<article class="enquiry"><strong>${escapeHtml(e.full_name)} — ${escapeHtml(e.email)}</strong><p>${escapeHtml(e.brand || '')} ${escapeHtml(e.model || '')}</p><p>${escapeHtml(e.message)}</p><small>${new Date(e.created_at).toLocaleString()} · ${escapeHtml(e.status || 'new')}</small></article>`).join('') : 'No enquiries yet.';
}
function renderSellers(items) {
  const sellers = items.filter(e => /CAR LISTING SUBMISSION/i.test(e.message || ''));
  $('#seller-list').innerHTML = sellers.length ? sellers.map(e => {
    const details = (e.message || '').split(/CAR LISTING SUBMISSION/i)[1] || '';
    const photo = details.match(/Photo:\s*(\/uploads\/[^\s]+)/i);
    return `<article class="seller-card"><div><strong>${escapeHtml(e.full_name)}</strong><p><a href="mailto:${encodeURIComponent(e.email)}">${escapeHtml(e.email)}</a>${e.phone ? ` · <a href="tel:${escapeHtml(e.phone)}">${escapeHtml(e.phone)}</a>` : ''}</p><p>${escapeHtml(details.trim())}</p><small>Submitted ${new Date(e.created_at).toLocaleString()} · ${escapeHtml(e.status || 'new')}</small></div>${photo ? `<a href="${API.replace('/api','')}${photo[1]}" target="_blank" rel="noopener">View uploaded photo ↗</a>` : ''}</article>`;
  }).join('') : '<p>No seller submissions received yet.</p>';
}
function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
$('#inventory-search').addEventListener('input', event => { const q = event.target.value.toLowerCase(); renderInventory(inventory.filter(v => `${v.brand} ${v.model} ${v.year}`.toLowerCase().includes(q))); });
$('#enquiry-search').addEventListener('input', () => renderEnquiries(enquiries));
$('#inventory-body').addEventListener('click', async event => {
  const editId = event.target.dataset.edit; const deleteId = event.target.dataset.delete;
  if (editId) { const vehicle = inventory.find(item => String(item.id) === String(editId)); if (vehicle) fillVehicleForm(vehicle); return; }
  if (!deleteId || !confirm('Delete this vehicle listing? This cannot be undone.')) return;
  try { await request(`/vehicles/${deleteId}`, { method: 'DELETE' }); if ($('#vehicle-id').value === deleteId) resetVehicleForm(); await loadDashboard(); }
  catch (error) { alert(error.message); }
});
$('#enquiry-body').addEventListener('click', async event => {
  const id = event.target.dataset.saveStatus; if (!id) return;
  const select = $(`[data-status-id="${id}"]`); const button = event.target; button.disabled = true; button.textContent = 'Saving…';
  try { await request(`/enquiries/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: select.value }) }); const item = enquiries.find(e => String(e.id) === String(id)); if (item) item.status = select.value; renderRecentEnquiries(enquiries); renderSellers(enquiries); button.textContent = 'Saved'; }
  catch (error) { alert(error.message); button.textContent = 'Save'; }
  finally { button.disabled = false; }
});
function fillVehicleForm(v) {
  const form = $('#vehicle-form'); $('#vehicle-id').value = v.id;
  ['brand', 'model', 'year', 'price', 'mileage', 'category', 'transmission', 'fuel_type', 'image_url', 'description', 'status'].forEach(key => { if (form.elements[key]) form.elements[key].value = v[key] ?? ''; });
  form.elements.featured.checked = Boolean(Number(v.featured)); $('#vehicle-form-title').textContent = `Edit ${v.brand} ${v.model}`; $('#vehicle-submit').textContent = 'Save changes'; $('#vehicle-cancel').hidden = false; $('#vehicle-message').textContent = `Editing listing #${v.id}.`; form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function resetVehicleForm() { const form = $('#vehicle-form'); form.reset(); $('#vehicle-id').value = ''; $('#vehicle-form-title').textContent = 'Add a vehicle'; $('#vehicle-submit').textContent = 'Add vehicle'; $('#vehicle-cancel').hidden = true; $('#vehicle-message').textContent = ''; }
$('#vehicle-cancel').addEventListener('click', resetVehicleForm);
$('#vehicle-form').addEventListener('submit', async event => {
  event.preventDefault(); const form = event.currentTarget; const id = $('#vehicle-id').value.trim(); const data = new FormData(form); const image = data.get('image');
  if (!image || !image.name) data.delete('image'); data.delete('id'); data.set('featured', data.get('featured') === 'on' ? '1' : '0');
  $('#vehicle-message').textContent = id ? 'Saving changes…' : 'Adding vehicle…';
  try { await request(id ? `/vehicles/${id}` : '/vehicles', { method: id ? 'PUT' : 'POST', body: data }); resetVehicleForm(); $('#vehicle-message').textContent = id ? 'Vehicle updated successfully.' : 'Vehicle added successfully.'; await loadDashboard(); }
  catch (error) { $('#vehicle-message').textContent = error.message; }
});
$('#copy-email').addEventListener('click', async () => copySetting('contact-email'));
$('#copy-phone').addEventListener('click', async () => copySetting('contact-phone'));
async function copySetting(id) { const value = $(`#${id}`).value; try { await navigator.clipboard.writeText(value); alert('Copied to clipboard.'); } catch { window.prompt('Copy this value:', value); } }
if (token) showDashboard();
