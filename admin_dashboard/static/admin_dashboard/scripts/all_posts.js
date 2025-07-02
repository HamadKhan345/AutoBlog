document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const selectAllCheckbox = document.getElementById('selectAll');
    const postCheckboxes = document.querySelectorAll('.post-checkbox');
    const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
    const selectedCountSpan = document.getElementById('selectedCount');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const deleteModal = document.getElementById('deleteModal');
    const closeModal = document.getElementById('closeModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');

    let selectedPosts = new Set();
    let currentDeleteTarget = null;

    // Select All functionality
    selectAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        postCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const postId = checkbox.dataset.postId;
            if (isChecked) {
                selectedPosts.add(postId);
            } else {
                selectedPosts.delete(postId);
            }
        });
        updateBulkDeleteButton();
    });

    // Individual checkbox functionality
    postCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const postId = this.dataset.postId;
            if (this.checked) {
                selectedPosts.add(postId);
            } else {
                selectedPosts.delete(postId);
                selectAllCheckbox.checked = false;
            }
            
            // Check if all are selected
            const allChecked = Array.from(postCheckboxes).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
            
            updateBulkDeleteButton();
        });
    });

    // Update bulk delete button visibility and count
    function updateBulkDeleteButton() {
        const count = selectedPosts.size;
        selectedCountSpan.textContent = count;
        
        if (count > 0) {
            bulkDeleteBtn.style.display = 'inline-flex';
        } else {
            bulkDeleteBtn.style.display = 'none';
        }
    }

    // Search only on Enter key press
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Filter functionality - trigger server-side search only on change
    statusFilter.addEventListener('change', performSearch);
    categoryFilter.addEventListener('change', performSearch);

    function performSearch() {
        const searchTerm = searchInput.value.trim();
        const statusValue = statusFilter.value;
        const categoryValue = categoryFilter.value;
        
        // Build URL with search parameters
        const url = new URL(window.location.href);
        url.searchParams.set('page', 1); // Reset to page 1 for new search
        
        if (searchTerm) {
            url.searchParams.set('search', searchTerm);
        } else {
            url.searchParams.delete('search');
        }
        
        if (statusValue) {
            url.searchParams.set('status', statusValue);
        } else {
            url.searchParams.delete('status');
        }
        
        if (categoryValue) {
            url.searchParams.set('category', categoryValue);
        } else {
            url.searchParams.delete('category');
        }
        
        // Redirect to new URL with filters
        window.location.href = url.toString();
    }

    // Set filter values on page load to preserve state
    function setFilterValues() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Set status filter
        const statusValue = urlParams.get('status');
        if (statusValue) {
            statusFilter.value = statusValue;
        }
        
        // Set category filter  
        const categoryValue = urlParams.get('category');
        if (categoryValue) {
            categoryFilter.value = categoryValue;
        }
        
        // Search input value is already set by Django template
    }

    // Delete functionality
    const deleteButtons = document.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentDeleteTarget = 'single';
            const postId = this.dataset.postId;
            selectedPosts.clear();
            selectedPosts.add(postId);
            showDeleteModal();
        });
    });

    bulkDeleteBtn.addEventListener('click', function() {
        if (selectedPosts.size > 0) {
            currentDeleteTarget = 'bulk';
            showDeleteModal();
        }
    });

    function showDeleteModal() {
        deleteModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Update modal text based on deletion type
        const modalBody = deleteModal.querySelector('.modal-body p');
        if (currentDeleteTarget === 'single') {
            modalBody.textContent = 'Are you sure you want to delete this post? This action cannot be undone.';
        } else {
            modalBody.textContent = `Are you sure you want to delete ${selectedPosts.size} selected posts? This action cannot be undone.`;
        }
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
        if (currentDeleteTarget === 'single') {
            // Handle single post deletion
            console.log('Deleting single post:', Array.from(selectedPosts)[0]);
            // TODO: Make AJAX call to delete single post
        } else if (currentDeleteTarget === 'bulk') {
            // Handle bulk deletion
            console.log('Deleting posts:', Array.from(selectedPosts));
            // TODO: Make AJAX call to delete multiple posts
        }
        
        // For now, just simulate deletion
        hideDeleteModal();
        
        // Reset selections
        selectedPosts.clear();
        postCheckboxes.forEach(cb => cb.checked = false);
        selectAllCheckbox.checked = false;
        updateBulkDeleteButton();
        
        // Show success message
        showSuccessMessage('Post(s) deleted successfully!');
        
        // Reload page to reflect changes
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    });

    // View and Edit button functionality
    const editButtons = document.querySelectorAll('.btn-edit');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.dataset.postId;
            // Redirect to edit post page
            window.location.href = `/admin/posts/${postId}/edit/`;
        });
    });

    // Success message function
    function showSuccessMessage(message) {
        // Create and show a success alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-success';
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 9999;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        alert.innerHTML = `
            <i class="fas fa-check-circle"></i>
            ${message}
            <button class="close-alert" style="background:none;border:none;font-size:18px;cursor:pointer;margin-left:10px;">&times;</button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
        
        // Close button functionality
        alert.querySelector('.close-alert').addEventListener('click', () => {
            alert.remove();
        });
    }

    // Clear search functionality
    function addClearSearchButton() {
        if (searchInput.value.trim()) {
            const clearBtn = document.createElement('button');
            clearBtn.innerHTML = '&times;';
            clearBtn.style.cssText = `
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #999;
            `;
            
            clearBtn.addEventListener('click', () => {
                searchInput.value = '';
                performSearch();
            });
            
            const searchBox = searchInput.parentElement;
            if (searchBox && !searchBox.querySelector('.clear-search')) {
                clearBtn.className = 'clear-search';
                searchBox.style.position = 'relative';
                searchBox.appendChild(clearBtn);
            }
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + A to select all
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && document.activeElement !== searchInput) {
            e.preventDefault();
            selectAllCheckbox.checked = true;
            selectAllCheckbox.dispatchEvent(new Event('change'));
        }
        
        // Delete key to delete selected
        if (e.key === 'Delete' && selectedPosts.size > 0 && document.activeElement !== searchInput) {
            e.preventDefault();
            currentDeleteTarget = 'bulk';
            showDeleteModal();
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && deleteModal.style.display === 'flex') {
            hideDeleteModal();
        }
        
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // Initialize
    updateBulkDeleteButton();
    setFilterValues();
    addClearSearchButton();
});