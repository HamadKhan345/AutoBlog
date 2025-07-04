document.addEventListener('DOMContentLoaded', function() {
    // Elements for single and bulk delete
    const deleteModal = document.getElementById('deleteModal');
    const closeModal = document.getElementById('closeModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    const modalBody = deleteModal.querySelector('.modal-body p');
    let currentDeleteTarget = null;
    let isBulkDelete = false;
    let bulkIdsToDelete = [];

    // Single delete functionality
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            isBulkDelete = false;
            currentDeleteTarget = this.getAttribute('data-post-id');
            showDeleteModal();
        });
    });

    // Bulk delete functionality
    const selectAll = document.getElementById('selectAll');
    const postCheckboxes = document.querySelectorAll('.post-checkbox');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const bulkDeleteForm = document.getElementById('bulkDeleteForm');
    const bulkDeleteIds = document.getElementById('bulkDeleteIds');
    const selectedCount = document.getElementById('selectedCount');

    function updateBulkDeleteBtn() {
        const checked = document.querySelectorAll('.post-checkbox:checked');
        if (checked.length > 0) {
            bulkDeleteBtn.style.display = '';
            selectedCount.textContent = checked.length;
        } else {
            bulkDeleteBtn.style.display = 'none';
            selectedCount.textContent = 0;
        }
    }

    if (selectAll) {
        selectAll.addEventListener('change', function() {
            postCheckboxes.forEach(cb => cb.checked = selectAll.checked);
            updateBulkDeleteBtn();
        });
    }

    postCheckboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            if (!this.checked && selectAll.checked) {
                selectAll.checked = false;
            }
            updateBulkDeleteBtn();
        });
    });

    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener('click', function() {
            const checked = document.querySelectorAll('.post-checkbox:checked');
            if (checked.length === 0) return;
            isBulkDelete = true;
            bulkIdsToDelete = Array.from(checked).map(cb => cb.getAttribute('data-post-id'));
            showDeleteModal();
        });
    }

    // Modal logic
    function showDeleteModal() {
        deleteModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        if (isBulkDelete) {
            modalBody.textContent = `Are you sure you want to delete ${bulkIdsToDelete.length} selected posts? This action cannot be undone.`;
        } else {
            modalBody.textContent = 'Are you sure you want to delete this post? This action cannot be undone.';
        }
    }

    function hideDeleteModal() {
        deleteModal.style.display = 'none';
        document.body.style.overflow = '';
        currentDeleteTarget = null;
        isBulkDelete = false;
        bulkIdsToDelete = [];
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
            if (isBulkDelete) {
                if (bulkIdsToDelete.length > 0) {
                    bulkDeleteIds.value = bulkIdsToDelete.join(',');
                    bulkDeleteForm.submit();
                }
            } else if (currentDeleteTarget) {
                document.getElementById('deletePostId').value = currentDeleteTarget;
                document.getElementById('deleteForm').submit();
            }
            hideDeleteModal();
        });
    }

    // Initialize bulk delete button state on page load
    updateBulkDeleteBtn();
});