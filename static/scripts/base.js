// Search functionality - fixed version
document.addEventListener('DOMContentLoaded', function() {
const searchIcon = document.querySelector('.search-icon');
const searchInput = document.querySelector('.search-input');

// Make sure elements exist before adding event listeners
if (searchIcon && searchInput) {
    searchIcon.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event from bubbling up
    searchInput.classList.toggle('active');
    if (searchInput.classList.contains('active')) {
        searchInput.focus();
    }
    });
}

// Mobile menu toggle with sliding animation - fixed version
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

// Create overlay if it doesn't exist
let overlay = document.querySelector('.overlay');
if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
}

if (menuToggle && nav) {
    menuToggle.addEventListener('click', function(e) {
    e.stopPropagation(); // Prevent event from bubbling up
    nav.classList.toggle('active');
    menuToggle.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Prevent scrolling when menu is open
    document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
}

// Close menu when clicking on overlay
overlay.addEventListener('click', function() {
    nav.classList.remove('active');
    menuToggle.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
});

// Close search when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.search-container') && 
        !e.target.classList.contains('search-icon')) {
    searchInput.classList.remove('active');
    }
});

// Responsive nav adjustment
window.addEventListener('resize', function() {
    if (window.innerWidth > 992) {
    nav.classList.remove('active');
    menuToggle.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    }
});

// Enable smooth scrolling for the whole site
document.documentElement.style.scrollBehavior = 'smooth';
document.body.style.scrollBehavior = 'smooth';
});