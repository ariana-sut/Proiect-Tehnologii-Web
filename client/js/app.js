// ==========================================
// CONFIGURARE
// ==========================================
// Schimbă adresa serverului aici (sau definește window.LOCALGUIDE_API_ORIGIN înainte de app.js)
const API_ORIGIN = window.LOCALGUIDE_API_ORIGIN || 'http://localhost:3000';
const API_BASE_URL = `${API_ORIGIN}/api`;

// ==========================================
// 0. FUNCȚII AJUTĂTOARE
// ==========================================
const $ = (id) => document.getElementById(id);

// Escapează text venit de la utilizatori înainte de a-l pune în innerHTML (previne XSS)
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function getToken() { return localStorage.getItem('token'); }

function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

function logout(redirect = true) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (redirect) window.location.href = 'login.html';
}

// Cerere către API. Nu aruncă erori: returnează { ok, status, data }
async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  const token = getToken();
  if (token && auth) headers['Authorization'] = `Bearer ${token}`;

  let payload = body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
    let data = null;
    try { data = await res.json(); } catch { /* răspuns fără body */ }
    if (res.status === 401 && token && auth) {
      logout(); // token expirat sau invalid
    }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: { message: 'Serverul nu răspunde. Încearcă din nou mai târziu.' } };
  }
}

// backend-ul trimite erorile ca { error: "..." } (acceptăm și { message })
const errMsg = (res, fallback) => (res.data && (res.data.error || res.data.message)) || fallback;

// Pagină accesibilă doar anumitor roluri; returnează false dacă a redirecționat
function requireRole(roles) {
  const user = getUser();
  if (!getToken() || !user) {
    window.location.href = 'login.html';
    return false;
  }
  if (!roles.includes(user.role)) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Imaginile urcate vin de la server ca "/uploads/x.jpg"; le transformăm în URL complet
function assetUrl(url, fallback) {
  if (!url) return fallback;
  if (/^(https?:|data:)/i.test(url)) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

const TOUR_PLACEHOLDER = 'https://placehold.co/400x200/332E3C/ffffff?text=Foto+Tur';
const AVATAR_PLACEHOLDER = 'https://placehold.co/150x150/332E3C/ffffff?text=Ghid';

const STATUS_LABELS = {
  pending: 'în așteptare',
  confirmed: 'confirmată',
  rejected: 'refuzată',
  cancelled: 'anulată'
};

const THEME_LABELS = {
  arhitectura: 'Arhitectură',
  istorie: 'Patrimoniu istoric',
  'street-art': 'Street art',
  gastronomie: 'Gastronomie tradițională'
};

function formatDuration(hours) {
  const h = Number(hours);
  if (!h) return '-';
  return h === 1 ? '1 oră' : `${h} ore`;
}

const fmtDateTime = (d) => new Date(d).toLocaleString('ro-RO', { dateStyle: 'short', timeStyle: 'short' });

// ==========================================
// 1. NAVBAR (stare autentificare)
// ==========================================
function updateNavbarAuth() {
  const user = getUser();
  const authBtn = $('nav-auth-btn');
  const resLink = $('nav-reservations');
  const logoutBtn = $('logout-btn');

  if (user && getToken() && authBtn) {
    const initials = (user.name || '?').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase();
    authBtn.textContent = `Cont (${initials})`;

    if (user.role === 'admin') {
      authBtn.href = 'dashboard-admin.html';
    } else if (user.role === 'guide') {
      authBtn.href = 'dashboard-guide.html';
    } else {
      authBtn.href = 'my-reservations.html';
      if (resLink) resLink.style.display = 'inline';
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout(false);
      window.location.href = 'index.html';
    });
  }
}

// ==========================================
// 2. LOGIN ȘI REGISTER
// ==========================================
function initAuthForms() {
  const loginForm = $('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = $('login-error');
      errorEl.textContent = '';

      const res = await api('/auth/login', {
        method: 'POST',
        auth: false,
        body: { email: $('login-email').value.trim(), password: $('login-password').value }
      });

      if (res.ok && res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        const role = res.data.user.role;
        window.location.href =
          role === 'admin' ? 'dashboard-admin.html' :
          role === 'guide' ? 'dashboard-guide.html' : 'events.html';
      } else {
        errorEl.textContent = errMsg(res, 'Email sau parolă incorectă.');
      }
    });
  }

  const registerForm = $('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if ($('reg-password').value !== $('reg-confirm-password').value) {
        alert('Parolele nu coincid!');
        return;
      }
      const data = Object.fromEntries(new FormData(registerForm).entries());
      if (!['tourist', 'guide'].includes(data.role)) data.role = 'tourist';

      const res = await api('/auth/register', { method: 'POST', auth: false, body: data });
      if (res.ok) {
        alert('Cont creat! Te poți autentifica.');
        window.location.href = 'login.html';
      } else {
        alert(errMsg(res, 'Eroare la înregistrare.'));
      }
    });
  }
}

// ==========================================
// 3. LISTARE ȘI FILTRARE TURURI (events.html)
// ==========================================
async function initEventsPage() {
  const container = $('tours-container');
  const themeSelect = $('filter-theme');
  if (!container || !themeSelect) return;

  const themeFromUrl = new URLSearchParams(window.location.search).get('theme');
  if (themeFromUrl) themeSelect.value = themeFromUrl;

  const fetchAndRender = async () => {
    const filters = {
      search: $('filter-search').value.trim(),
      theme: themeSelect.value,
      date: $('filter-date').value,
      maxPrice: $('filter-price').value,
      duration: $('filter-duration').value
    };
    Object.keys(filters).forEach(k => !filters[k] && delete filters[k]);

    const res = await api(`/tours?${new URLSearchParams(filters)}`, { auth: false });
    if (!res.ok) {
      container.innerHTML = `<p>${esc(errMsg(res, 'Nu s-au putut încărca tururile.'))}</p>`;
      return;
    }
    const tours = Array.isArray(res.data) ? res.data : [];
    if (tours.length === 0) {
      container.innerHTML = '<p>Nu am găsit tururi pentru filtrele selectate.</p>';
      return;
    }

    container.innerHTML = tours.map(t => `
      <article class="tour-card">
        <img src="${esc(assetUrl(t.image_url, TOUR_PLACEHOLDER))}" alt="${esc(t.title)}" class="tour-card-img">
        <h3>${esc(t.title)}</h3>
        <p class="tour-meta">• ${esc(formatDuration(t.duration_hours))} • ${esc(t.price)} RON • ${esc(THEME_LABELS[t.theme] || t.theme)}</p>
        <p class="tour-spots">Locuri libere: ${esc(t.available_spots ?? '-')}</p>
        <a href="tour-detail.html?id=${encodeURIComponent(t.id)}" class="btn-primary">Detalii</a>
      </article>
    `).join('');
  };

  $('apply-filters-btn').addEventListener('click', fetchAndRender);
  $('filter-search').addEventListener('keydown', (e) => { if (e.key === 'Enter') fetchAndRender(); });
  fetchAndRender();
}

// ==========================================
// 4. DETALII TUR + HARTĂ + RECENZII (tour-detail.html)
// ==========================================
let unitPrice = 0;
let leafletMap = null;

function updateTotal() {
  const spots = parseInt($('spots-input').value, 10) || 1;
  $('total-price').textContent = (spots * unitPrice).toFixed(2);
}

function renderReviews(reviews) {
  const listEl = $('reviews-list');
  const avgEl = $('tour-avg-rating');

  if (!reviews || reviews.length === 0) {
    avgEl.textContent = '★ Fără recenzii încă';
    listEl.innerHTML = '<p class="review-comment">Acest tur nu are încă recenzii.</p>';
    return;
  }
  const avg = (reviews.reduce((a, r) => a + Number(r.rating), 0) / reviews.length).toFixed(1);
  avgEl.textContent = `★ ${avg} (${reviews.length} ${reviews.length === 1 ? 'recenzie' : 'recenzii'})`;

  listEl.innerHTML = reviews.map(r => {
    const n = Math.min(5, Math.max(0, Number(r.rating) || 0));
    return `
      <div class="review-item">
        <div class="review-top">
          <strong>${esc(r.tourist_name || 'Turist')}</strong>
          <span class="review-stars">${'★'.repeat(n)}${'☆'.repeat(5 - n)}</span>
        </div>
        <p class="review-comment">${esc(r.comment || 'Fără comentariu.')}</p>
        <span class="review-date">${r.created_at ? new Date(r.created_at).toLocaleDateString('ro-RO') : ''}</span>
      </div>`;
  }).join('');
}

async function initMeetingMap(meetingPointText) {
  const mapContainer = $('meeting-map');
  if (!mapContainer || typeof L === 'undefined' || !meetingPointText) return;

  let lat = 45.7579, lon = 21.2290; // Timișoara, implicit
  try {
    const q = encodeURIComponent(`${meetingPointText}, Timisoara, Romania`);
    const geo = await (await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`)).json();
    if (geo && geo.length > 0) { lat = parseFloat(geo[0].lat); lon = parseFloat(geo[0].lon); }
  } catch (err) { /* rămân coordonatele implicite */ }

  if (leafletMap) leafletMap.remove();
  leafletMap = L.map('meeting-map').setView([lat, lon], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(leafletMap);
  L.marker([lat, lon]).addTo(leafletMap)
    .bindPopup(`<strong>Punct de întâlnire:</strong><br>${esc(meetingPointText)}`).openPopup();
}

async function loadTour(tourId, { reloadMap = true } = {}) {
  const res = await api(`/tours/${tourId}`, { auth: false });
  if (!res.ok) {
    $('tour-title').textContent = res.status === 404 ? 'Turul nu a fost găsit' : 'Nu s-a putut încărca turul';
    $('tour-description').textContent = errMsg(res, '');
    $('booking-submit').disabled = true;
    return;
  }
  const tour = res.data;

  $('tour-title').textContent = tour.title;
  document.title = `LocalGuide - ${tour.title}`;
  $('tour-description').textContent = tour.description || '';
  $('tour-meeting').textContent = tour.meeting_point || '-';
  $('tour-duration').textContent = formatDuration(tour.duration_hours);
  $('tour-price').textContent = tour.price;
  $('tour-image').src = assetUrl(tour.image_url, 'https://placehold.co/800x320/332E3C/ffffff?text=Foto+Tur');
  $('guide-name').textContent = tour.guide_name || 'Ghid local';
  $('guide-bio').textContent = tour.guide_bio || '';
  $('guide-avatar').src = assetUrl(tour.guide_avatar_url, AVATAR_PLACEHOLDER);

  const dateSelect = $('tour-date-select');
  const dates = (tour.dates || []).filter(d => new Date(d.date_time) > new Date());
  dateSelect.innerHTML = dates.map(d => `
    <option value="${esc(d.id)}" data-spots="${esc(d.available_spots)}" ${d.available_spots <= 0 ? 'disabled' : ''}>
      ${esc(fmtDateTime(d.date_time))} (${esc(d.available_spots)} locuri libere)
    </option>`).join('');

  const firstFree = [...dateSelect.options].find(o => !o.disabled);
  if (firstFree) dateSelect.value = firstFree.value;
  $('booking-submit').disabled = !firstFree;
  if (!firstFree) {
    dateSelect.innerHTML = '<option value="">Nicio sesiune disponibilă</option>';
  }
  syncSpotsMax();

  unitPrice = parseFloat(tour.price) || 0;
  updateTotal();
  renderReviews(tour.reviews || []);
  if (reloadMap) initMeetingMap(tour.meeting_point);
}

function syncSpotsMax() {
  const opt = $('tour-date-select').selectedOptions[0];
  const max = opt ? parseInt(opt.dataset.spots, 10) : 1;
  const input = $('spots-input');
  if (max > 0) {
    input.max = max;
    if (parseInt(input.value, 10) > max) input.value = max;
  }
}

async function initTourDetailPage() {
  if (!$('reviews-list') || !$('booking-form')) return;

  const tourId = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
  if (!tourId) { window.location.href = 'events.html'; return; }

  $('spots-input').addEventListener('input', updateTotal);
  $('tour-date-select').addEventListener('change', syncSpotsMax);

  await loadTour(tourId);

  $('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const feedback = $('booking-feedback');
    const user = getUser();

    if (!getToken() || !user) {
      feedback.textContent = 'Autentifică-te ca turist pentru a rezerva. Te redirecționăm...';
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
      return;
    }
    if (user.role !== 'tourist') {
      feedback.textContent = 'Doar conturile de turist pot face rezervări.';
      return;
    }

    const res = await api('/reservations', {
      method: 'POST',
      body: {
        tour_date_id: parseInt($('tour-date-select').value, 10),
        spots_reserved: parseInt($('spots-input').value, 10)
      }
    });
    if (res.ok) {
      feedback.textContent = 'Rezervare înregistrată! Status: în așteptare.';
      loadTour(tourId, { reloadMap: false }); // actualizează locurile libere
    } else {
      feedback.textContent = errMsg(res, 'Rezervarea nu a putut fi făcută.');
    }
  });
}

// ==========================================
// 5. REZERVĂRILE MELE + MODAL RECENZIE (my-reservations.html)
// ==========================================
function initReviewModal() {
  const modal = $('review-modal');
  const form = $('review-form');
  const stars = document.querySelectorAll('#star-selector .star');
  const ratingInput = $('review-rating');

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const val = parseInt(star.dataset.value, 10);
      ratingInput.value = val;
      stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.value, 10) <= val));
    });
  });

  const closeModal = () => {
    modal.style.display = 'none';
    form.reset();
    ratingInput.value = 5;
    stars.forEach(s => s.classList.add('active'));
  };
  $('close-review-modal').addEventListener('click', closeModal);
  $('cancel-review-btn').addEventListener('click', closeModal);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await api('/reviews', {
      method: 'POST',
      body: {
        tour_id: parseInt($('review-tour-id').value, 10),
        rating: parseInt(ratingInput.value, 10),
        comment: $('review-comment').value.trim()
      }
    });
    if (res.ok) {
      alert('Recenzia ta a fost publicată!');
      closeModal();
    } else {
      alert(errMsg(res, 'Eroare la trimiterea recenziei.'));
    }
  });
}

async function initMyReservationsPage() {
  const container = $('my-reservations-container');
  if (!container || !requireRole(['tourist'])) return;

  initReviewModal();
  let reservations = [];

  const render = () => {
    if (reservations.length === 0) {
      container.innerHTML = '<p class="empty-state">Nu ai nicio rezervare încă. <a href="events.html">Explorează tururile</a>.</p>';
      return;
    }
    const now = new Date();
    container.innerHTML = reservations.map(r => {
      const past = new Date(r.date_time) <= now;
      return `
      <div class="reservation-card">
        <div>
          <h3>${esc(r.tour_title)}</h3>
          <p class="reservation-details">
            Data: ${esc(fmtDateTime(r.date_time))} | Locuri rezervate: ${esc(r.spots_reserved)}
          </p>
          <span class="badge badge-${esc(r.status)}">${esc(STATUS_LABELS[r.status] || r.status)}</span>
        </div>
        <div class="reservation-actions">
          ${r.status === 'confirmed' && past ? `<button class="btn-review" data-action="review" data-id="${esc(r.id)}">Lasă o recenzie</button>` : ''}
          ${(r.status === 'pending' || r.status === 'confirmed') && !past ? `<button class="btn-danger" data-action="cancel" data-id="${esc(r.id)}">Anulează rezervarea</button>` : ''}
        </div>
      </div>`;
    }).join('');
  };

  const load = async () => {
    const res = await api('/reservations/my');
    if (!res.ok) {
      container.innerHTML = `<p class="empty-state">${esc(errMsg(res, 'Nu s-au putut încărca rezervările.'))}</p>`;
      return;
    }
    reservations = res.data || [];
    render();
  };

  container.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const r = reservations.find(x => String(x.id) === btn.dataset.id);
    if (!r) return;

    if (btn.dataset.action === 'review') {
      $('review-tour-id').value = r.tour_id;
      $('review-tour-name').textContent = `Tur: ${r.tour_title}`;
      $('review-modal').style.display = 'flex';
    } else if (btn.dataset.action === 'cancel') {
      if (!confirm('Sigur dorești să anulezi această rezervare?')) return;
      const res = await api(`/reservations/${r.id}/cancel`, { method: 'PUT' });
      if (res.ok) load(); else alert(errMsg(res, 'Nu s-a putut anula rezervarea.'));
    }
  });

  load();
}

// ==========================================
// 6. PROFIL GHID (profile-guide.html)
// ==========================================
async function initGuideProfilePage() {
  const profileForm = $('guide-profile-form');
  if (!profileForm || !requireRole(['guide'])) return;

  const user = getUser();
  $('guide-display-name').textContent = user.name;
  $('guide-display-email').textContent = user.email;
  $('guide-name').value = user.name;

  const fileInput = $('guide-avatar-file');
  const avatarPreview = $('avatar-preview');
  const feedback = $('profile-feedback');

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Te rugăm să selectezi un fișier imagine (JPG, PNG, WebP).');
      fileInput.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Imaginea este prea mare (maxim 5 MB).');
      fileInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => { avatarPreview.src = e.target.result; };
    reader.readAsDataURL(file);
  });

  const res = await api('/guide/profile');
  if (res.ok && res.data) {
    $('guide-area').value = res.data.activity_area || '';
    $('guide-bio-input').value = res.data.bio || '';
    avatarPreview.src = assetUrl(res.data.avatar_url, AVATAR_PLACEHOLDER);
  }

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', $('guide-name').value.trim());
    formData.append('activity_area', $('guide-area').value.trim());
    formData.append('bio', $('guide-bio-input').value.trim());
    if (fileInput.files[0]) formData.append('avatar', fileInput.files[0]);

    const save = await api('/guide/profile', { method: 'PUT', body: formData });
    if (save.ok) {
      feedback.textContent = 'Profilul a fost salvat cu succes!';
      const updated = { ...getUser(), name: $('guide-name').value.trim() };
      localStorage.setItem('user', JSON.stringify(updated));
      $('guide-display-name').textContent = updated.name;
      if (save.data && save.data.avatar_url) avatarPreview.src = assetUrl(save.data.avatar_url, AVATAR_PLACEHOLDER);
    } else {
      feedback.textContent = errMsg(save, 'Eroare la salvarea profilului.');
    }
  });
}

// ==========================================
// 7. PANOU GHID (dashboard-guide.html)
// ==========================================
async function initGuideDashboard() {
  const myToursList = $('guide-my-tours-list');
  const requestsList = $('guide-reservations-list');
  const createTourForm = $('create-tour-form');
  if (!myToursList || !createTourForm || !requireRole(['guide'])) return;

  let myTours = [];
  let requests = [];

  const renderTours = () => {
    myToursList.innerHTML = myTours.length === 0
      ? '<p class="guide-tour-meta">Nu ai publicat încă niciun tur.</p>'
      : myTours.map(t => `
        <div class="guide-tour-item">
          <div class="guide-tour-info">
            <h4>${esc(t.title)}</h4>
            <p class="guide-tour-meta">• ${esc(THEME_LABELS[t.theme] || t.theme)} • ${esc(formatDuration(t.duration_hours))} • ${esc(t.price)} RON • Întâlnire: ${esc(t.meeting_point)}</p>
          </div>
          <div class="action-btns">
            <button type="button" class="btn-edit" data-action="edit" data-id="${esc(t.id)}">Editează</button>
            <button type="button" class="btn-reject" data-action="delete" data-id="${esc(t.id)}">Șterge</button>
          </div>
        </div>`).join('');
  };

  const renderRequests = () => {
    requestsList.innerHTML = requests.length === 0
      ? '<p class="guide-tour-meta">Nu ai cereri de rezervare.</p>'
      : requests.map(req => `
        <div class="request-item">
          <div>
            <strong>${esc(req.tour_title)}</strong> — ${esc(req.tourist_name)} (${esc(req.spots_reserved)} locuri)<br>
            <small class="request-meta">${esc(fmtDateTime(req.date_time))} | Status: ${esc(STATUS_LABELS[req.status] || req.status)}</small>
          </div>
          ${req.status === 'pending' ? `
            <div class="action-btns">
              <button type="button" class="btn-accept" data-action="confirmed" data-id="${esc(req.id)}">Confirmă</button>
              <button type="button" class="btn-reject" data-action="rejected" data-id="${esc(req.id)}">Refuză</button>
            </div>` : ''}
        </div>`).join('');
  };

  const load = async () => {
    const [toursRes, reqRes] = await Promise.all([api('/guide/tours'), api('/guide/reservations')]);
    if (toursRes.ok) { myTours = toursRes.data || []; renderTours(); }
    else myToursList.innerHTML = `<p class="guide-tour-meta">${esc(errMsg(toursRes, 'Nu s-au putut încărca tururile.'))}</p>`;
    if (reqRes.ok) { requests = reqRes.data || []; renderRequests(); }
    else requestsList.innerHTML = `<p class="guide-tour-meta">${esc(errMsg(reqRes, 'Nu s-au putut încărca cererile.'))}</p>`;
  };

  // Acțiuni pe cereri
  requestsList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const res = await api(`/guide/reservations/${btn.dataset.id}/status`, {
      method: 'PUT', body: { status: btn.dataset.action }
    });
    if (res.ok) load(); else alert(errMsg(res, 'Nu s-a putut actualiza statusul.'));
  });

  // Acțiuni pe tururi (editare / ștergere)
  myToursList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const t = myTours.find(x => String(x.id) === btn.dataset.id);
    if (!t) return;

    if (btn.dataset.action === 'delete') {
      if (!confirm('Sigur dorești să ștergi acest tur? Toate sesiunile asociate vor fi șterse.')) return;
      const res = await api(`/tours/${t.id}`, { method: 'DELETE' });
      if (res.ok) load(); else alert(errMsg(res, 'Nu s-a putut șterge turul.'));
      return;
    }

    const title = prompt('Titlu nou pentru tur:', t.title);
    if (title === null) return;
    const price = prompt('Preț nou (RON):', t.price);
    if (price === null) return;
    const meeting = prompt('Punct nou de întâlnire:', t.meeting_point);
    if (meeting === null) return;
    if (isNaN(parseFloat(price)) || parseFloat(price) < 0 || !title.trim() || !meeting.trim()) {
      alert('Valori invalide.');
      return;
    }
    const res = await api(`/tours/${t.id}`, {
      method: 'PUT',
      body: { title: title.trim(), price: parseFloat(price), meeting_point: meeting.trim() }
    });
    if (res.ok) load(); else alert(errMsg(res, 'Eroare la actualizarea turului.'));
  });

  // Publicare tur nou (multipart, cu imagine opțională)
  createTourForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = new FormData(createTourForm);
    const dateValue = f.get('date_time');
    if (new Date(dateValue) <= new Date()) {
      alert('Data turului trebuie să fie în viitor.');
      return;
    }

    const body = new FormData();
    ['title', 'description', 'theme', 'price', 'duration_hours', 'meeting_point']
      .forEach(k => body.append(k, f.get(k)));
    body.append('dates', JSON.stringify([{
      date_time: new Date(dateValue).toISOString(),
      max_spots: parseInt(f.get('max_spots'), 10)
    }]));
    const img = f.get('image');
    if (img && img.size > 0) body.append('image', img);

    const res = await api('/tours', { method: 'POST', body });
    if (res.ok) {
      alert('Turul a fost publicat!');
      createTourForm.reset();
      load();
    } else {
      alert(errMsg(res, 'Eroare la publicarea turului.'));
    }
  });

  load();
}

// ==========================================
// 8. PANOU ADMIN (dashboard-admin.html)
// ==========================================
async function initAdminDashboard() {
  const toursTbody = $('admin-tours-tbody');
  const usersTbody = $('admin-users-tbody');
  const reviewsTbody = $('admin-reviews-tbody');
  if (!toursTbody || !usersTbody || !reviewsTbody || !requireRole(['admin'])) return;

  let tours = [], users = [], reviews = [];
  const toursSearch = $('admin-search-tours');
  const usersSearch = $('admin-search-users');

  const renderTours = () => {
    const q = toursSearch.value.trim().toLowerCase();
    toursTbody.innerHTML = tours
      .filter(t => !q || String(t.title).toLowerCase().includes(q))
      .map(t => `
        <tr>
          <td>#${esc(t.id)}</td><td>${esc(t.title)}</td><td>${esc(t.guide_name || '-')}</td>
          <td>${esc(THEME_LABELS[t.theme] || t.theme)}</td><td>${esc(t.price)} RON</td>
          <td><button class="btn-delete" data-kind="tours" data-id="${esc(t.id)}">Șterge tur</button></td>
        </tr>`).join('');
  };

  const renderUsers = () => {
    const q = usersSearch.value.trim().toLowerCase();
    usersTbody.innerHTML = users
      .filter(u => !q || `${u.name} ${u.email}`.toLowerCase().includes(q))
      .map(u => `
        <tr>
          <td>#${esc(u.id)}</td><td>${esc(u.name)}</td><td>${esc(u.email)}</td>
          <td><span class="role-badge ${esc(u.role)}">${esc(u.role)}</span></td>
          <td>${u.role !== 'admin' ? `<button class="btn-delete" data-kind="users" data-id="${esc(u.id)}">Șterge cont</button>` : '-'}</td>
        </tr>`).join('');
  };

  const renderReviews = () => {
    reviewsTbody.innerHTML = reviews.map(r => `
      <tr>
        <td>#${esc(r.id)}</td><td>${esc(r.tour_title || r.tour_id)}</td><td>${esc(r.tourist_name || r.tourist_id)}</td>
        <td>${esc(r.rating)} / 5</td><td>${esc(r.comment || '-')}</td>
        <td><button class="btn-delete" data-kind="reviews" data-id="${esc(r.id)}">Șterge</button></td>
      </tr>`).join('');
  };

  const load = async () => {
    const [t, u, r] = await Promise.all([api('/admin/tours'), api('/admin/users'), api('/admin/reviews')]);
    tours = t.ok ? t.data : []; users = u.ok ? u.data : []; reviews = r.ok ? r.data : [];
    if (!t.ok || !u.ok || !r.ok) console.warn('Unele date de admin nu s-au încărcat:', t.status, u.status, r.status);
    $('stat-tours').textContent = tours.length;
    $('stat-users').textContent = users.length;
    $('stat-reviews').textContent = reviews.length;
    renderTours(); renderUsers(); renderReviews();
  };

  toursSearch.addEventListener('input', renderTours);
  usersSearch.addEventListener('input', renderUsers);

  document.querySelector('.admin-wrapper').addEventListener('click', async (e) => {
    const btn = e.target.closest('button.btn-delete');
    if (!btn) return;
    if (!confirm('Sigur dorești să ștergi această înregistrare?')) return;
    const res = await api(`/admin/${btn.dataset.kind}/${btn.dataset.id}`, { method: 'DELETE' });
    if (res.ok) load(); else alert(errMsg(res, 'Nu s-a putut efectua ștergerea.'));
  });

  load();
}

// ==========================================
// 9. PORNIRE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  updateNavbarAuth();
  initAuthForms();
  initEventsPage();
  initTourDetailPage();
  initMyReservationsPage();
  initGuideProfilePage();
  initGuideDashboard();
  initAdminDashboard();
});
