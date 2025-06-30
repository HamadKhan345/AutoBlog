/* filepath: admin_dashboard/static/admin_dashboard/scripts/login.js */
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    const usernameInput = document.getElementById('username');
    
    // Password visibility toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (type === 'password') {
              icon.classList.remove('fa-eye');
              icon.classList.add('fa-eye-slash');
              
            } else {
              icon.classList.remove('fa-eye-slash');
              icon.classList.add('fa-eye');
            }
        });
    }
    
    // Form submission handling
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            // Clear previous errors
            clearErrors();
            
            // Validate form
            if (!validateForm()) {
                e.preventDefault();
                return;
            }
            
            // Show loading state
            setLoadingState(true);
        });
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!username) {
            showFieldError(usernameInput, 'Username is required');
            isValid = false;
        }
        
        if (!password) {
            showFieldError(passwordInput, 'Password is required');
            isValid = false;
        } else if (password.length < 3) {
            showFieldError(passwordInput, 'Password must be at least 3 characters');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show field error
    function showFieldError(field, message) {
        const inputGroup = field.closest('.input-group');
        inputGroup.classList.add('error');
        
        // Remove existing error message
        const existingError = inputGroup.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--danger-color);
            font-size: 0.85rem;
            margin-top: 0.3rem;
            display: flex;
            align-items: center;
            gap: 0.3rem;
        `;
        
        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-circle';
        errorDiv.insertBefore(icon, errorDiv.firstChild);
        
        inputGroup.parentNode.appendChild(errorDiv);
        
        // Focus the field
        field.focus();
    }
    
    // Clear all errors
    function clearErrors() {
        const errorInputs = document.querySelectorAll('.input-group.error');
        const errorMessages = document.querySelectorAll('.field-error');
        
        errorInputs.forEach(input => input.classList.remove('error'));
        errorMessages.forEach(msg => msg.remove());
    }
    
    // Set loading state
    function setLoadingState(loading) {
        if (loading) {
            loginBtn.disabled = true;
            loginBtn.classList.add('loading');
            loginBtn.innerHTML = `
                <i class="fas fa-spinner loading-spinner"></i>
                <span>Signing In...</span>
            `;
        } else {
            loginBtn.disabled = false;
            loginBtn.classList.remove('loading');
            loginBtn.innerHTML = `
                <i class="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
            `;
        }
    }
    
    // Clear errors when user starts typing
    [usernameInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener('input', function() {
                const inputGroup = this.closest('.input-group');
                inputGroup.classList.remove('error');
                
                const errorMsg = inputGroup.parentNode.querySelector('.field-error');
                if (errorMsg) {
                    errorMsg.remove();
                }
            });
            
            // Clear errors on focus
            input.addEventListener('focus', function() {
                const inputGroup = this.closest('.input-group');
                inputGroup.classList.remove('error');
            });
        }
    });
    
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
        }, 5000);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Enter key submits form
        if (e.key === 'Enter' && (document.activeElement === usernameInput || document.activeElement === passwordInput)) {
            loginForm.dispatchEvent(new Event('submit'));
        }
        
        // ESC key clears form
        if (e.key === 'Escape') {
            if (usernameInput) usernameInput.value = '';
            if (passwordInput) passwordInput.value = '';
            clearErrors();
        }
    });
    
    // Success state simulation (remove in production)
    function showSuccessState() {
        loginBtn.classList.add('success');
        loginBtn.innerHTML = `
            <i class="fas fa-check"></i>
            <span>Success!</span>
        `;
        
        setTimeout(() => {
            loginBtn.classList.remove('success');
            setLoadingState(false);
        }, 1500);
    }
    
    // Focus username field on load
    if (usernameInput) {
        usernameInput.focus();
    }
    
    console.log('Login page initialized successfully');
});