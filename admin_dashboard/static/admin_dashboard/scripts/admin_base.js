/* filepath: admin_dashboard/static/admin_dashboard/scripts/admin_base.js */
document.addEventListener('DOMContentLoaded', function() {
    // Enable smooth scrolling for the whole admin dashboard
    document.documentElement.style.scrollBehavior = 'smooth';
    document.body.style.scrollBehavior = 'smooth';

    // Sidebar elements
    const sidebar = document.getElementById('adminSidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    // Create mobile overlay
    let mobileOverlay = document.querySelector('.mobile-overlay');
    if (!mobileOverlay) {
        mobileOverlay = document.createElement('div');
        mobileOverlay.className = 'mobile-overlay';
        document.body.appendChild(mobileOverlay);
    }

    // Check if we're on mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Desktop sidebar toggle functionality
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Only work on desktop
            if (!isMobile()) {
                sidebar.classList.toggle('collapsed');
                
                // Save state to localStorage
                const isCollapsed = sidebar.classList.contains('collapsed');
                localStorage.setItem('adminSidebarCollapsed', isCollapsed);
                
                // Update toggle button icon
                const icon = this.querySelector('i');
                if (isCollapsed) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-chevron-right');
                } else {
                    icon.classList.remove('fa-chevron-right');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // Mobile menu toggle functionality
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isOpen = sidebar.classList.contains('mobile-open');
            
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    function openMobileMenu() {
        sidebar.classList.add('mobile-open');
        mobileOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close mobile menu when clicking overlay
    mobileOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });

    // Restore sidebar state from localStorage (desktop only)
    function restoreSidebarState() {
        if (!isMobile()) {
            const savedCollapsedState = localStorage.getItem('adminSidebarCollapsed');
            if (savedCollapsedState === 'true') {
                sidebar.classList.add('collapsed');
                const toggleIcon = sidebarToggle?.querySelector('i');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-bars');
                    toggleIcon.classList.add('fa-chevron-right');
                }
            }
        } else {
            // Remove collapsed class on mobile
            sidebar.classList.remove('collapsed');
            const toggleIcon = sidebarToggle?.querySelector('i');
            if (toggleIcon) {
                toggleIcon.classList.remove('fa-chevron-right');
                toggleIcon.classList.add('fa-bars');
            }
        }
    }

    // Initial state setup
    restoreSidebarState();

    // Submenu functionality
    const submenuItems = document.querySelectorAll('.nav-item.has-submenu > .nav-link');
    submenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const parentItem = this.parentElement;
            const isOpen = parentItem.classList.contains('open');
            const isSidebarCollapsed = sidebar.classList.contains('collapsed') && !isMobile();
            
            // Don't open submenus when sidebar is collapsed on desktop
            if (isSidebarCollapsed) {
                return;
            }
            
            // Close all other submenus
            document.querySelectorAll('.nav-item.has-submenu.open').forEach(openItem => {
                if (openItem !== parentItem) {
                    openItem.classList.remove('open');
                }
            });
            
            // Toggle current submenu
            parentItem.classList.toggle('open', !isOpen);
        });
    });

    // Close submenus when sidebar is collapsed on desktop
    if (sidebar) {
        sidebar.addEventListener('transitionend', function() {
            if (this.classList.contains('collapsed') && !isMobile()) {
                document.querySelectorAll('.nav-item.has-submenu.open').forEach(item => {
                    item.classList.remove('open');
                });
            }
        });
    }

    // User dropdown functionality
    const userMenu = document.querySelector('.user-menu');
    const userMenuBtn = document.querySelector('.user-menu-btn');
    
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            userMenu.classList.toggle('open');
        });
    }

    // Close user dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (userMenu && !userMenu.contains(e.target)) {
            userMenu.classList.remove('open');
        }
    });

    // Alert close functionality
    const closeAlerts = document.querySelectorAll('.close-alert');
    closeAlerts.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const alert = this.parentElement;
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                alert.remove();
            }, 300);
        });
    });

    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const closeBtn = alert.querySelector('.close-alert');
            if (closeBtn) {
                closeBtn.click();
            }
        }, 5000);
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        const wasMobile = document.body.classList.contains('mobile-mode');
        const nowMobile = isMobile();
        
        if (nowMobile !== wasMobile) {
            if (nowMobile) {
                // Switching to mobile
                document.body.classList.add('mobile-mode');
                closeMobileMenu();
                sidebar.classList.remove('collapsed');
                
                // Reset desktop toggle button
                const toggleIcon = sidebarToggle?.querySelector('i');
                if (toggleIcon) {
                    toggleIcon.classList.remove('fa-chevron-right');
                    toggleIcon.classList.add('fa-bars');
                }
            } else {
                // Switching to desktop
                document.body.classList.remove('mobile-mode');
                closeMobileMenu();
                restoreSidebarState();
            }
        }
        
        // Always close mobile menu when resizing to desktop
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu and dropdowns
        if (e.key === 'Escape') {
            if (sidebar.classList.contains('mobile-open')) {
                closeMobileMenu();
            }
            if (userMenu && userMenu.classList.contains('open')) {
                userMenu.classList.remove('open');
            }
        }
    });

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const selector = this.getAttribute('href');
            // Only scroll if selector is not just '#' and not empty
            if (selector && selector !== '#' && selector.length > 1) {
                const target = document.querySelector(selector);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Loading state for navigation links
    const navLinksWithActions = document.querySelectorAll('.nav-link[href]:not([href="#"])');
    navLinksWithActions.forEach(link => {
        link.addEventListener('click', function() {
            // Add loading state
            this.style.opacity = '0.6';
            this.style.pointerEvents = 'none';
            
            // Reset after a short delay (for visual feedback)
            setTimeout(() => {
                this.style.opacity = '';
                this.style.pointerEvents = '';
            }, 1000);
        });
    });

    // Initialize mobile mode class
    if (isMobile()) {
        document.body.classList.add('mobile-mode');
    }

    // Console log for debugging
    console.log('Admin Dashboard initialized successfully');
    console.log('Mobile mode:', isMobile());
});