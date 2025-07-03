document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const deleteModal = document.getElementById('deleteModal');
    const closeModal = document.getElementById('closeModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    let currentDeleteTarget = null;

    // Delete functionality
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentDeleteTarget = this.dataset.postId;
            showDeleteModal();
        });
    });

    function showDeleteModal() {
        deleteModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Update modal text for single delete
        const modalBody = deleteModal.querySelector('.modal-body p');
        modalBody.textContent = 'Are you sure you want to delete this post? This action cannot be undone.';
    }

    function hideDeleteModal() {
        deleteModal.style.display = 'none';
        document.body.style.overflow = '';
        currentDeleteTarget = null;
    }

    if (closeModal) closeModal.addEventListener('click', hideDeleteModal);
    if (cancelDelete) cancelDelete.addEventListener('click', hideDeleteModal);

    // Close modal when clicking overlay
    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });

    confirmDelete.addEventListener('click', function() {
        // No simulation or reset, just close the modal for now
        hideDeleteModal();
    });

    // Submit form on Enter in search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.form.submit();
            }
        });
    }
});