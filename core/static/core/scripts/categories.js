// Simple categories page enhancements
document.addEventListener('DOMContentLoaded', function() {
    console.log('Categories page loaded');
    
    // Handle image loading for smooth transitions
    const images = document.querySelectorAll('.category-image img');
    
    images.forEach(img => {
        if (img.complete) {
            img.classList.add('loaded');
        } else {
            img.addEventListener('load', function() {
                this.classList.add('loaded');
            });
            
            // Fallback for failed images
            img.addEventListener('error', function() {
                this.style.opacity = '1';
                this.style.background = '#f8f9fa';
            });
        }
    });
    
    // Optional: Add subtle click feedback
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            // Add brief loading state
            this.style.opacity = '0.8';
            
            // Reset after navigation
            setTimeout(() => {
                this.style.opacity = '1';
            }, 200);
        });
    });
});
