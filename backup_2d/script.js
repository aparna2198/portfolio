// Theme Toggle Logic
const themeToggleBtn = document.querySelector('.theme-toggle');
const themeIcon = themeToggleBtn.querySelector('i');

// Check for saved theme preference or system preference
const savedTheme = localStorage.getItem('theme');
const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
const initialTheme = savedTheme || systemTheme;

// Apply initial theme
document.documentElement.setAttribute('data-theme', initialTheme);
updateThemeIcon(initialTheme);

function updateThemeIcon(theme) {
    if (theme === 'light') {
        themeIcon.setAttribute('data-lucide', 'moon');
    } else {
        themeIcon.setAttribute('data-lucide', 'sun');
    }
    lucide.createIcons();
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Mobile Menu Toggle
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

mobileMenuBtn.addEventListener('click', () => {
    const isExpanded = navLinks.style.display === 'flex';
    navLinks.style.display = isExpanded ? 'none' : 'flex';

    if (!isExpanded) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'var(--mobile-menu-bg)';
        navLinks.style.padding = '2rem';
        navLinks.style.borderBottom = '1px solid var(--border)';
    }
});

// Smooth Scroll for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Close mobile menu if open
        if (window.innerWidth <= 768) {
            navLinks.style.display = 'none';
        }

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        navbar.style.background = 'var(--nav-scrolled)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.background = 'var(--nav-bg)';
    }
});

// Intersection Observer for Fade-in Animation
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease-out';
    observer.observe(section);
});
