const API = '';
let state = { patients: [], doctors: [], appointments: [], applications: [], records: [], messages: [], billing: [], inventory: [], audit: [], reports: {} };

let prevPendingApps = null;
async function loadAll() {
  const [patients, doctors, appointments, applications, records, messages, billing, inventory, audit, reports] = await Promise.all([
    fetch(`${API}/api/patients`).then(r => r.json()),
    fetch(`${API}/api/doctors`).then(r => r.json()),
    fetch(`${API}/api/appointments`).then(r => r.json()),
    fetch(`${API}/api/applications`).then(r => r.json()),
    fetch(`${API}/api/records`).then(r => r.json()),
    fetch(`${API}/api/messages`).then(r => r.json()),
    fetch(`${API}/api/billing`).then(r => r.json()),
    fetch(`${API}/api/inventory`).then(r => r.json()),
    fetch(`${API}/api/audit-log`).then(r => r.json()),
    fetch(`${API}/api/reports`).then(r => r.json()),
  ]);
  state = { patients, doctors, appointments, applications, records, messages, billing, inventory, audit, reports };
  renderAll();
  const counts = { patients: state.patients.length, doctors: state.doctors.length, appts: state.appointments.length, apps: state.applications.filter(a => a.status === 'pending').length, records: state.records.length };
  document.getElementById('badgePatients').textContent = counts.patients;
  document.getElementById('badgeDoctors').textContent = counts.doctors;
  document.getElementById('badgeAppts').textContent = counts.appts;
  document.getElementById('badgeApps').textContent = counts.apps;
  document.getElementById('badgeRecords').textContent = counts.records;
  const badgeMessages = document.getElementById('badgeMessages');
  if (badgeMessages) badgeMessages.textContent = state.messages.length;

  // Toast when a new pending application arrives
  if (prevPendingApps !== null && counts.apps > prevPendingApps) {
    const toast = document.getElementById('toast');
    toast.textContent = `🔔 ${counts.apps - prevPendingApps} new doctor application(s) received!`;
    toast.style.display = 'block';
    clearTimeout(toast._hide);
    toast._hide = setTimeout(() => (toast.style.display = 'none'), 5000);
  }
  prevPendingApps = counts.apps;
}

// ---------- Navigation ----------
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.tagName === 'A') return; // allow real page links
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.view).classList.add('active');
  });
});

// ---------- Dashboard ----------
function renderDashboard() {
  document.getElementById('statPatients').textContent = state.patients.length;
  document.getElementById('statDoctors').textContent = state.doctors.length;
  document.getElementById('statAppointments').textContent = state.appointments.length;
  document.getElementById('statAdmitted').textContent =
    state.patients.filter(p => p.status === 'Admitted').length;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('upcomingBody').innerHTML = state.appointments
    .filter(a => a.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 5)
    .map(a => `<tr><td>${a.patient}</td><td>${a.doctor}</td><td>${a.date}</td><td>${a.time}</td></tr>`)
    .join('') || '<tr><td colspan="4">No upcoming appointments</td></tr>';
}

// ---------- Patients ----------
function renderPatients() {
  const q = (document.getElementById('pSearch')?.value || '').toLowerCase();
  const f = document.getElementById('pFilter')?.value || '';
  const s = document.getElementById('pSort')?.value || '';
  let rows = state.patients
    .filter(p => (f === '' || p.status === f))
    .filter(p => (p.name + ' ' + p.disease + ' ' + (p.status || '')).toLowerCase().includes(q));
  if (s === 'name') rows.sort((a,b) => a.name.localeCompare(b.name));
  if (s === 'age') rows.sort((a,b) => a.age - b.age);
  if (s === 'status') rows.sort((a,b) => a.status.localeCompare(b.status));
  document.getElementById('patientBody').innerHTML = rows.map(p => `
    <tr>
      <td>${p.name}</td><td>${p.age}</td><td>${p.gender}</td>
      <td>${p.disease}</td><td>${p.status}</td>
      <td>
        <button class="edit" onclick="viewPatient(${p.id})">View</button>
        <button class="edit" onclick="editPatient(${p.id})">Edit</button>
        <button class="danger" onclick="deletePatient(${p.id})">Delete</button>
      </td>
    </tr>`).join('');
}

window.viewPatient = id => {
  const p = state.patients.find(p => p.id === id);
  if (p) alert(`Patient Profile\n\nName: ${p.name}\nAge: ${p.age}\nGender: ${p.gender}\nCondition: ${p.disease}\nStatus: ${p.status}`);
};

if (document.getElementById('pSearch')) document.getElementById('pSearch').addEventListener('input', renderPatients);
if (document.getElementById('pFilter')) document.getElementById('pFilter').addEventListener('change', renderPatients);
if (document.getElementById('pSort')) document.getElementById('pSort').addEventListener('change', renderPatients);

document.getElementById('patientForm').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('patientId').value;
  const patient = {
    name: document.getElementById('pName').value.trim(),
    age: document.getElementById('pAge').value,
    gender: document.getElementById('pGender').value,
    disease: document.getElementById('pDisease').value.trim(),
    status: document.getElementById('pStatus').value,
  };
  if (id) {
    await fetch(`${API}/api/patients/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patient) });
  } else {
    await fetch(`${API}/api/patients`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patient) });
  }
  e.target.reset();
  document.getElementById('patientId').value = '';
  loadAll();
});

document.getElementById('cancelPatient').addEventListener('click', () => {
  document.getElementById('patientForm').reset();
  document.getElementById('patientId').value = '';
});

window.editPatient = id => {
  const p = state.patients.find(p => p.id === id);
  if (!p) return;
  document.getElementById('patientId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pAge').value = p.age;
  document.getElementById('pGender').value = p.gender;
  document.getElementById('pDisease').value = p.disease;
  document.getElementById('pStatus').value = p.status;
};

window.deletePatient = async id => {
  await fetch(`${API}/api/patients/${id}`, { method: 'DELETE' });
  loadAll();
};

// ---------- Doctors ----------
function renderDoctors() {
  document.getElementById('doctorList').innerHTML = state.doctors.map(d => `
    <div class="doctor-card">
      <img src="${d.photo || 'images/hero.jpg'}" alt="${d.name}" style="width:100%;height:140px;object-fit:cover;border-radius:10px;margin-bottom:8px;" />
      <h4>${d.name}</h4>
      <p><strong>Specialization:</strong> ${d.spec}</p>
      <p><strong>Phone:</strong> ${d.phone}</p>
      <p>⭐ ${d.rating ?? '4.5'} · 🕐 ${d.available || 'Mon-Fri 09:00-17:00'}</p>
      <button class="danger" style="margin-top:8px" onclick="deleteDoctor(${d.id})">Remove</button>
    </div>`).join('');
  document.getElementById('aDoctor').innerHTML = state.doctors
    .map(d => `<option value="${d.name}">${d.name} (${d.spec})</option>`).join('');
}

document.getElementById('doctorForm').addEventListener('submit', async e => {
  e.preventDefault();
  const photoFile = document.getElementById('dPhoto').files[0];
  const toBase64 = f => new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(f);
  });
  const photo = photoFile ? await toBase64(photoFile) : undefined;
  await fetch(`${API}/api/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('dName').value.trim(),
      spec: document.getElementById('dSpec').value.trim(),
      phone: document.getElementById('dPhone').value.trim(),
      rating: document.getElementById('dRating').value,
      available: document.getElementById('dAvailable').value.trim() || 'Mon-Fri 09:00-17:00',
      photo,
    }),
  });
  e.target.reset();
  loadAll();
});

window.deleteDoctor = async id => {
  await fetch(`${API}/api/doctors/${id}`, { method: 'DELETE' });
  loadAll();
};

// ---------- Appointments ----------
function renderAppointments() {
  document.getElementById('apptBody').innerHTML = state.appointments.map(a => `
    <tr>
      <td>${a.patient}</td><td>${a.doctor}</td><td>${a.date}</td><td>${a.time}</td>
      <td><button class="danger" onclick="deleteAppt(${a.id})">Cancel</button></td>
    </tr>`).join('');
}

document.getElementById('apptForm').addEventListener('submit', async e => {
  e.preventDefault();
  await fetch(`${API}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient: document.getElementById('aPatient').value.trim(),
      doctor: document.getElementById('aDoctor').value,
      date: document.getElementById('aDate').value,
      time: document.getElementById('aTime').value,
    }),
  });
  e.target.reset();
  loadAll();
});

window.deleteAppt = async id => {
  await fetch(`${API}/api/appointments/${id}`, { method: 'DELETE' });
  loadAll();
};

// ---------- Doctor Applications ----------
function renderApplications() {
  document.getElementById('appBody').innerHTML = state.applications.map(a => `
    <tr>
      <td>${a.name}</td><td>${a.spec}</td><td>${a.phone || '-'}</td>
      <td>${a.email || '-'}</td><td>${a.experience || '-'}</td>
      <td>${a.status}</td>
      <td>
        ${a.status === 'pending' ? `<button class="edit" onclick="approveApp(${a.id})">Approve</button>
        <button class="danger" onclick="rejectApp(${a.id})">Reject</button>` : ''}
        <button class="danger" onclick="deleteApp(${a.id})">Delete</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="7">No applications yet.</td></tr>';
}

window.approveApp = async id => {
  await fetch(`${API}/api/applications/${id}/approve`, { method: 'POST' });
  alert('Doctor approved and added to the Doctors list.');
  loadAll();
};

window.rejectApp = async id => {
  await fetch(`${API}/api/applications/${id}/reject`, { method: 'POST' });
  loadAll();
};

window.deleteApp = async id => {
  await fetch(`${API}/api/applications/${id}`, { method: 'DELETE' });
  loadAll();
};

// ---------- Hospital Records ----------
function renderRecords() {
  document.getElementById('recordsBody').innerHTML = state.records.map(r => `
    <tr>
      <td>${r.patient_name}</td><td>${r.department}</td><td>${r.doctor}</td>
      <td>${r.diagnosis}</td><td>${r.treatment}</td>
      <td>${new Date(r.admission_date).toLocaleDateString()}</td><td>${r.status}</td>
      <td><button class="danger" onclick="deleteRecord(${r.id})">Delete</button></td>
    </tr>`).join('') || '<tr><td colspan="8">No records.</td></tr>';
}

document.getElementById('recordForm').addEventListener('submit', async e => {
  e.preventDefault();
  await fetch(`${API}/api/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient_name: document.getElementById('rPatient').value.trim(),
      department: document.getElementById('rDept').value.trim(),
      doctor: document.getElementById('rDoctor').value.trim(),
      diagnosis: document.getElementById('rDiagnosis').value.trim(),
      treatment: document.getElementById('rTreatment').value.trim(),
      admission_date: document.getElementById('rDate').value,
      status: document.getElementById('rStatus').value,
    }),
  });
  e.target.reset();
  loadAll();
});

window.deleteRecord = async id => {
  await fetch(`${API}/api/records/${id}`, { method: 'DELETE' });
  loadAll();
};

// ---------- Messages ----------
function renderMessages() {
  document.getElementById('messagesBody').innerHTML = state.messages.map(m => `
    <tr>
      <td>${m.name}</td><td>${m.email}</td><td>${m.subject}</td>
      <td>${m.message}</td><td>${new Date(m.created_at).toLocaleString()}</td>
      <td><button class="danger" onclick="deleteMessage(${m.id})">Delete</button></td>
    </tr>`).join('') || '<tr><td colspan="6">No messages yet.</td></tr>';
}

window.deleteMessage = async id => {
  await fetch(`${API}/api/messages/${id}`, { method: 'DELETE' });
  loadAll();
};

// ---------- Billing ----------
function renderBilling() {
  document.getElementById('billingBody').innerHTML = state.billing.map(b => `
    <tr>
      <td>${b.patient}</td><td>${b.department}</td><td>$${b.amount}</td>
      <td>${b.status}</td><td>${new Date(b.created_at).toLocaleDateString()}</td>
      <td><button class="danger" onclick="deleteBilling(${b.id})">Delete</button></td>
    </tr>`).join('') || '<tr><td colspan="6">No invoices.</td></tr>';
}

document.getElementById('billingForm').addEventListener('submit', async e => {
  e.preventDefault();
  await fetch(`${API}/api/billing`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patient: document.getElementById('bPatient').value.trim(),
      department: document.getElementById('bDept').value.trim(),
      amount: document.getElementById('bAmount').value,
      status: document.getElementById('bStatus').value,
    }),
  });
  e.target.reset(); loadAll();
});

window.deleteBilling = async id => { await fetch(`${API}/api/billing/${id}`, { method: 'DELETE' }); loadAll(); };

// ---------- Inventory ----------
function renderInventory() {
  document.getElementById('inventoryBody').innerHTML = state.inventory.map(i => `
    <tr>
      <td>${i.item}</td><td>${i.quantity}</td><td>${new Date(i.expiry).toLocaleDateString()}</td>
      <td><button class="danger" onclick="deleteInventory(${i.id})">Delete</button></td>
    </tr>`).join('') || '<tr><td colspan="4">No items.</td></tr>';
}

document.getElementById('inventoryForm').addEventListener('submit', async e => {
  e.preventDefault();
  await fetch(`${API}/api/inventory`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      item: document.getElementById('iItem').value.trim(),
      quantity: document.getElementById('iQty').value,
      expiry: document.getElementById('iExpiry').value,
    }),
  });
  e.target.reset(); loadAll();
});

window.deleteInventory = async id => { await fetch(`${API}/api/inventory/${id}`, { method: 'DELETE' }); loadAll(); };

// ---------- Reports ----------
function renderReports() {
  const r = state.reports || {};
  document.getElementById('reportStats').innerHTML = `
    <div class="stat-card"><h3>$${r.revenue ?? 0}</h3><p>Revenue</p></div>
    <div class="stat-card"><h3>${r.pending_due ?? 0}</h3><p>Pending Dues</p></div>
    <div class="stat-card"><h3>${r.admitted_patients ?? 0}</h3><p>Admitted Patients</p></div>
    <div class="stat-card"><h3>${r.low_stock_items ?? 0}</h3><p>Low-Stock Items</p></div>`;
}

// ---------- Audit ----------
function renderAudit() {
  document.getElementById('auditBody').innerHTML = state.audit.map(a => `
    <tr>
      <td>${a.user}</td><td>${a.action}</td><td>${new Date(a.created_at).toLocaleString()}</td>
    </tr>`).join('') || '<tr><td colspan="3">No audit entries.</td></tr>';
}

// ---------- Init ----------
function renderAll() {
  renderDashboard();
  renderPatients();
  renderDoctors();
  renderAppointments();
  renderApplications();
  renderRecords();
  renderMessages();
  renderBilling();
  renderInventory();
  renderReports();
  renderAudit();
}
loadAll();
