document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.getElementById('addCategoryBtn');
    const addFirstBtn = document.getElementById('addFirstCategoryBtn');
    const modal = document.getElementById('categoryModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const saveBtn = document.getElementById('saveCategoryBtn');
    const form = document.getElementById('categoryForm');
    const messageContainer = document.getElementById('messageContainer');
    const modalTitle = document.getElementById('modalTitle');
    const categoryIdInput = document.getElementById('categoryId');
    const nameInput = document.getElementById('categoryName');
    const descInput = document.getElementById('categoryDescription');
    const imageInput = document.getElementById('categoryImage');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removeImageBtn = document.getElementById('removeImage');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imageUploadArea = document.getElementById('imageUploadArea');
    let deleteCategoryId = null;
    const deleteModal = document.getElementById('deleteModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    // Open modal for Add
    function openAddModal() {
        modalTitle.textContent = 'Add New Category';
        form.reset();
        categoryIdInput.value = '';
        imagePreview.style.display = 'none';
        previewImage.src = '';
        uploadPlaceholder.style.display = '';
        modal.style.display = 'flex';
    }

    // Open modal for Edit
    function openEditModal(category) {
        modalTitle.textContent = 'Edit Category';
        form.reset();
        categoryIdInput.value = category.id;
        nameInput.value = category.name;
        descInput.value = category.description;
        if (category.thumbnail_url) {
            previewImage.src = category.thumbnail_url;
            imagePreview.style.display = '';
            uploadPlaceholder.style.display = 'none';
        } else {
            imagePreview.style.display = 'none';
            uploadPlaceholder.style.display = '';
        }
        modal.style.display = 'flex';
    }

    // Add button
    if (addBtn) addBtn.addEventListener('click', openAddModal);
    if (addFirstBtn) addFirstBtn.addEventListener('click', openAddModal);

    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = btn.closest('.category-card');
            const category = {
                id: btn.getAttribute('data-category-id'),
                name: card.querySelector('.category-name').textContent.trim(),
                description: card.querySelector('.category-description').textContent.trim(),
                thumbnail_url: card.querySelector('.category-image img').getAttribute('src')
            };
            openEditModal(category);
        });
    });

    // Close modal
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');

    // Image upload preview
    imageUploadArea.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                previewImage.src = e.target.result;
                imagePreview.style.display = '';
                uploadPlaceholder.style.display = 'none';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });
    removeImageBtn.addEventListener('click', function(e) {
        e.preventDefault();
        imageInput.value = '';
        previewImage.src = '';
        imagePreview.style.display = 'none';
        uploadPlaceholder.style.display = '';
    });

    // Save (Add/Edit) category
    saveBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        fetch('/admin/dashboard/categories/add_update/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                modal.style.display = 'none';
                showMessage(data.message || 'Success!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showMessage(data.error || 'Error.', 'error');
            }
        })
        .catch(() => showMessage('Server error.', 'error'));
    });

    // Open delete modal
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteCategoryId = btn.getAttribute('data-category-id');
            deleteModal.style.display = 'flex';
        });
    });

    // Close delete modal
    closeDeleteModal.addEventListener('click', () => deleteModal.style.display = 'none');
    cancelDelete.addEventListener('click', () => deleteModal.style.display = 'none');

    // Confirm delete
    confirmDelete.addEventListener('click', function() {
        if (!deleteCategoryId) return;
        fetch('/admin/dashboard/categories/delete/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: new URLSearchParams({category_id: deleteCategoryId})
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                deleteModal.style.display = 'none';
                showMessage('Category deleted!', 'success');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showMessage(data.error || 'Error deleting category.', 'error');
            }
        })
        .catch(() => showMessage('Server error.', 'error'));
    });

    function showMessage(msg, type) {
        messageContainer.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
        setTimeout(() => { messageContainer.innerHTML = ''; }, 3000);
    }

    // Helper to get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});