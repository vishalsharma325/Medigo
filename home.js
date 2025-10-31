// Mobile menu toggle + interactive navbar
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
            });
        });
    }

    // Add shadow/blur when scrolling
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
