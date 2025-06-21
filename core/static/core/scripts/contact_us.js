document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const submitBtn = form.querySelector('.btn-submit');
  const originalBtnText = submitBtn.innerHTML;

  function validateForm() {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    
    clearErrors();
    let isValid = true;
    
    if (!name) {
      showError('name', 'Full name is required');
      isValid = false;
    }
    
    if (!email) {
      showError('email', 'Email address is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!message) {
      showError('message', 'Message is required');
      isValid = false;
    }
    
    return isValid;
  }
  
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function showError(fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"]`);
    const formGroup = field.closest('.form-group');
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
  }
  
  function clearErrors() {
    const errorFields = form.querySelectorAll('.error');
    const errorMessages = form.querySelectorAll('.error-message');
    
    errorFields.forEach(field => field.classList.remove('error'));
    errorMessages.forEach(msg => msg.remove());
  }
  
  function showSuccess() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully.';
    
    form.insertBefore(successDiv, form.firstChild);
    
    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }
  
  function setButtonLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    } else {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setButtonLoading(true);
    
    setTimeout(() => {
      setButtonLoading(false);
      showSuccess();
      form.reset();
    }, 2000);
  });
  
  const inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.classList.remove('error');
    });
  });
});