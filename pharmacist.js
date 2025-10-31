// pharmacist.js - CRUD for pharmacy medicines using localStorage
(function(){
  const LS_NAME_KEY = 'pharm:name';
  const LS_DATA_KEY = 'pharm:medicines';

  let medicines = [];
  let editingId = null;
  const ORDERS_KEY = 'pharm:inbox';
  let orders = [];

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
    const nameEl = document.getElementById('pharmacyName');
    const changeBtn = document.getElementById('changePharmacyName');
    let name = localStorage.getItem(LS_NAME_KEY);
    if (!name) {
      name = 'Bedi Medicos';
      localStorage.setItem(LS_NAME_KEY, name);
    }
    nameEl.textContent = name;
    changeBtn.addEventListener('click', () => {
      const n = prompt('Enter pharmacy name:', localStorage.getItem(LS_NAME_KEY) || '');
      if (n && n.trim()) {
        localStorage.setItem(LS_NAME_KEY, n.trim());
        nameEl.textContent = n.trim();
      }
    });

    // Load data
    try {
      medicines = JSON.parse(localStorage.getItem(LS_DATA_KEY) || '[]');
      if (!Array.isArray(medicines)) medicines = [];
    } catch { medicines = []; }
    renderTable();

    // Load orders inbox
    loadOrders();
    renderOrders();

    // Listen to cross-tab updates
    window.addEventListener('storage', (e) => {
      if (e.key === ORDERS_KEY || e.key === ORDERS_KEY + ':lastUpdate') { loadOrders(); renderOrders(); }
    });

    // Form handlers
    const form = document.getElementById('medicineForm');
    const medImage = document.getElementById('medImage');
    const preview = document.getElementById('medPreview');
    medImage.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) { preview.innerHTML=''; return; }
      const dataUrl = await fileToDataURL(file);
      preview.innerHTML = `<img src="${dataUrl}" alt="preview" style="max-width:120px;border-radius:8px;"/>`;
      preview.dataset.dataurl = dataUrl;
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const med = collectForm();
      if (!med) return;
      if (editingId) {
        const idx = medicines.findIndex(m => m.id === editingId);
        if (idx >= 0) medicines[idx] = { ...med, id: editingId };
      } else {
        medicines.push({ ...med, id: 'M' + Date.now() });
      }
      persist();
      renderTable();
      resetForm();
    });

    document.getElementById('resetForm').addEventListener('click', resetForm);

    // Import/Export
    const exportBtn = document.getElementById('exportPharmacyData');
    const importBtn = document.getElementById('importPharmacyDataBtn');
    const importInput = document.getElementById('importPharmacyData');
    exportBtn.addEventListener('click', () => downloadJSON(medicines, 'pharmacy_medicines.json'));
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const arr = JSON.parse(text);
        if (Array.isArray(arr)) {
          medicines = arr;
          persist();
          renderTable();
          alert('Imported successfully');
        } else alert('Invalid JSON format');
      } catch(err) { alert('Failed to import'); }
      importInput.value = '';
    });
  });

  function collectForm() {
    const id = document.getElementById('medId').value;
    const name = document.getElementById('medName').value.trim();
    const category = document.getElementById('medCategory').value.trim();
    const price = parseFloat(document.getElementById('medPrice').value || '0');
    const stock = document.getElementById('medStock').value;
    const manufacturer = (document.getElementById('medMfg').value || '').trim();
    const img = document.getElementById('medPreview').dataset.dataurl || null;
    if (!name || !category || isNaN(price)) { alert('Please fill required fields'); return null; }
    return { id, name, category, price, stock, manufacturer, image: img };
  }

  function renderTable() {
    const tbody = document.querySelector('#medTable tbody');
    tbody.innerHTML = medicines.map(m => `
      <tr>
        <td>${m.image ? `<img src="${m.image}" alt="${m.name}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;"/>` : ''}</td>
        <td>${m.name}</td>
        <td>${m.category}</td>
        <td>₹${m.price}</td>
        <td><span class="badge ${badgeClass(m.stock)}">${m.stock}</span></td>
        <td>${m.manufacturer || '-'}</td>
        <td>
          <button class="btn" data-act="edit" data-id="${m.id}">Edit</button>
          <button class="btn" data-act="del" data-id="${m.id}">Delete</button>
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
    const m = medicines.find(x => x.id === id);
    if (!m) return;
    editingId = id;
    document.getElementById('medId').value = m.id;
    document.getElementById('medName').value = m.name;
    document.getElementById('medCategory').value = m.category;
    document.getElementById('medPrice').value = m.price;
    document.getElementById('medStock').value = m.stock;
    document.getElementById('medMfg').value = m.manufacturer || '';
    const preview = document.getElementById('medPreview');
    preview.dataset.dataurl = m.image || '';
    preview.innerHTML = m.image ? `<img src="${m.image}" style="max-width:120px;border-radius:8px;"/>` : '';
  }

  function remove(id) {
    if (!confirm('Delete this medicine?')) return;
    medicines = medicines.filter(m => m.id !== id);
    persist();
    renderTable();
  }

  function resetForm() {
    editingId = null;
    document.getElementById('medicineForm').reset();
    const preview = document.getElementById('medPreview');
    preview.innerHTML = '';
    delete preview.dataset.dataurl;
  }

  function persist() { localStorage.setItem(LS_DATA_KEY, JSON.stringify(medicines)); }

  function loadOrders() {
    try {
      orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
      if (!Array.isArray(orders)) orders = [];
    } catch { orders = []; }
  }

  function renderOrders() {
    const tbody = document.querySelector('#ordersTable tbody');
    if (!tbody) return;
    if (!orders.length) { tbody.innerHTML = '<tr><td colspan="6">No orders</td></tr>'; return; }
    tbody.innerHTML = orders.slice().reverse().map(o => {
      const itemsLabel = o.items.map(i => `${i.name} x${i.quantity}`).join(', ');
      const status = o.status || 'new';
      return `
        <tr>
          <td>${o.id}</td>
          <td>${o.customer?.fullName || '-'}<br/><small>${o.customer?.phone || ''}</small></td>
          <td>${itemsLabel}</td>
          <td>₹${o.billing?.total ?? '-'}</td>
          <td><span class="badge ${statusBadge(status)}">${status}</span></td>
          <td>
            ${actionButtons(status, o.id)}
          </td>
        </tr>
      `;
    }).join('');
    tbody.querySelectorAll('button[data-oid]').forEach(btn => btn.addEventListener('click', () => handleOrderAction(btn.dataset.oid, btn.dataset.act)));
  }

  function statusBadge(status) {
    if (status === 'new') return 'badge-warn';
    if (status === 'accepted') return 'badge-success';
    if (status === 'completed') return 'badge-success';
    if (status === 'rejected') return 'badge-danger';
    return 'badge';
  }

  function actionButtons(status, id) {
    if (status === 'new') return `<button class="btn" data-oid="${id}" data-act="accept">Accept</button> <button class="btn" data-oid="${id}" data-act="reject">Reject</button>`;
    if (status === 'accepted') return `<button class="btn" data-oid="${id}" data-act="complete">Mark Delivered</button>`;
    return '';
  }

  function handleOrderAction(id, act) {
    const idx = orders.findIndex(o => o.id === id);
    if (idx < 0) return;
    if (act === 'accept') orders[idx].status = 'accepted';
    if (act === 'reject') orders[idx].status = 'rejected';
    if (act === 'complete') orders[idx].status = 'completed';
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    localStorage.setItem(ORDERS_KEY + ':lastUpdate', Date.now().toString());
    renderOrders();
  }
  function badgeClass(stock) {
    if (stock === 'In Stock') return 'badge-success';
    if (stock === 'Low Stock') return 'badge-warn';
    return 'badge-danger';
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
