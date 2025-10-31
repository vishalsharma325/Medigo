// Sample Medicine Database with locations (simulated 5km radius)
const medicines = [
    {
        id: 1,
        name: "Paracetamol 500mg",
        price: 45,
        expiry: "2025-12-31",
        stock: "In Stock",
        manufacturer: "Cipla",
        pharmacy: "HealthPlus Pharmacy",
        distance: 1.2,
        category: "Pain Relief",
        description: "Effective pain and fever relief"
    },
    {
        id: 2,
        name: "Amoxicillin 250mg",
        price: 120,
        expiry: "2025-09-15",
        stock: "In Stock",
        manufacturer: "Dr. Reddy's",
        pharmacy: "MediCare Store",
        distance: 2.5,
        category: "Antibiotic",
        description: "Broad-spectrum antibiotic"
    },
    {
        id: 3,
        name: "Cetirizine 10mg",
        price: 35,
        expiry: "2026-03-20",
        stock: "In Stock",
        manufacturer: "Sun Pharma",
        pharmacy: "WellCare Chemist",
        distance: 0.8,
        category: "Allergy",
        description: "Antihistamine for allergies"
    },
    {
        id: 4,
        name: "Omeprazole 20mg",
        price: 85,
        expiry: "2025-11-30",
        stock: "Low Stock",
        manufacturer: "Lupin",
        pharmacy: "HealthPlus Pharmacy",
        distance: 1.2,
        category: "Digestive",
        description: "Acid reflux and heartburn"
    },
    {
        id: 5,
        name: "Ibuprofen 400mg",
        price: 55,
        expiry: "2026-01-25",
        stock: "In Stock",
        manufacturer: "Abbott",
        pharmacy: "City Pharmacy",
        distance: 3.2,
        category: "Pain Relief",
        description: "Anti-inflammatory painkiller"
    },
    {
        id: 6,
        name: "Vitamin D3 60000 IU",
        price: 180,
        expiry: "2026-06-10",
        stock: "In Stock",
        manufacturer: "Mankind",
        pharmacy: "MediCare Store",
        distance: 2.5,
        category: "Supplement",
        description: "Vitamin D supplement"
    },
    {
        id: 7,
        name: "Azithromycin 500mg",
        price: 95,
        expiry: "2025-08-18",
        stock: "In Stock",
        manufacturer: "Cipla",
        pharmacy: "WellCare Chemist",
        distance: 0.8,
        category: "Antibiotic",
        description: "Bacterial infection treatment"
    },
    {
        id: 8,
        name: "Metformin 500mg",
        price: 65,
        expiry: "2026-02-14",
        stock: "In Stock",
        manufacturer: "Sun Pharma",
        pharmacy: "Wellness Pharmacy",
        distance: 4.5,
        category: "Diabetes",
        description: "Blood sugar control"
    }
];

// User location (simulated)
let userLocation = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Request location permission
    requestLocation();
    
    // Load commonly ordered medicines
    displayMedicines(medicines);
    
    // Setup event listeners
    setupEventListeners();
    
    // Set minimum date for consultation booking
    setMinimumDate();
}

// Location handling
function requestLocation() {
    const locationStatus = document.getElementById('locationStatus');
    
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                locationStatus.textContent = '✓ Location detected - Showing medicines within 5km radius';
                locationStatus.className = 'location-status success';
            },
            function(error) {
                locationStatus.textContent = '⚠ Location access denied - Showing all available medicines';
                locationStatus.className = 'location-status error';
                console.log('Location error:', error);
            }
        );
    } else {
        locationStatus.textContent = '⚠ Geolocation not supported - Showing all available medicines';
        locationStatus.className = 'location-status error';
    }
}

// Display medicines
function displayMedicines(medicineList) {
    const medicineGrid = document.getElementById('medicineGrid');
    medicineGrid.innerHTML = '';
    
    // Filter medicines within 5km radius
    const filteredMedicines = medicineList.filter(med => med.distance <= 5);
    
    filteredMedicines.forEach(medicine => {
        const card = createMedicineCard(medicine);
        medicineGrid.appendChild(card);
    });
}

// Create medicine card
function createMedicineCard(medicine) {
    const card = document.createElement('div');
    card.className = 'medicine-card';
    
    const stockClass = medicine.stock === 'In Stock' ? 'in-stock' : 'low-stock';
    
    card.innerHTML = `
        <div class="medicine-header">
            <div class="medicine-name">${medicine.name}</div>
            <span class="medicine-stock ${stockClass}">${medicine.stock}</span>
        </div>
        <div class="medicine-details">
            <div class="medicine-detail">
                <span>Category:</span>
                <strong>${medicine.category}</strong>
            </div>
            <div class="medicine-detail">
                <span>Manufacturer:</span>
                <strong>${medicine.manufacturer}</strong>
            </div>
            <div class="medicine-detail">
                <span>Expiry Date:</span>
                <strong>${formatDate(medicine.expiry)}</strong>
            </div>
        </div>
        <div class="medicine-price">₹${medicine.price}</div>
        <div class="medicine-location">
            📍 ${medicine.pharmacy} - ${medicine.distance}km away
        </div>
        <button class="btn btn-primary" onclick="orderMedicine('${medicine.name}')">Order Now</button>
    `;
    
    return card;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Order medicine
function orderMedicine(medicineName) {
    alert(`Order placed for ${medicineName}!\n\nYour medicine will be delivered within 30-45 minutes.\n\nThank you for using Medigo!`);
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
    
    // Medicine search
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('medicineSearch');
    
    searchBtn.addEventListener('click', searchMedicines);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMedicines();
        }
    });
    
    // Speciality card selection
    const specialityCards = document.querySelectorAll('.speciality-card');
    specialityCards.forEach(card => {
        card.addEventListener('click', function() {
            const speciality = this.getAttribute('data-speciality');
            showBookingForm(speciality);
        });
    });
    
    // Consultation form
    const consultationForm = document.getElementById('consultationForm');
    consultationForm.addEventListener('submit', handleConsultationBooking);
    
    // Cancel booking
    const cancelBtn = document.getElementById('cancelBooking');
    cancelBtn.addEventListener('click', hideBookingForm);
    
    // Book another consultation
    const bookAnotherBtn = document.getElementById('bookAnother');
    bookAnotherBtn.addEventListener('click', function() {
        document.getElementById('bookingConfirmation').classList.add('hidden');
        document.querySelector('.speciality-grid').classList.remove('hidden');
    });
}

// Search medicines
function searchMedicines() {
    const searchInput = document.getElementById('medicineSearch');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        alert('Please enter a medicine name to search');
        return;
    }
    
    const searchResults = medicines.filter(medicine => 
        medicine.name.toLowerCase().includes(searchTerm) ||
        medicine.category.toLowerCase().includes(searchTerm) ||
        medicine.manufacturer.toLowerCase().includes(searchTerm)
    );
    
    // Filter by 5km radius
    const nearbyResults = searchResults.filter(med => med.distance <= 5);
    
    displaySearchResults(nearbyResults, searchTerm);
}

// Display search results
function displaySearchResults(results, searchTerm) {
    const searchResultsSection = document.getElementById('searchResults');
    const searchResultsGrid = document.getElementById('searchResultsGrid');
    
    searchResultsGrid.innerHTML = '';
    
    if (results.length === 0) {
        searchResultsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                <p style="font-size: 1.2rem; color: #6b7280;">
                    No medicines found for "${searchTerm}" within 5km radius.
                </p>
                <p style="margin-top: 1rem; color: #9ca3af;">
                    Try searching with a different name or check back later.
                </p>
            </div>
        `;
    } else {
        results.forEach(medicine => {
            const card = createMedicineCard(medicine);
            searchResultsGrid.appendChild(card);
        });
    }
    
    searchResultsSection.classList.remove('hidden');
    searchResultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Show booking form
function showBookingForm(speciality) {
    // Hide speciality grid
    document.querySelector('.speciality-grid').classList.add('hidden');
    
    // Show and populate booking form
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.classList.remove('hidden');
    
    // Set speciality
    document.getElementById('speciality').value = speciality;
    
    // Scroll to form
    bookingForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hide booking form
function hideBookingForm() {
    document.getElementById('bookingForm').classList.add('hidden');
    document.querySelector('.speciality-grid').classList.remove('hidden');
    document.getElementById('consultationForm').reset();
}

// Handle consultation booking
function handleConsultationBooking(e) {
    e.preventDefault();
    
    const formData = {
        speciality: document.getElementById('speciality').value,
        name: document.getElementById('patientName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        age: document.getElementById('age').value,
        problem: document.getElementById('problemDetails').value,
        date: document.getElementById('consultationDate').value,
        time: document.getElementById('consultationTime').value
    };
    
    // Simulate booking submission
    console.log('Booking Details:', formData);
    
    // Hide form and show confirmation
    document.getElementById('bookingForm').classList.add('hidden');
    document.getElementById('bookingConfirmation').classList.remove('hidden');
    
    // Scroll to confirmation
    document.getElementById('bookingConfirmation').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
    
    // Reset form
    document.getElementById('consultationForm').reset();
}

// Set minimum date for consultation
function setMinimumDate() {
    const dateInput = document.getElementById('consultationDate');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const minDate = tomorrow.toISOString().split('T')[0];
    dateInput.setAttribute('min', minDate);
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
