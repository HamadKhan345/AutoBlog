/* filepath: admin_dashboard/static/admin_dashboard/scripts/login.js */
document.addEventListener('DOMContentLoaded', function() {
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    
    // Password visibility toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('span');
            if (type === 'password') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    // Alert close functionality
    const closeAlerts = document.querySelectorAll('.close-alert');
    closeAlerts.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const alert = this.parentElement;
            alert.style.opacity = '0';
            alert.style.transform = 'translateY(-10px)';
            
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
        }, 15000);
    });
    
    // Focus username field on load
    if (usernameInput) {
        usernameInput.focus();
    }
});