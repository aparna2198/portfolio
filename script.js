// Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

// 1. Check Local Storage or System Preference
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme) {
    html.setAttribute('data-theme', savedTheme);
} else if (systemPrefersDark) {
    html.setAttribute('data-theme', 'dark');
}

// 2. Toggle Handler
themeBtn.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Active Navigation Link (Desktop Side-Nav)
const sections = document.querySelectorAll('.feed-section');
const navLinks = document.querySelectorAll('.nav-link');

const observerOptions = {
    threshold: 0.2, // Trigger when 20% visible
    rootMargin: "-20% 0px -60% 0px" // Adjusted for optimal trigger zone
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Remove active from all
            navLinks.forEach(link => link.classList.remove('active'));

            // Add active to current
            const id = entry.target.getAttribute('id');
            const matchingLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (matchingLink) {
                matchingLink.classList.add('active');
            }
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// Scroll Reveal Animation
const revealElements = document.querySelectorAll('.reveal');

const revealObserverOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, revealObserverOptions);

// Initialize Animations
document.addEventListener('DOMContentLoaded', () => {
    // 1. Hero Reveal
    const heroElements = document.querySelectorAll('.id-card > *, .sidebar-nav');
    heroElements.forEach((el, index) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${index * 100}ms`;
        revealObserver.observe(el);
    });

    // 2. Feed Sections Reveal (staggered children)
    const feedItems = document.querySelectorAll('.card-item, .project-item, .feed-section > p, .feed-section > h3');
    feedItems.forEach((el) => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });

    // 3. Stagger logic for groups (optional refinement)
    // If elements are consecutive, we could add delay. 
    // For now, the natural scroll trigger + reveal class is sufficient for "live" feel.

    // 4. Initialize Tilt (Live UI)
    initTilt();
});

// 3D Tilt Logic
function initTilt() {
    const cards = document.querySelectorAll('.card-item, .project-item');

    cards.forEach(card => {
        // Add glare element
        const glare = document.createElement('div');
        glare.classList.add('glare');
        card.appendChild(glare);

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (Max 10 degrees)
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Invert Y for logic
            const rotateY = ((x - centerX) / centerX) * 5;

            // Apply Transform
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;

            // Move Glare
            glare.style.left = `${x - 100}px`; // Center 200px glare
            glare.style.top = `${y - 100}px`;
            glare.style.opacity = '1';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            glare.style.opacity = '0';
        });
    });
}

// Custom Mouse Light Effect (Subtle, for Dark Mode)
// Only activate in dark mode to avoid cluttering light mode
/* 
document.addEventListener('mousemove', (e) => {
    if (html.getAttribute('data-theme') === 'dark') {
        const x = e.clientX;
        const y = e.clientY;
        // Logic to apply a radial gradient mask or spotlight
        // Keeping it simple for now to ensure performance.
    }
});
*/
