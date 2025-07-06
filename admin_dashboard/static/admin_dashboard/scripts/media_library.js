document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const gridBtn = document.getElementById('gridView');
    const listBtn = document.getElementById('listView');
    const mediaGrid = document.getElementById('mediaGrid');
    const mediaList = document.getElementById('mediaList');
    const gridControls = document.getElementById('gridControls');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const selectedCountSpan = document.getElementById('selectedCount');
    const selectAllGrid = document.getElementById('selectAllGrid');
    const selectAllList = document.getElementById('selectAllList');
    const uploadFromEmpty = document.getElementById('uploadFromEmpty');
    let selectedFiles = new Set();
    let currentModalFile = null;

    // --- VIEW TOGGLE ---
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
    if (gridBtn) gridBtn.addEventListener('click', showGridView);
    if (listBtn) listBtn.addEventListener('click', showListView);

    // --- UPLOAD ---
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function () {
            uploadArea.style.display = uploadArea.style.display === 'none' ? 'block' : 'none';
        });
    }
    if (uploadZone) {
        uploadZone.addEventListener('click', function () {
            fileInput.click();
        });
        uploadZone.addEventListener('dragover', function (e) {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadZone.addEventListener('dragleave', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        uploadZone.addEventListener('drop', function (e) {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFileUpload(e.dataTransfer.files);
        });
    }
    if (fileInput) {
        fileInput.addEventListener('change', function (e) {
            handleFileUpload(e.target.files);
        });
    }
    if (uploadFromEmpty) {
        uploadFromEmpty.addEventListener('click', function () {
            uploadArea.style.display = 'block';
            fileInput.click();
        });
    }

    // --- FILE SELECTION & SELECT ALL ---
    document.addEventListener('change', function (e) {
        if (e.target.classList.contains('media-select')) {
            const filename = e.target.getAttribute('data-filename');
            if (e.target.checked) selectedFiles.add(filename);
            else selectedFiles.delete(filename);
            updateSelectedCount();
        }
        if (e.target === selectAllGrid) {
            document.querySelectorAll('#mediaGrid .media-select').forEach(cb => {
                cb.checked = selectAllGrid.checked;
                const filename = cb.getAttribute('data-filename');
                if (selectAllGrid.checked) selectedFiles.add(filename);
                else selectedFiles.delete(filename);
            });
            updateSelectedCount();
        }
        if (e.target === selectAllList) {
            document.querySelectorAll('#mediaList .media-select').forEach(cb => {
                cb.checked = selectAllList.checked;
                const filename = cb.getAttribute('data-filename');
                if (selectAllList.checked) selectedFiles.add(filename);
                else selectedFiles.delete(filename);
            });
            updateSelectedCount();
        }
    });

    function updateSelectedCount() {
        const count = selectedFiles.size;
        selectedCountSpan.textContent = count;
        if (count > 0) {
            deleteSelectedBtn.classList.add('active');
            deleteSelectedBtn.disabled = false;
            deleteSelectedBtn.style.display = 'flex';
        } else {
            deleteSelectedBtn.classList.remove('active');
            deleteSelectedBtn.disabled = true;
            deleteSelectedBtn.style.display = 'none';
        }
        document.querySelectorAll('.media-item, .media-row').forEach(el => {
            const filename = el.getAttribute('data-filename');
            if (selectedFiles.has(filename)) el.classList.add('selected');
            else el.classList.remove('selected');
        });
    }

    // --- DELETE SELECTED ---
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', function () {
            if (selectedFiles.size === 0) return;
            const msg = selectedFiles.size === 1 ?
                'Are you sure you want to delete this file?' :
                `Are you sure you want to delete these ${selectedFiles.size} files?`;
            showDeleteModal(msg, () => deleteFiles(Array.from(selectedFiles)));
        });
    }

    // --- EVENT DELEGATION FOR BUTTONS ---
    document.addEventListener('click', function (e) {
        // Delete (single)
        if (e.target.closest('.delete-btn')) {
            const btn = e.target.closest('.delete-btn');
            const filename = btn.getAttribute('data-filename');
            showDeleteModal('Are you sure you want to delete this file?', () => deleteFiles([filename]));
        }
        // Copy URL
        if (e.target.closest('.copy-url-btn')) {
            const btn = e.target.closest('.copy-url-btn');
            const url = btn.getAttribute('data-url');
            copyToClipboard(url);
        }
        // Media details
        if (e.target.closest('.media-details-btn')) {
            const btn = e.target.closest('.media-details-btn');
            openMediaModal(
                btn.getAttribute('data-name'),
                btn.getAttribute('data-url'),
                btn.getAttribute('data-type'),
                btn.getAttribute('data-size'),
                btn.getAttribute('data-date'),
                btn.getAttribute('data-resolution')
            );
        }
        // Modal overlay close
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
            currentModalFile = null;
        }
    });

    // --- MODAL BUTTONS ---
    function addModalBtnHandler(id, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', handler);
    }
    addModalBtnHandler('closeMediaModal', () => closeModal('mediaModal'));
    addModalBtnHandler('closeMediaModalBtn', () => closeModal('mediaModal'));
    addModalBtnHandler('deleteFromModalBtn', deleteFromModal);
    addModalBtnHandler('closeDeleteModal', () => closeModal('deleteModal'));
    addModalBtnHandler('cancelDelete', () => closeModal('deleteModal'));

    // --- MODAL LOGIC ---
    function openMediaModal(name, url, type, size, date, resolution) {
        const modal = document.getElementById('mediaModal');
        const modalBody = modal.querySelector('.media-detail-content');
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
                <div class="detail-group url-field"><label>URL:</label> <input class="form-input" id="modalFileUrl" value="${url}" readonly><button class="btn-copy copy-url-btn" type="button" data-url="${url}"><i class="fas fa-copy"></i></button></div>
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
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
        currentModalFile = null;
    }

    function deleteFromModal() {
        if (currentModalFile) {
            showDeleteModal('Are you sure you want to delete this file?', () => {
                deleteFiles([currentModalFile]);
                closeModal('mediaModal');
            });
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('URL copied to clipboard!', 'success');
        }).catch(() => {
            showMessage('Failed to copy URL', 'error');
        });
    }

    // --- DELETE FILES (AJAX) ---
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
                    filenames.forEach(filename => {
                        document.querySelectorAll(`[data-filename="${filename}"]`).forEach(el => el.remove());
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

    // --- DELETE MODAL ---
    function showDeleteModal(message, onConfirm) {
        const modal = document.getElementById('deleteModal');
        const messageEl = document.getElementById('deleteMessage');
        const confirmBtn = document.getElementById('confirmDeleteBtn');
        messageEl.textContent = message;
        modal.style.display = 'flex';
        // Remove existing event listeners by replacing node
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        newConfirmBtn.addEventListener('click', function () {
            modal.style.display = 'none';
            if (onConfirm) onConfirm();
        });
    }

    // --- UPLOAD FILES ---
    function handleFileUpload(files) {
        if (!files || files.length === 0) return;
        const uploadProgress = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const uploadStatus = document.getElementById('uploadStatus');
        uploadProgress.style.display = 'block';
        let uploadedCount = 0;
        const totalFiles = files.length;
        Array.from(files).forEach(file => {
            const fileFormData = new FormData();
            fileFormData.append('media_file', file);
            fetch('/admin/dashboard/media_library/upload/', {
                method: 'POST',
                body: fileFormData,
                headers: { 'X-CSRFToken': getCookie('csrftoken') }
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
                            location.reload();
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

    // --- CSRF TOKEN (Django) ---
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

    // --- SHOW MESSAGE ---
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

    // --- INIT ---
    updateSelectedCount();
    showGridView(); // Default to grid view on load
});