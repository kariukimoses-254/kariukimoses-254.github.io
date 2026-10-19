/* Lil Mosey Hospital - shared doctor data + photo helpers
   The public pages (doctors.html, appointments.html) and the staff dashboard all
   read the roster the same way: try the API first, fall back to the built-in
   demo roster so the site still works on static hosting (GitHub Pages). */
(function () {
  'use strict';

  var demoDoctors = [
    {
      id: 1,
      name: 'Dr. James Mwangi',
      spec: 'Cardiology',
      qualification: 'MBBS, MMed (Cardiology)',
      experience: '14 years',
      email: 'j.mwangi@lilmosey.example.com',
      phone: '+254 700 100 101',
      available: 'Mon-Fri, 08:00 - 16:00',
      languages: 'English, Kiswahili',
      bio: 'Interventional cardiologist leading the cath-lab team. Special interest in heart failure and preventive cardiology.',
      photo: 'images/doctor1.jpg',
      rating: 4.8,
      patient_rating: 4.7
    },
    {
      id: 2,
      name: 'Dr. Aisha Patel',
      spec: 'Pediatrics',
      qualification: 'MBBS, DCH (Child Health)',
      experience: '11 years',
      email: 'a.patel@lilmosey.example.com',
      phone: '+254 700 100 102',
      available: 'Mon-Sat, 09:00 - 17:00',
      languages: 'English, Kiswahili, Gujarati',
      bio: 'Paediatrician and newborn care lead. Runs the immunisation clinic and the child growth monitoring programme.',
      photo: 'images/doctor2.jpg',
      rating: 4.9,
      patient_rating: 4.8
    },
    {
      id: 3,
      name: 'Dr. David Lee',
      spec: 'Orthopedics',
      qualification: 'MBBS, MMed (Orthopaedic Surgery)',
      experience: '9 years',
      email: 'd.lee@lilmosey.example.com',
      phone: '+254 700 100 103',
      available: 'Tue-Sat, 08:30 - 16:30',
      languages: 'English, Mandarin',
      bio: 'Orthopaedic surgeon covering joint replacement, sports injuries and fracture care, with a same-week trauma list.',
      photo: 'images/doctor3.jpg',
      rating: 4.6,
      patient_rating: 4.5
    },
    {
      id: 4,
      name: 'Dr. Elena Garcia',
      spec: 'Neurology',
      qualification: 'MBBS, MMed (Neurology)',
      experience: '12 years',
      email: 'e.garcia@lilmosey.example.com',
      phone: '+254 700 100 104',
      available: 'Mon-Fri, 10:00 - 18:00',
      languages: 'English, Spanish, Kiswahili',
      bio: 'Neurologist running the stroke and epilepsy clinics, with a focus on headache disorders and nerve conduction studies.',
      photo: 'images/doctor4.jpg',
      rating: 4.7,
      patient_rating: 4.6
    },
    {
      id: 5,
      name: 'Dr. Grace Wanjiru',
      spec: 'Dentistry',
      qualification: 'BDS (Dental Surgery)',
      experience: '7 years',
      email: 'g.wanjiru@lilmosey.example.com',
      phone: '+254 700 100 105',
      available: 'Mon-Fri, 09:00 - 17:00',
      languages: 'English, Kiswahili',
      bio: 'Dental surgeon offering preventive dentistry, root canal treatment and cosmetic restorations for adults and children.',
      photo: null,
      rating: 4.5,
      patient_rating: 4.4
    },
    {
      id: 6,
      name: 'Dr. Samuel Otieno',
      spec: 'Emergency Medicine',
      qualification: 'MBBS, ATLS, ACLS',
      experience: '10 years',
      email: 's.otieno@lilmosey.example.com',
      phone: '+254 700 100 106',
      available: '24/7 on-call rota',
      languages: 'English, Kiswahili, Dholuo',
      bio: 'Emergency physician and ambulance coordinator handling trauma, resuscitation and acute admissions at the casualty desk.',
      photo: null,
      rating: 4.8,
      patient_rating: 4.9
    }
  ];

  /* Coloured initials avatar used when a doctor has no photo on file. */
  function avatar(name) {
    var clean = String(name || 'Doctor').replace(/^(Dr\.?|Prof\.?)\s*/i, '').trim();
    var initials = clean.split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase() || 'DR';
    var palette = ['#087EA4', '#12a8b9', '#0f766e', '#7c3aed', '#b45309', '#be185d', '#1d4ed8'];
    var sum = 0;
    for (var i = 0; i < clean.length; i++) sum += clean.charCodeAt(i);
    var bg = palette[sum % palette.length];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">' +
      '<rect width="300" height="200" fill="' + bg + '"/>' +
      '<circle cx="150" cy="86" r="44" fill="rgba(255,255,255,.22)"/>' +
      '<text x="150" y="104" font-family="Segoe UI,Arial,sans-serif" font-size="56" font-weight="700" fill="#ffffff" text-anchor="middle">' + initials + '</text>' +
      '<rect x="0" y="160" width="300" height="40" fill="rgba(0,0,0,.18)"/>' +
      '<text x="150" y="187" font-family="Segoe UI,Arial,sans-serif" font-size="20" fill="#ffffff" text-anchor="middle">' + escapeXml(clean) + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function escapeXml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  /* A photo path/URL when the doctor has one, otherwise their initials avatar. */
  function photoFor(d) {
    var photo = d && d.photo ? String(d.photo) : '';
    if (!photo || photo === 'images/hero.jpg') return avatar(d && d.name);
    return photo;
  }

  var live = false;

  /* API first, built-in roster as the offline / static-demo fallback. */
  function load() {
    return fetch('/api/doctors', { headers: { Accept: 'application/json' } })
      .then(function (res) {
        var type = (res.headers.get('content-type') || '').toLowerCase();
        if (!res.ok || type.indexOf('json') === -1) throw new Error('API unavailable');
        return res.json();
      })
      .then(function (rows) {
        if (Array.isArray(rows) && rows.length) {
          live = true;
          return rows;
        }
        live = false;
        return demoDoctors.slice();
      })
      .catch(function () {
        live = false;
        return demoDoctors.slice();
      });
  }

  window.HospitalDoctors = {
    demo: demoDoctors,
    load: load,
    avatar: avatar,
    photoFor: photoFor,
    isLive: function () { return live; }
  };
})();
