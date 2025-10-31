// Product listing (local sample)
const medicines = [
    { id: 1, name: "Paracetamol 500mg", price: 45, expiry: "2025-12-31", stock: "In Stock", manufacturer: "Cipla", pharmacy: "HealthPlus Pharmacy", distance: 1.2, category: "Pain Relief" },
    { id: 2, name: "Amoxicillin 250mg", price: 120, expiry: "2025-09-15", stock: "In Stock", manufacturer: "Dr. Reddy's", pharmacy: "MediCare Store", distance: 2.5, category: "Antibiotic" },
    { id: 3, name: "Cetirizine 10mg", price: 35, expiry: "2026-03-20", stock: "In Stock", manufacturer: "Sun Pharma", pharmacy: "WellCare Chemist", distance: 0.8, category: "Allergy" },
    { id: 4, name: "Omeprazole 20mg", price: 85, expiry: "2025-11-30", stock: "Low Stock", manufacturer: "Lupin", pharmacy: "HealthPlus Pharmacy", distance: 1.2, category: "Digestive" },
    { id: 5, name: "Ibuprofen 400mg", price: 55, expiry: "2026-01-25", stock: "In Stock", manufacturer: "Abbott", pharmacy: "City Pharmacy", distance: 3.2, category: "Pain Relief" },
    { id: 6, name: "Vitamin D3 60000 IU", price: 180, expiry: "2026-06-10", stock: "In Stock", manufacturer: "Mankind", pharmacy: "MediCare Store", distance: 2.5, category: "Supplement" },
    { id: 7, name: "Azithromycin 500mg", price: 95, expiry: "2025-08-18", stock: "In Stock", manufacturer: "Cipla", pharmacy: "WellCare Chemist", distance: 0.8, category: "Antibiotic" },
    { id: 8, name: "Metformin 500mg", price: 65, expiry: "2026-02-14", stock: "In Stock", manufacturer: "Sun Pharma", pharmacy: "Wellness Pharmacy", distance: 4.5, category: "Diabetes" },
    { id: 9, name: "Aspirin 75mg", price: 30, expiry: "2026-04-22", stock: "In Stock", manufacturer: "Bayer", pharmacy: "HealthPlus Pharmacy", distance: 1.2, category: "Pain Relief" },
    { id: 10, name: "Losartan 50mg", price: 95, expiry: "2025-10-30", stock: "In Stock", manufacturer: "Cipla", pharmacy: "City Pharmacy", distance: 3.2, category: "Diabetes" },
    { id: 11, name: "Cough Syrup 100ml", price: 75, expiry: "2025-07-15", stock: "In Stock", manufacturer: "Himalaya", pharmacy: "WellCare Chemist", distance: 0.8, category: "Allergy" },
    { id: 12, name: "Multivitamin Tablets", price: 150, expiry: "2026-08-20", stock: "In Stock", manufacturer: "HealthVit", pharmacy: "MediCare Store", distance: 2.5, category: "Supplement" }
];

// CSV-powered catalogue (for search + info)
let csvMedicines = [];

let cart = [];
let userLocation = null;
let currentCategory = 'all';
let medicineImages = [];
let currentRadius = 5;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    requestLocation();
    displayMedicines(medicines);
    setupEventListeners();
    loadCsvMedicines();
    // Try multiple sources for images
    discoverMedicineImages();
    loadMedicineManifest();
    loadPharmacyImagesFromLS();

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    const onScroll = () => {
        if (!navbar) return;
        if (window.scrollY > 8) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
});

// Request location
function requestLocation() {
    const locationStatus = document.getElementById('locationStatus');
    
    const setMsg = (ok) => {
        if (!locationStatus) return;
        if (ok) {
            locationStatus.textContent = `✓ Location detected - Showing medicines within ${currentRadius}km radius`;
            locationStatus.className = 'location-status success';
        } else {
            locationStatus.textContent = '⚠ Location access denied - Showing all available medicines';
            locationStatus.className = 'location-status error';
        }
    };

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                setMsg(true);
            },
            function(error) {
                setMsg(false);
            }
        );
    } else {
        locationStatus.textContent = '⚠ Geolocation not supported';
        locationStatus.className = 'location-status error';
    }
}

// Display medicines
function displayMedicines(medicineList) {
    const medicineGrid = document.getElementById('medicineGrid');
    medicineGrid.innerHTML = '';
    
const filteredMedicines = medicineList.filter(med => 
        med.distance <= currentRadius && (currentCategory === 'all' || med.category === currentCategory)
    );
    
    // Shuffle a shallow copy for random image pairing across renders
    const shuffled = [...filteredMedicines].sort(() => Math.random() - 0.5);

    shuffled.forEach(medicine => {
        const card = createMedicineCard(medicine);
        medicineGrid.appendChild(card);
    });
}

// Create medicine card
function createMedicineCard(medicine) {
    const card = document.createElement('div');
    card.className = 'medicine-card';
    
    const stockClass = medicine.stock === 'In Stock' ? 'in-stock' : 'low-stock';
    const imgSrc = getRandomMedicineImage();
    
    card.innerHTML = `
        <div class="medicine-img">${imgSrc ? `<img src="${imgSrc}" alt="${medicine.name}">` : ''}</div>
        <div class="medicine-header">
            <div class="medicine-name">${medicine.name}</div>
            <span class="medicine-stock ${stockClass}">${medicine.stock}</span>
        </div>
        <div class="medicine-details">
            <div class="medicine-detail"><span>Category:</span><strong>${medicine.category}</strong></div>
            <div class="medicine-detail"><span>Manufacturer:</span><strong>${medicine.manufacturer}</strong></div>
            <div class="medicine-detail"><span>Expiry Date:</span><strong>${formatDate(medicine.expiry)}</strong></div>
        </div>
        <div class="medicine-price">₹${medicine.price}</div>
        <div class="medicine-location">📍 ${medicine.pharmacy} - ${medicine.distance}km away</div>
        <button class="btn btn-primary" onclick="addToCart(${medicine.id})">Add to Cart</button>
    `;
    
    return card;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Add to cart
function addToCart(medicineId) {
    const medicine = medicines.find(m => m.id === medicineId);
    const existingItem = cart.find(item => item.id === medicineId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...medicine, quantity: 1 });
    }
    
    updateCart();
    showNotification('Added to cart!');
}

// Update cart
function updateCart() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const cartSubtotal = document.getElementById('cartSubtotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartEmpty.classList.remove('hidden');
        cartItems.innerHTML = '';
        cartFooter.classList.add('hidden');
    } else {
        cartEmpty.classList.add('hidden');
        cartFooter.classList.remove('hidden');
        
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">₹${item.price} each</div>
                    <div class="cart-item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-item" onclick="removeFromCart(${item.id})">🗑️</button>
            </div>
        `).join('');
        
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartSubtotal.textContent = `₹${subtotal}`;
    }
}

// Update quantity
function updateQuantity(medicineId, change) {
    const item = cart.find(i => i.id === medicineId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(medicineId);
        } else {
            updateCart();
        }
    }
}

// Remove from cart
function removeFromCart(medicineId) {
    cart = cart.filter(item => item.id !== medicineId);
    updateCart();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = 'position:fixed;top:80px;right:20px;background:#10b981;color:white;padding:1rem 2rem;border-radius:8px;z-index:9999;animation:fadeIn 0.3s';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });
    document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('active')));
    
    // Cart sidebar
    const cartIconBtn = document.getElementById('cartIconBtn');
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    
    cartIconBtn.addEventListener('click', () => cartSidebar.classList.add('active'));
    closeCart.addEventListener('click', () => cartSidebar.classList.remove('active'));
    
    // Search + typeahead
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('medicineSearch');
    const suggestionsList = document.getElementById('suggestionsList');
    searchBtn.addEventListener('click', searchMedicines);
    searchInput.addEventListener('keypress', e => { if (e.key === 'Enter') searchMedicines(); });
    searchInput.addEventListener('input', () => updateSuggestions(searchInput.value.trim()));
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) hideSuggestions();
    });

    suggestionsList.addEventListener('click', (e) => {
        const li = e.target.closest('li[data-name]');
        if (!li) return;
        const name = li.getAttribute('data-name');
        searchInput.value = name;
        const med = csvMedicines.find(m => m.name.toLowerCase() === name.toLowerCase());
        if (med) showMedicineInfo(med);
        hideSuggestions();
    });
    
    // Radius slider
    const radiusSlider = document.getElementById('radiusSlider');
    const radiusValue = document.getElementById('radiusValue');
    const deliveryEstimate = document.getElementById('deliveryEstimate');
    const pharmacyCount = document.getElementById('pharmacyCount');
    const refreshRadiusUI = () => {
        if (radiusValue) radiusValue.textContent = currentRadius;
        if (deliveryEstimate) deliveryEstimate.textContent = `₹${computeDeliveryCharge(currentRadius)}`;
        if (pharmacyCount) pharmacyCount.textContent = computePharmacyScanCount(currentRadius);
        const loc = document.getElementById('locationStatus');
        if (loc && loc.classList.contains('success')) {
            loc.textContent = `✓ Location detected - Showing medicines within ${currentRadius}km radius`;
        }
    };
    if (radiusSlider) {
        radiusSlider.addEventListener('input', (e) => {
            currentRadius = parseInt(e.target.value, 10) || 5;
            refreshRadiusUI();
            displayMedicines(medicines);
        });
        refreshRadiusUI();
    }

    // Category filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.getAttribute('data-category');
            displayMedicines(medicines);
        });
    });
    
    // Checkout
    const proceedToCheckout = document.getElementById('proceedToCheckout');
    const checkoutModal = document.getElementById('checkoutModal');
    const closeCheckout = document.getElementById('closeCheckout');
    
    proceedToCheckout.addEventListener('click', () => {
        if (cart.length > 0) {
            showCheckout();
            cartSidebar.classList.remove('active');
        }
    });
    
    closeCheckout.addEventListener('click', () => checkoutModal.classList.add('hidden'));
    
    // Place order
    const placeOrderBtn = document.getElementById('placeOrder');
    placeOrderBtn.addEventListener('click', placeOrder);
    
    // Back to medicines
    const backToMedicines = document.getElementById('backToMedicines');
    backToMedicines.addEventListener('click', () => {
        document.getElementById('confirmationModal').classList.add('hidden');
        cart = [];
        updateCart();
    });
}

function computeDeliveryCharge(radiusKm) {
    // Linear scale: 5km => 40, 50km => 350
    const minKm = 5, maxKm = 50;
    const minCost = 40, maxCost = 350;
    const r = Math.min(maxKm, Math.max(minKm, Number(radiusKm) || minKm));
    const cost = minCost + (r - minKm) * (maxCost - minCost) / (maxKm - minKm);
    // Round to nearest 10
    return Math.round(cost / 10) * 10;
}

function computePharmacyScanCount(radiusKm) {
    // Simple scale: ~2 pharmacies per km
    return Math.max(5, Math.floor((Number(radiusKm) || 5) * 2));
}

// Load CSV medicines
async function loadCsvMedicines() {
    try {
        const res = await fetch('medicines_common_india.csv', { cache: 'no-store' });
        const text = await res.text();
        csvMedicines = parseCsv(text);
    } catch (e) {
        // Fallback: empty (works without breaking UI when opened via file://)
        csvMedicines = [];
        console.warn('Could not load CSV. If opening via file://, consider using a local server.');
    }
}

function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length <= 1) return [];
    const header = lines[0].split(',');
    const get = (cols, key) => cols[header.indexOf(key)]?.trim() || '';
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        // Handle commas inside values if ever quoted (basic join for 7 columns)
        if (cols.length > header.length) {
            const merged = [];
            let j = 0;
            while (j < cols.length) {
                if (merged.length === header.length - 1) {
                    merged.push(cols.slice(j).join(','));
                    break;
                }
                merged.push(cols[j]);
                j++;
            }
            cols.splice(0, cols.length, ...merged);
        }
        rows.push({
            name: get(cols, 'Medicine'),
            generic: get(cols, 'Generic'),
            formStrength: get(cols, 'Form/Strength'),
            pack: get(cols, 'Pack'),
            approxPrice: get(cols, 'Approx_Price_INR'),
            category: get(cols, 'Category'),
            source: get(cols, 'Source')
        });
    }
    return rows;
}

// Search medicines (CSV-powered for info)
function searchMedicines() {
    const searchInput = document.getElementById('medicineSearch');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('Please enter a medicine name to search');
        return;
    }
    
    const results = (csvMedicines.length ? csvMedicines : [])
        .filter(m => m.name.toLowerCase().includes(searchTerm)
            || m.generic.toLowerCase().includes(searchTerm)
            || m.category.toLowerCase().includes(searchTerm));
    
    displaySearchResults(results, searchTerm);
}

// Display search results (CSV info cards)
function displaySearchResults(results, searchTerm) {
    const searchResultsSection = document.getElementById('searchResults');
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    
    if (!results || results.length === 0) {
        searchResultsGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:2rem;"><p style="font-size:1.1rem;color:#6b7280;">No medicines found for "${searchTerm}" in CSV list.</p></div>`;
    } else {
        searchResultsGrid.innerHTML = results.map(m => createCsvInfoCard(m)).join('');
        // If exact match found, also show sticky info panel
        const exact = results.find(r => r.name.toLowerCase() === searchTerm);
        if (exact) showMedicineInfo(exact); else hideMedicineInfo();
    }
    
    hideSuggestions();
    searchResultsSection.classList.remove('hidden');
    searchResultsSection.scrollIntoView({ behavior: 'smooth' });
}

function createCsvInfoCard(m) {
    return `
    <div class="medicine-card">
        <div class="medicine-header">
            <div class="medicine-name">${m.name}</div>
            <span class="medicine-stock in-stock">Info</span>
        </div>
        <div class="medicine-details">
            <div class="medicine-detail"><span>Generic:</span><strong>${m.generic || '-'}</strong></div>
            <div class="medicine-detail"><span>Form/Strength:</span><strong>${m.formStrength || '-'}</strong></div>
            <div class="medicine-detail"><span>Pack:</span><strong>${m.pack || '-'}</strong></div>
            <div class="medicine-detail"><span>Approx Price:</span><strong>${m.approxPrice || '-'}</strong></div>
            <div class="medicine-detail"><span>Category:</span><strong>${m.category || '-'}</strong></div>
        </div>
        <div class="medicine-location">Source: ${m.source || '-'}</div>
        <button class="btn btn-secondary" onclick='showMedicineInfo(${JSON.stringify(m).replace(/'/g, "&apos;")})'>View Details</button>
    </div>`;
}

function showMedicineInfo(m) {
    const panel = document.getElementById('medicineInfo');
    if (!panel) return;
    panel.innerHTML = `
        <h4>${m.name}</h4>
        <div class="info-grid">
            <div class="info-row"><span class="info-label">Generic:</span><span>${m.generic || '-'}</span></div>
            <div class="info-row"><span class="info-label">Form/Strength:</span><span>${m.formStrength || '-'}</span></div>
            <div class="info-row"><span class="info-label">Pack:</span><span>${m.pack || '-'}</span></div>
            <div class="info-row"><span class="info-label">Approx Price:</span><span>${m.approxPrice || '-'}</span></div>
            <div class="info-row"><span class="info-label">Category:</span><span>${m.category || '-'}</span></div>
            <div class="info-row"><span class="info-label">Source:</span><span>${m.source || '-'}</span></div>
        </div>
    `;
    panel.classList.remove('hidden');
}

function hideMedicineInfo() {
    const panel = document.getElementById('medicineInfo');
    if (panel) panel.classList.add('hidden');
}

function updateSuggestions(term) {
    const list = document.getElementById('suggestionsList');
    if (!list) return;
    if (!term || !csvMedicines || csvMedicines.length === 0) { hideSuggestions(); return; }
    const lower = term.toLowerCase();
    const matches = csvMedicines.filter(m => m.name.toLowerCase().includes(lower) || m.generic.toLowerCase().includes(lower)).slice(0, 8);
    if (matches.length === 0) { hideSuggestions(); return; }
    list.innerHTML = matches.map(m => `<li data-name="${m.name}"><span class="suggestion-title">${m.name}</span><span class="suggestion-sub">${m.generic} • ${m.category}</span></li>`).join('');
    list.classList.remove('hidden');
}

function hideSuggestions() {
    const list = document.getElementById('suggestionsList');
    if (list) list.classList.add('hidden');
}

// Discover images placed in the 'medicine' folder by probing common names
function discoverMedicineImages() {
    const candidates = [];
    const prefixes = ['', 'img', 'med'];
    const exts = ['jpg','jpeg','png','webp'];
    const MAX = 100;
    for (let i = 1; i <= MAX; i++) {
        prefixes.forEach(pfx => {
            exts.forEach(ext => {
                const name = pfx ? `${pfx}${i}` : `${i}`;
                candidates.push(`medicine/${name}.${ext}`);
            });
        });
    }
    preloadCandidates(candidates).then(found => { if (found.length) medicineImages = uniqueList(medicineImages.concat(found)); });
}

async function loadMedicineManifest() {
    const manifestCandidates = ['medicine/manifest.json', 'medicine/images.json'];
    for (const url of manifestCandidates) {
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) continue;
            const list = await res.json();
            if (Array.isArray(list)) {
                const paths = list.map(p => (p.startsWith('medicine/') ? p : `medicine/${p}`));
                const found = await preloadCandidates(paths);
                if (found.length) medicineImages = uniqueList(medicineImages.concat(found));
                break;
            }
        } catch (_) { /* ignore */ }
    }
}

function loadPharmacyImagesFromLS() {
    try {
        const arr = JSON.parse(localStorage.getItem('pharm:medicines') || '[]');
        if (Array.isArray(arr)) {
            const imgs = arr.map(m => m.image).filter(Boolean);
            if (imgs.length) medicineImages = uniqueList(medicineImages.concat(imgs));
        }
    } catch (_) { /* ignore */ }
}

function uniqueList(list) {
    return Array.from(new Set(list));
}

function preloadCandidates(candidates) {
    const preload = (src) => new Promise(res => {
        const img = new Image();
        let done = false;
        const finish = (ok) => { if (!done) { done = true; res(ok ? src : null); } };
        img.onload = () => finish(true);
        img.onerror = () => finish(false);
        img.src = src;
    });
    const batches = [];
    const BATCH_SIZE = 24;
    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
        batches.push(candidates.slice(i, i + BATCH_SIZE));
    }
    return (async () => {
        const found = [];
        for (const batch of batches) {
            const results = await Promise.all(batch.map(preload));
            results.forEach(r => { if (r) found.push(r); });
        }
        return found;
    })();
}

function getRandomMedicineImage() {
    if (!medicineImages || medicineImages.length === 0) return null;
    const idx = Math.floor(Math.random() * medicineImages.length);
    return medicineImages[idx];
}

// Show checkout
function showCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutItems = document.getElementById('checkoutItems');
    
    // Display items
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <div>
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-qty">Qty: ${item.quantity} × ₹${item.price}</div>
            </div>
            <strong>₹${item.price * item.quantity}</strong>
        </div>
    `).join('');
    
    // Calculate billing (dynamic by radius)
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryCharges = computeDeliveryCharge(currentRadius);
    const gst = (subtotal * 0.05).toFixed(2);
    const total = (parseFloat(subtotal) + deliveryCharges + parseFloat(gst)).toFixed(2);
    
    document.getElementById('billSubtotal').textContent = `₹${subtotal}`;
    document.getElementById('billDelivery').textContent = `₹${deliveryCharges}`;
    document.getElementById('billGST').textContent = `₹${gst}`;
    document.getElementById('billTotal').textContent = `₹${total}`;
    
    checkoutModal.classList.remove('hidden');
}

// Place order
function placeOrder() {
    const form = document.getElementById('checkoutForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Build order payload for pharmacist inbox
    const orderId = 'MED' + Date.now().toString().slice(-8);
    const fullName = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const pincode = document.getElementById('pincode').value.trim();
    const city = document.getElementById('city').value.trim();
    const payment = (document.querySelector('input[name="payment"]:checked') || {}).value || 'cod';

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = computeDeliveryCharge(currentRadius);
    const gst = +(subtotal * 0.05).toFixed(2);
    const total = +(subtotal + delivery + gst).toFixed(2);

    const order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        customer: { fullName, phone, address, pincode, city },
        payment,
        items: cart.map(({id,name,price,quantity,manufacturer})=>({id,name,price,quantity,manufacturer})),
        billing: { subtotal, delivery, gst, total },
        status: 'new'
    };

    try {
        const KEY = 'pharm:inbox';
        const inbox = JSON.parse(localStorage.getItem(KEY) || '[]');
        inbox.push(order);
        localStorage.setItem(KEY, JSON.stringify(inbox));
        localStorage.setItem('pharm:inbox:lastUpdate', Date.now().toString());
    } catch (e) { console.warn('Failed to push to pharmacist inbox', e); }

    document.getElementById('orderId').textContent = orderId;
    
    document.getElementById('checkoutModal').classList.add('hidden');
    document.getElementById('confirmationModal').classList.remove('hidden');
}
