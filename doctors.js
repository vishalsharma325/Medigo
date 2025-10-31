// Sample Doctors Database
const doctors = [
    { id: 1, name: "Dr. Rajesh Kumar", speciality: "General Physician", hospital: "City Care Hospital", experience: 15, rating: 4.8, patients: 2500, regularFee: 500, emergencyFee: 1500 },
    { id: 2, name: "Dr. Priya Sharma", speciality: "Cardiologist", hospital: "Heart & Care Medical Center", experience: 12, rating: 4.9, patients: 1800, regularFee: 800, emergencyFee: 2000 },
    { id: 3, name: "Dr. Amit Patel", speciality: "Dermatologist", hospital: "Skin Health Clinic", experience: 10, rating: 4.7, patients: 2200, regularFee: 600, emergencyFee: 1800 },
    { id: 4, name: "Dr. Sneha Reddy", speciality: "Pediatrician", hospital: "Children's Wellness Hospital", experience: 8, rating: 4.9, patients: 3000, regularFee: 500, emergencyFee: 1500 },
    { id: 5, name: "Dr. Vikram Singh", speciality: "Orthopedic", hospital: "Bone & Joint Specialty Center", experience: 18, rating: 4.8, patients: 1500, regularFee: 700, emergencyFee: 2000 },
    { id: 6, name: "Dr. Anjali Mehta", speciality: "Psychiatrist", hospital: "Mind Care Institute", experience: 14, rating: 4.9, patients: 1200, regularFee: 900, emergencyFee: 2200 },
    { id: 7, name: "Dr. Suresh Gupta", speciality: "General Physician", hospital: "Medicare Multispecialty Hospital", experience: 20, rating: 4.7, patients: 3500, regularFee: 450, emergencyFee: 1400 },
    { id: 8, name: "Dr. Kavita Verma", speciality: "Cardiologist", hospital: "Apollo Heart Institute", experience: 16, rating: 4.9, patients: 2000, regularFee: 850, emergencyFee: 2100 },
    { id: 9, name: "Dr. Rahul Joshi", speciality: "Dermatologist", hospital: "Glow Skin Clinic", experience: 7, rating: 4.6, patients: 1500, regularFee: 550, emergencyFee: 1700 },
    { id: 10, name: "Dr. Neha Kapoor", speciality: "Pediatrician", hospital: "Little Angels Children Hospital", experience: 11, rating: 4.8, patients: 2800, regularFee: 550, emergencyFee: 1600 },
    { id: 11, name: "Dr. Manoj Rao", speciality: "Orthopedic", hospital: "Ortho Care Hospital", experience: 13, rating: 4.7, patients: 1700, regularFee: 650, emergencyFee: 1900 },
    { id: 12, name: "Dr. Pooja Iyer", speciality: "Psychiatrist", hospital: "Serenity Mental Health Center", experience: 9, rating: 4.8, patients: 1000, regularFee: 800, emergencyFee: 2000 }
];

let currentSpeciality = 'all';
let selectedDoctor = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayDoctors(doctors);
    setupEventListeners();
    setMinimumDates();

    // Navbar scroll effect
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
});

// Display doctors
function displayDoctors(doctorList) {
    const doctorsGrid = document.getElementById('doctorsGrid');
    doctorsGrid.innerHTML = '';
    
    const filteredDoctors = currentSpeciality === 'all' 
        ? doctorList 
        : doctorList.filter(doc => doc.speciality === currentSpeciality);
    
    filteredDoctors.forEach(doctor => {
        const card = createDoctorCard(doctor);
        doctorsGrid.appendChild(card);
    });
}

// Create doctor card
function createDoctorCard(doctor) {
    const card = document.createElement('div');
    card.className = 'doctor-card';
    
    const initial = doctor.name.charAt(3);
    
    card.innerHTML = `
        <div class="doctor-card-header">
            <div class="doctor-avatar">${initial}</div>
            <div class="doctor-info">
                <h3>${doctor.name}</h3>
                <p class="doctor-speciality">${doctor.speciality}</p>
            </div>
        </div>
        <div class="doctor-details">
            <div class="doctor-detail">
                <span class="doctor-detail-icon">🏥</span>
                <span>${doctor.hospital}</span>
            </div>
            <div class="doctor-detail">
                <span class="doctor-detail-icon">💼</span>
                <span>${doctor.experience} years experience</span>
            </div>
            <div class="doctor-detail">
                <span class="doctor-detail-icon">👥</span>
                <span>${doctor.patients}+ patients treated</span>
            </div>
        </div>
        <div class="doctor-rating">
            <span class="rating-stars">⭐ ${doctor.rating}</span>
            <span style="color:#6b7280;">(Excellent)</span>
        </div>
        <div class="doctor-fees">
            <div class="fee-item">
                <div class="fee-label">Regular</div>
                <div class="fee-amount">₹${doctor.regularFee}</div>
            </div>
            <div class="fee-item">
                <div class="fee-label">Emergency</div>
                <div class="fee-amount">₹${doctor.emergencyFee}</div>
            </div>
        </div>
        <button class="btn btn-primary" onclick="openBookingModal(${doctor.id})">Book Appointment</button>
    `;
    
    return card;
}

// Open booking modal
function openBookingModal(doctorId) {
    selectedDoctor = doctors.find(d => d.id === doctorId);
    
    document.getElementById('bookingDoctorName').textContent = selectedDoctor.name;
    document.getElementById('bookingDoctorSpeciality').textContent = selectedDoctor.speciality;
    document.getElementById('bookingDoctorHospital').textContent = selectedDoctor.hospital;
    document.getElementById('regularPrice').textContent = `₹${selectedDoctor.regularFee}`;
    document.getElementById('emergencyPrice').textContent = `₹${selectedDoctor.emergencyFee}`;
    document.getElementById('totalConsultationFee').textContent = `₹${selectedDoctor.regularFee}`;
    
    document.getElementById('bookingModal').classList.remove('hidden');
}

// Setup event listeners
function setupEventListeners() {
    // Mobile menu
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    menuToggle.addEventListener('click', () => { navLinks.classList.toggle('active'); menuToggle.classList.toggle('open'); });
    
    // Speciality filter
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentSpeciality = this.getAttribute('data-speciality');
            displayDoctors(doctors);
        });
    });
    
    // Booking type selection
    const bookingTypeRadios = document.querySelectorAll('input[name="bookingType"]');
    bookingTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const regularSection = document.getElementById('regularDateSection');
            const emergencySection = document.getElementById('emergencyTimeSection');
            const totalFee = document.getElementById('totalConsultationFee');
            
            if (this.value === 'regular') {
                regularSection.classList.remove('hidden');
                emergencySection.classList.add('hidden');
                totalFee.textContent = `₹${selectedDoctor.regularFee}`;
            } else {
                regularSection.classList.add('hidden');
                emergencySection.classList.remove('hidden');
                totalFee.textContent = `₹${selectedDoctor.emergencyFee}`;
            }
        });
    });
    
    // Close booking modal
    const closeBooking = document.getElementById('closeBooking');
    closeBooking.addEventListener('click', () => {
        document.getElementById('bookingModal').classList.add('hidden');
        document.getElementById('doctorBookingForm').reset();
    });
    
    // Submit booking form
    const bookingForm = document.getElementById('doctorBookingForm');
    bookingForm.addEventListener('submit', handleBooking);
    
    // Back to doctors
    const backToDoctors = document.getElementById('backToDoctors');
    backToDoctors.addEventListener('click', () => {
        document.getElementById('bookingConfirmationModal').classList.add('hidden');
        document.getElementById('doctorBookingForm').reset();
    });
}

// Handle booking
function handleBooking(e) {
    e.preventDefault();
    
    const bookingType = document.querySelector('input[name="bookingType"]:checked').value;
    const appointmentDate = bookingType === 'regular' 
        ? document.getElementById('appointmentDate').value 
        : document.getElementById('emergencyDate').value;
    const appointmentTime = bookingType === 'regular' 
        ? '2:00 PM - 4:00 PM' 
        : formatTime(document.getElementById('emergencyTime').value);
    const fee = bookingType === 'regular' 
        ? selectedDoctor.regularFee 
        : selectedDoctor.emergencyFee;
    
    // Generate appointment ID
    const appointmentId = 'APT' + Date.now().toString().slice(-8);

    // Push to hospital inbox
    try {
        const appt = {
            id: appointmentId,
            createdAt: new Date().toISOString(),
            type: bookingType === 'regular' ? 'Regular' : 'Emergency',
            date: appointmentDate,
            time: bookingType === 'regular' ? '2:00 PM - 4:00 PM' : appointmentTime,
            fee,
            status: 'new',
            doctor: { id: selectedDoctor.id, name: selectedDoctor.name, speciality: selectedDoctor.speciality, hospital: selectedDoctor.hospital },
            patient: {
                name: document.getElementById('patientName').value.trim(),
                email: document.getElementById('patientEmail').value.trim(),
                phone: document.getElementById('patientPhone').value.trim(),
                age: document.getElementById('patientAge').value.trim(),
                gender: document.getElementById('patientGender').value,
                problem: document.getElementById('problemDetails').value.trim()
            }
        };
        const KEY = 'hospital:inbox';
        const inbox = JSON.parse(localStorage.getItem(KEY) || '[]');
        inbox.push(appt);
        localStorage.setItem(KEY, JSON.stringify(inbox));
        localStorage.setItem(KEY + ':lastUpdate', Date.now().toString());
    } catch (err) { console.warn('Failed to push appointment', err); }
    
    // Display confirmation
    document.getElementById('confirmedDoctor').textContent = selectedDoctor.name;
    document.getElementById('confirmedDate').textContent = formatDate(appointmentDate);
    document.getElementById('confirmedTime').textContent = appointmentTime;
    document.getElementById('confirmedType').textContent = bookingType === 'regular' ? 'Regular Appointment' : 'Emergency Appointment';
    document.getElementById('confirmedFee').textContent = `₹${fee}`;
    document.getElementById('appointmentId').textContent = appointmentId;
    
    // Hide booking modal and show confirmation
    document.getElementById('bookingModal').classList.add('hidden');
    document.getElementById('bookingConfirmationModal').classList.remove('hidden');
}

// Format time
function formatTime(time24) {
    const [hour, minute] = time24.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Set minimum dates
function setMinimumDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    
    document.getElementById('appointmentDate').setAttribute('min', minDate);
    
    // For emergency, allow same day
    const todayDate = today.toISOString().split('T')[0];
    document.getElementById('emergencyDate').setAttribute('min', todayDate);
}
