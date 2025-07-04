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
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default button action
            currentDeleteTarget = this.getAttribute('data-post-id');
            showDeleteModal();
        });
    });

    function showDeleteModal() {
        deleteModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
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

    if (confirmDelete) {
        confirmDelete.addEventListener('click', function() {
            if (currentDeleteTarget) {
                document.getElementById('deletePostId').value = currentDeleteTarget;
                document.getElementById('deleteForm').submit();
            }
            hideDeleteModal();
        });
    }
});