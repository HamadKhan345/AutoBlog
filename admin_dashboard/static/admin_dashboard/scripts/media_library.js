document.addEventListener('DOMContentLoaded', function() {
    // View Toggle
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    const mediaGrid = document.getElementById('mediaGrid');
    const mediaList = document.getElementById('mediaList');
    const gridControls = document.getElementById('gridControls');
    
    // Upload functionality
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const selectedCountSpan = document.getElementById('selectedCount');
    
    // State
    let selectedFiles = new Set();
    let currentModalFile = null;
    
    // Initialize
    updateSelectedCount();
    
    // View Toggle
    gridBtn.addEventListener('click', function() {
        showGridView();
    });
    
    listBtn.addEventListener('click', function() {
        showListView();
    });
    
    function showGridView() {
        mediaGrid.style.display = 'grid';
        mediaList.style.display = 'none';
        if (gridControls) gridControls.style.display = 'flex';
        gridBtn.classList.add('active');
        listBtn.classList.remove('active');
    }
    
    function showListView() {
        mediaGrid.style.display = 'none';
        mediaList.style.display = 'block';
        if (gridControls) gridControls.style.display = 'none';
        gridBtn.classList.remove('active');
        listBtn.classList.add('active');
    }
    
    // Upload functionality
    uploadBtn.addEventListener('click', function() {
        uploadArea.style.display = uploadArea.style.display === 'none' ? 'block' : 'none';
    });
    
    uploadZone.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFileUpload(files);
    });
    
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        handleFileUpload(files);
    });
    
    // File selection
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('media-select')) {
            const filename = e.target.getAttribute('data-filename');
            if (e.target.checked) {
                selectedFiles.add(filename);
            } else {
                selectedFiles.delete(filename);
            }
            updateSelectedCount();
        }
    });

    // Select all functionality
    const selectAllGrid = document.getElementById('selectAllGrid');
    const selectAllList = document.getElementById('selectAllList');

    if (selectAllGrid) {
        selectAllGrid.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#mediaGrid .media-select');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                const filename = checkbox.getAttribute('data-filename');
                if (this.checked) {
                    selectedFiles.add(filename);
                } else {
                    selectedFiles.delete(filename);
                }
            });
            updateSelectedCount();
        });
    }

    if (selectAllList) {
        selectAllList.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#mediaList .media-select');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
                const filename = checkbox.getAttribute('data-filename');
                if (this.checked) {
                    selectedFiles.add(filename);
                } else {
                    selectedFiles.delete(filename);
                }
            });
            updateSelectedCount();
        });
    }

    // Update delete selected button state
    function updateSelectedCount() {
        const count = selectedFiles.size;
        selectedCountSpan.textContent = count;
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        if (count > 0) {
            deleteBtn.classList.add('active');
            deleteBtn.disabled = false;
            deleteBtn.style.display = 'flex'; // Force show as flex
        } else {
            deleteBtn.classList.remove('active');
            deleteBtn.disabled = true;
            deleteBtn.style.display = 'none';
        }
        // Highlight selected items
        document.querySelectorAll('.media-item, .media-row').forEach(el => {
            const filename = el.getAttribute('data-filename');
            if (selectedFiles.has(filename)) {
                el.classList.add('selected');
            } else {
                el.classList.remove('selected');
            }
        });
    }

    // Delete selected files
    deleteSelectedBtn.addEventListener('click', function() {
        if (selectedFiles.size === 0) return;
        const message = selectedFiles.size === 1 ?
            'Are you sure you want to delete this file?' :
            `Are you sure you want to delete these ${selectedFiles.size} files?`;
        showDeleteModal(message, () => {
            deleteFiles(Array.from(selectedFiles));
        });
    });

    // Individual delete buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn') || (e.target.parentElement && e.target.parentElement.classList.contains('delete-btn'))) {
            const button = e.target.classList.contains('delete-btn') ? e.target : e.target.parentElement;
            const filename = button.getAttribute('data-filename');
            showDeleteModal('Are you sure you want to delete this file?', () => {
                deleteFiles([filename]);
            });
        }
    });

    // Copy URL functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-url-btn') || (e.target.parentElement && e.target.parentElement.classList.contains('copy-url-btn'))) {
            const button = e.target.classList.contains('copy-url-btn') ? e.target : e.target.parentElement;
            const url = button.getAttribute('data-url');
            copyToClipboard(url);
            showMessage('URL copied to clipboard!', 'success');
        }
    });

    // Upload from empty state
    const uploadFromEmpty = document.getElementById('uploadFromEmpty');
    if (uploadFromEmpty) {
        uploadFromEmpty.addEventListener('click', function() {
            uploadArea.style.display = 'block';
            fileInput.click();
        });
    }

    // Media details buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('media-details-btn') || (e.target.parentElement && e.target.parentElement.classList.contains('media-details-btn'))) {
            const button = e.target.classList.contains('media-details-btn') ? e.target : e.target.parentElement;
            const name = button.getAttribute('data-name');
            const url = button.getAttribute('data-url');
            const type = button.getAttribute('data-type');
            const size = button.getAttribute('data-size');
            const date = button.getAttribute('data-date');
            const resolution = button.getAttribute('data-resolution');
            openMediaModal(name, url, type, size, date, resolution);
        }
    });

    // Modal logic for media details
    window.openMediaModal = function(name, url, type, size, date, resolution) {
        const modal = document.getElementById('mediaModal');
        const modalBody = modal.querySelector('.media-detail-content');
        // Clear previous content
        modalBody.innerHTML = `
            <div class="media-preview-large">
                ${type === 'image' ? `<img src="${url}" alt="${name}" style="max-width:100%;max-height:300px;">` :
                type === 'video' ? `<i class="fas fa-file-video fa-4x"></i>` :
                type === 'audio' ? `<i class="fas fa-file-audio fa-4x"></i>` :
                type === 'document' ? `<i class="fas fa-file-pdf fa-4x"></i>` :
                `<i class="fas fa-file fa-4x"></i>`}
            </div>
            <div class="media-details">
                <div class="detail-group"><label>Name:</label> <input class="form-input" id="modalFileName" value="${name}" readonly></div>
                <div class="detail-group url-field"><label>URL:</label> <input class="form-input" id="modalFileUrl" value="${url}" readonly><button class="btn-copy" onclick="copyToClipboard('${url}')"><i class="fas fa-copy"></i></button></div>
                <div class="detail-info">
                    <div class="info-row"><span>Type:</span> <span id="modalFileType">${type.charAt(0).toUpperCase() + type.slice(1)}</span></div>
                    <div class="info-row"><span>Size:</span> <span id="modalFileSize">${size}</span></div>
                    ${resolution ? `<div class="info-row"><span>Resolution:</span> <span id="modalDimensions">${resolution}</span></div>` : ''}
                    <div class="info-row"><span>Date:</span> <span id="modalUploadDate">${date}</span></div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
        currentModalFile = name;
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
        currentModalFile = null;
    };

    window.deleteFromModal = function() {
        if (currentModalFile) {
            showDeleteModal('Are you sure you want to delete this file?', () => {
                deleteFiles([currentModalFile]);
                closeModal('mediaModal');
            });
        }
    };

    window.copyToClipboard = function(text) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('URL copied to clipboard!', 'success');
        }).catch(err => {
            showMessage('Failed to copy URL', 'error');
        });
    };

    // Modal close button handlers
    const closeMediaModal = document.getElementById('closeMediaModal');
    const closeMediaModalBtn = document.getElementById('closeMediaModalBtn');
    const deleteFromModalBtn = document.getElementById('deleteFromModalBtn');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelDelete = document.getElementById('cancelDelete');

    if (closeMediaModal) {
        closeMediaModal.addEventListener('click', () => closeModal('mediaModal'));
    }
    if (closeMediaModalBtn) {
        closeMediaModalBtn.addEventListener('click', () => closeModal('mediaModal'));
    }
    if (deleteFromModalBtn) {
        deleteFromModalBtn.addEventListener('click', deleteFromModal);
    }
    if (closeDeleteModal) {
        closeDeleteModal.addEventListener('click', () => closeModal('deleteModal'));
    }
    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => closeModal('deleteModal'));
    }

    // Delete files AJAX
    function deleteFiles(filenames) {
        fetch('/admin/dashboard/media/delete/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: 'files=' + encodeURIComponent(JSON.stringify(filenames))
        })
        .then(async response => {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') !== -1) {
                return response.json();
            } else {
                const text = await response.text();
                throw new Error('Server did not return JSON. Response: ' + text.substring(0, 200));
            }
        })
        .then(data => {
            if (data.success) {
                showMessage('File(s) deleted successfully!', 'success');
                // Remove deleted files from DOM
                filenames.forEach(filename => {
                    document.querySelectorAll(`[data-filename="${filename}"]`).forEach(el => {
                        el.remove();
                    });
                    selectedFiles.delete(filename);
                });
                updateSelectedCount();
            } else {
                showMessage('Some files could not be deleted: ' + (data.errors || []).join(', '), 'error');
            }
        })
        .catch(error => {
            showMessage('Delete failed: ' + error.message, 'error');
        });
    }

    // Show delete modal
    function showDeleteModal(message, onConfirm) {
        const modal = document.getElementById('deleteModal');
        const messageEl = document.getElementById('deleteMessage');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        messageEl.textContent = message;
        modal.style.display = 'flex';
        // Remove existing event listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', function() {
            modal.style.display = 'none';
            if (onConfirm) onConfirm();
        });
    }

    // Upload functionality (fix error handling)
    function handleFileUpload(files) {
        if (files.length === 0) return;
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const uploadStatus = document.getElementById('uploadStatus');
        uploadProgress.style.display = 'block';
        let uploadedCount = 0;
        const totalFiles = files.length;
        Array.from(files).forEach((file, index) => {
            const fileFormData = new FormData();
            fileFormData.append('media_file', file);
            fetch('/admin/dashboard/media_library/upload/', {
                method: 'POST',
                body: fileFormData,
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(async response => {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.indexOf('application/json') !== -1) {
                    return response.json();
                } else {
                    const text = await response.text();
                    throw new Error('Server did not return JSON. Response: ' + text.substring(0, 200));
                }
            })
            .then(data => {
                uploadedCount++;
                progressFill.style.width = ((uploadedCount / totalFiles) * 100) + '%';
                if (data.success) {
                    uploadStatus.textContent = `Uploaded ${file.name}`;
                } else {
                    uploadStatus.textContent = `Failed: ${file.name} (${data.error || (data.errors ? data.errors.join(', ') : 'Unknown error')})`;
                }
                if (uploadedCount === totalFiles) {
                    setTimeout(() => {
                        uploadProgress.style.display = 'none';
                        uploadStatus.textContent = '';
                        progressFill.style.width = '0%';
                        location.reload(); // Reload to show new files
                    }, 1000);
                }
            })
            .catch(error => {
                uploadStatus.textContent = `Upload failed: ${file.name} (${error.message})`;
                uploadedCount++;
                if (uploadedCount === totalFiles) {
                    setTimeout(() => {
                        uploadProgress.style.display = 'none';
                        uploadStatus.textContent = '';
                        progressFill.style.width = '0%';
                        location.reload();
                    }, 1000);
                }
            });
        });
    }

    // CSRF token extraction (Django standard)
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

    // Show message
    function showMessage(message, type) {
        const container = document.getElementById('messageContainer');
        const msg = document.createElement('div');
        msg.className = 'message ' + type;
        msg.textContent = message;
        container.appendChild(msg);
        setTimeout(() => {
            msg.remove();
        }, 3000);
    }

    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });
});