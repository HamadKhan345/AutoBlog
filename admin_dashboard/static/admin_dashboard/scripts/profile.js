document.addEventListener('DOMContentLoaded', function() {
    const editBtn = document.getElementById('editProfileBtn');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const formInputs = document.querySelectorAll('#profileForm input, #profileForm textarea');
    const passwordSection = document.getElementById('passwordSection');
    const formActions = document.getElementById('formActions');
    const avatarContainer = document.getElementById('avatarContainer');
    const avatarInput = document.getElementById('avatarInput');
    const profileForm = document.getElementById('profileForm');
    const profileAvatar = document.getElementById('profileAvatar');

    // Enable edit mode
    editBtn.addEventListener('click', function() {
        formInputs.forEach(input => {
            if (input.name !== 'email') input.removeAttribute('readonly');
        });
        passwordSection.style.display = 'block';
        formActions.style.display = 'flex';
        editBtn.style.display = 'none';
        avatarContainer.classList.add('editable');
    });

    // Cancel edit mode
    cancelBtn.addEventListener('click', function() {
        formInputs.forEach(input => input.setAttribute('readonly', true));
        passwordSection.style.display = 'none';
        formActions.style.display = 'none';
        editBtn.style.display = 'inline-flex';
        avatarContainer.classList.remove('editable');
        profileForm.reset();
    });

    // Avatar click to trigger file input
    avatarContainer.addEventListener('click', function() {
        if (avatarContainer.classList.contains('editable')) {
            avatarInput.click();
        }
    });

    // Preview avatar image
    avatarInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                profileAvatar.src = ev.target.result;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
});

// Password toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}