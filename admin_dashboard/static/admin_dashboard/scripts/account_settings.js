function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
    const btn = input.parentElement.querySelector('.password-toggle i');
    if (btn) {
        btn.classList.toggle('fa-eye-slash');
        btn.classList.toggle('fa-eye');
        
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const usernameInput = document.getElementById('newUsername');
    const charCountSpan = usernameInput
        .closest('.form-group')
        .querySelector('.char-count');
    const maxLen = parseInt(usernameInput.getAttribute('maxlength'), 10);

    function updateCharCount() {
        let val = usernameInput.value;
        if (val.length > maxLen) {
            usernameInput.value = val.slice(0, maxLen);
            val = usernameInput.value;
        }
        charCountSpan.textContent = `${val.length}/${maxLen} characters`;
    }

    usernameInput.addEventListener('input', updateCharCount);

    // Initialize on page load
    updateCharCount();
});