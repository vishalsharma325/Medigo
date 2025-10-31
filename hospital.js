// hospital.js - CRUD for hospital doctors using localStorage
(function(){
  const LS_NAME_KEY = 'hospital:name';
  const LS_DATA_KEY = 'hospital:doctors';

  let doctors = [];
  let editingId = null;
  const APPT_KEY = 'hospital:inbox';
  let appts = [];

  document.addEventListener('DOMContentLoaded', () => {
    // Navbar interactions
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => { navLinks.classList.toggle('active'); menuToggle.classList.toggle('open'); });
      document.querySelectorAll('.nav-links a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('active')));
    }
    const navbar = document.querySelector('.navbar');
    const progress = document.getElementById('scrollProgress');
    const updateProgress = () => {
      if (!progress) return;
      const h = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (window.scrollY / h) * 100));
      progress.style.width = pct + '%';
    };
    const onScroll = () => {
      if (navbar) {
        if (window.scrollY > 8) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
      }
      updateProgress();
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Setup name
    const nameEl = document.getElementById('hospitalName');
    const changeBtn = document.getElementById('changeHospitalName');
    let name = localStorage.getItem(LS_NAME_KEY);
    if (!name) { name = 'City Care Hospital'; localStorage.setItem(LS_NAME_KEY, name); }
    nameEl.textContent = name;
    changeBtn.addEventListener('click', () => {
      const n = prompt('Enter hospital name:', localStorage.getItem(LS_NAME_KEY) || '');
      if (n && n.trim()) { localStorage.setItem(LS_NAME_KEY, n.trim()); nameEl.textContent = n.trim(); }
    });

    // Load data
    try {
      doctors = JSON.parse(localStorage.getItem(LS_DATA_KEY) || '[]');
      if (!Array.isArray(doctors)) doctors = [];
    } catch { doctors = []; }
    renderTable();

    // Load appointments inbox
    loadAppts();
    renderAppts();

    window.addEventListener('storage', (e) => {
      if (e.key === APPT_KEY || e.key === APPT_KEY + ':lastUpdate') { loadAppts(); renderAppts(); }
    });

    // Form handlers
    const form = document.getElementById('doctorForm');
    const docImage = document.getElementById('docImage');
    const preview = document.getElementById('docPreview');
    docImage.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) { preview.innerHTML=''; return; }
      const dataUrl = await fileToDataURL(file);
      preview.innerHTML = `<img src="${dataUrl}" alt="preview" style="max-width:120px;border-radius:8px;"/>`;
      preview.dataset.dataurl = dataUrl;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const d = collectForm();
      if (!d) return;
      if (editingId) {
        const idx = doctors.findIndex(x => x.id === editingId);
        if (idx >= 0) doctors[idx] = { ...d, id: editingId };
      } else {
        doctors.push({ ...d, id: 'D' + Date.now() });
      }
      persist();
      renderTable();
      resetForm();
    });

    document.getElementById('resetDocForm').addEventListener('click', resetForm);

    // Import/Export
    const exportBtn = document.getElementById('exportDoctorsData');
    const importBtn = document.getElementById('importDoctorsDataBtn');
    const importInput = document.getElementById('importDoctorsData');
    exportBtn.addEventListener('click', () => downloadJSON(doctors, 'hospital_doctors.json'));
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const arr = JSON.parse(text);
        if (Array.isArray(arr)) {
          doctors = arr;
          persist();
          renderTable();
          alert('Imported successfully');
        } else alert('Invalid JSON format');
      } catch(err) { alert('Failed to import'); }
      importInput.value = '';
    });
  });

  function collectForm() {
    const id = document.getElementById('docId').value;
    const name = document.getElementById('docName').value.trim();
    const speciality = document.getElementById('docSpeciality').value.trim();
    const experience = parseInt(document.getElementById('docExperience').value || '0', 10);
    const regularFee = parseFloat(document.getElementById('docRegularFee').value || '0');
    const emergencyFee = parseFloat(document.getElementById('docEmergencyFee').value || '0');
    const rating = parseFloat(document.getElementById('docRating').value || '0');
    const patients = parseInt(document.getElementById('docPatients').value || '0', 10);
    const photo = document.getElementById('docPreview').dataset.dataurl || null;
    const hospital = localStorage.getItem(LS_NAME_KEY) || 'Hospital';
    if (!name || !speciality) { alert('Please fill required fields'); return null; }
    return { id, name, speciality, hospital, experience, rating, patients, regularFee, emergencyFee, photo };
  }

  function renderTable() {
    const tbody = document.querySelector('#docTable tbody');
    tbody.innerHTML = doctors.map(d => `
      <tr>
        <td>${d.photo ? `<img src="${d.photo}" alt="${d.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;"/>` : ''}</td>
        <td>${d.name}</td>
        <td>${d.speciality}</td>
        <td>${d.experience} yrs</td>
        <td>₹${d.regularFee} / ₹${d.emergencyFee}</td>
        <td>${d.rating || '-'} ⭐</td>
        <td>
          <button class="btn" data-act="edit" data-id="${d.id}">Edit</button>
          <button class="btn" data-act="del" data-id="${d.id}">Delete</button>
        </td>
      </tr>
    `).join('');
    tbody.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        if (act === 'edit') fillForm(id);
        else if (act === 'del') remove(id);
      });
    });
  }

  function fillForm(id) {
    const d = doctors.find(x => x.id === id);
    if (!d) return;
    editingId = id;
    document.getElementById('docId').value = d.id;
    document.getElementById('docName').value = d.name;
    document.getElementById('docSpeciality').value = d.speciality;
    document.getElementById('docExperience').value = d.experience;
    document.getElementById('docRegularFee').value = d.regularFee;
    document.getElementById('docEmergencyFee').value = d.emergencyFee;
    document.getElementById('docRating').value = d.rating || 0;
    document.getElementById('docPatients').value = d.patients || 0;
    const preview = document.getElementById('docPreview');
    preview.dataset.dataurl = d.photo || '';
    preview.innerHTML = d.photo ? `<img src="${d.photo}" style="max-width:120px;border-radius:8px;"/>` : '';
  }

  function remove(id) {
    if (!confirm('Delete this doctor?')) return;
    doctors = doctors.filter(d => d.id !== id);
    persist();
    renderTable();
  }

  function resetForm() {
    editingId = null;
    document.getElementById('doctorForm').reset();
    const preview = document.getElementById('docPreview');
    preview.innerHTML = '';
    delete preview.dataset.dataurl;
  }

  function persist() { localStorage.setItem(LS_DATA_KEY, JSON.stringify(doctors)); }

  function loadAppts() {
    try {
      appts = JSON.parse(localStorage.getItem(APPT_KEY) || '[]');
      if (!Array.isArray(appts)) appts = [];
    } catch { appts = [] }
  }

  function renderAppts() {
    const tbody = document.querySelector('#apptTable tbody');
    if (!tbody) return;
    if (!appts.length) { tbody.innerHTML = '<tr><td colspan="8">No appointments</td></tr>'; return; }
    tbody.innerHTML = appts.slice().reverse().map(a => `
      <tr>
        <td>${a.id}</td>
        <td>${a.patient?.name || '-'}<br/><small>${a.patient?.phone || ''}</small></td>
        <td>${a.doctor?.name || '-'}<br/><small>${a.doctor?.speciality || ''}</small></td>
        <td>${a.date || ''} ${a.time || ''}</td>
        <td>${a.type || ''}</td>
        <td>₹${a.fee || '-'}</td>
        <td><span class="badge ${apptBadge(a.status)}">${a.status || 'new'}</span></td>
        <td>${apptButtons(a.status, a.id)}</td>
      </tr>
    `).join('');
    tbody.querySelectorAll('button[data-apptid]').forEach(btn => btn.addEventListener('click', () => handleAppt(btn.dataset.apptid, btn.dataset.act)));
  }

  function apptBadge(status) {
    if (status === 'new') return 'badge-warn';
    if (status === 'accepted') return 'badge-success';
    if (status === 'completed') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    return 'badge';
  }

  function apptButtons(status, id) {
    if (status === 'new') return `<button class=\"btn\" data-apptid=\"${id}\" data-act=\"accept\">Accept</button> <button class=\"btn\" data-apptid=\"${id}\" data-act=\"reject\">Reject</button>`;
    if (status === 'accepted') return `<button class=\"btn\" data-apptid=\"${id}\" data-act=\"complete\">Mark Completed</button>`;
    return '';
  }

  function handleAppt(id, act) {
    const idx = appts.findIndex(a => a.id === id);
    if (idx < 0) return;
    if (act === 'accept') appts[idx].status = 'accepted';
    if (act === 'reject') appts[idx].status = 'rejected';
    if (act === 'complete') appts[idx].status = 'completed';
    localStorage.setItem(APPT_KEY, JSON.stringify(appts));
    localStorage.setItem(APPT_KEY + ':lastUpdate', Date.now().toString());
    renderAppts();
  }

  function fileToDataURL(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }
})();