document.addEventListener('DOMContentLoaded', function() {
    // Initialize Quill Editor
    const quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
            toolbar: '#toolbar'
        },
        placeholder: 'Write here...'
    });

    // Elements
    const postTitle = document.getElementById('postTitle');
    const postContent = document.getElementById('postContent');
    const tagsInput = document.getElementById('postTags');
    const tagsDisplay = document.getElementById('tagsDisplay');
    const hiddenTags = document.getElementById('hiddenTags');
    const imageUpload = document.getElementById('featuredImage');
    const imageUploadArea = document.getElementById('imageUploadArea');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const removeImage = document.getElementById('removeImage');
    const captionGroup = document.getElementById('captionGroup');
    const form = document.getElementById('addPostForm');
    const savePostBtn = document.getElementById('savePostBtn');
    const toggleFullscreenBtn = document.getElementById('toggleFullscreen');
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    const closeFullscreenBtn = document.getElementById('closeFullscreen');

    let tags = [];
    let isFormDirty = false;
    let isFullscreen = false;

    // Character counting for excerpt
    const excerptInput = document.getElementById('postExcerpt');
    const excerptCharCount = excerptInput.parentElement.querySelector('.char-count');

    excerptInput.addEventListener('input', function() {
    const length = this.value.length;
    const maxLength = this.getAttribute('maxlength') || 150;
    excerptCharCount.textContent = `${length}/${maxLength} characters`;
    
    // Add warning color when approaching limit
    if (length > maxLength * 0.9) {
        excerptCharCount.style.color = '#dc3545';
    } else {
        excerptCharCount.style.color = '';
    }
});

    // Character counting for title
    postTitle.addEventListener('input', function() {
        updateCharCount(this, 200);
        markFormDirty();
    });

    // Quill editor changes
    quill.on('text-change', function() {
        const content = quill.root.innerHTML;
        postContent.value = content;
        updateWordCount();
        markFormDirty();
    });

    // Fullscreen functionality
    toggleFullscreenBtn.addEventListener('click', function() {
        toggleFullscreen();
    });

    closeFullscreenBtn.addEventListener('click', function() {
        exitFullscreen();
    });

    // ESC key to exit fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isFullscreen) {
            exitFullscreen();
        }
    });

    function toggleFullscreen() {
        if (!isFullscreen) {
            enterFullscreen();
        } else {
            exitFullscreen();
        }
    }

    function enterFullscreen() {
        const editorContainer = document.querySelector('.editor-container');
        const fullscreenEditorContainer = document.querySelector('.fullscreen-editor-container');
        
        // Move editor to fullscreen container
        fullscreenEditorContainer.appendChild(editorContainer);
        fullscreenOverlay.style.display = 'flex';
        
        // Update button icon
        toggleFullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        
        isFullscreen = true;
        
        // Resize quill to fit new container
        setTimeout(() => {
            quill.resize();
        }, 100);
    }

    function exitFullscreen() {
        const editorContainer = document.querySelector('.editor-container');
        const originalContainer = document.querySelector('.main-content .form-group:last-child');
        
        // Move editor back to original container
        originalContainer.appendChild(editorContainer);
        fullscreenOverlay.style.display = 'none';
        
        // Update button icon
        toggleFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        
        isFullscreen = false;
        
        // Resize quill to fit original container
        setTimeout(() => {
            quill.resize();
        }, 100);
    }

    // Tags functionality
    tagsInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(this.value.trim());
            this.value = '';
        }
    });

    tagsInput.addEventListener('blur', function() {
        if (this.value.trim()) {
            addTag(this.value.trim());
            this.value = '';
        }
    });

    // Image upload functionality
    imageUploadArea.addEventListener('click', function() {
        imageUpload.click();
    });

    imageUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = 'var(--light-bg)';
    });

    imageUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = '';
    });

    imageUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleImageUpload(files[0]);
        }
    });

    imageUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleImageUpload(this.files[0]);
        }
    });

    removeImage.addEventListener('click', function() {
        removeImagePreview();
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate required fields
        if (!validateForm()) {
            return;
        }
        
        // Update hidden fields
        postContent.value = quill.root.innerHTML;
        hiddenTags.value = JSON.stringify(tags);
        
        // Show loading state
        savePostBtn.classList.add('loading');
        savePostBtn.disabled = true;
        
        // Simulate form submission (replace with actual AJAX call)
        setTimeout(() => {
            showMessage('Post saved successfully!', 'success');
            savePostBtn.classList.remove('loading');
            savePostBtn.disabled = false;
            isFormDirty = false;
            
            // Redirect to all posts after successful submission
            setTimeout(() => {
                window.location.href = '/admin/all_posts/';
            }, 1500);
        }, 2000);
    });

    // Utility functions
    function updateCharCount(element, maxLength) {
        const current = element.value.length;
        const counter = element.parentElement.nextElementSibling?.querySelector('.char-count');
        if (counter) {
            counter.textContent = `${current}/${maxLength} characters`;
            counter.style.color = current > maxLength ? 'var(--danger-color)' : 'var(--secondary-color)';
        }
    }

    function updateWordCount() {
        const text = quill.getText();
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const readTime = Math.max(1, Math.ceil(words / 200)); // Assuming 200 words per minute
        
        const wordCount = document.querySelector('.word-count');
        const readTimeEl = document.querySelector('.read-time');
        
        if (wordCount) wordCount.textContent = `${words} words`;
        if (readTimeEl) readTimeEl.textContent = `${readTime} min read`;
    }

    function addTag(tagText) {
        if (!tagText || tags.includes(tagText)) {
            return;
        }
        
        tags.push(tagText);
        renderTags();
        markFormDirty();
    }

    function removeTag(tagText) {
        tags = tags.filter(tag => tag !== tagText);
        renderTags();
        markFormDirty();
    }

    function renderTags() {
        tagsDisplay.innerHTML = '';
        tags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <button type="button" class="tag-remove" onclick="removeTag('${tag}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
            tagsDisplay.appendChild(tagElement);
        });
        
        // Update hidden field
        hiddenTags.value = JSON.stringify(tags);
    }

    // Make removeTag available globally
    window.removeTag = removeTag;

    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            uploadPlaceholder.style.display = 'none';
            imagePreview.style.display = 'block';
            captionGroup.style.display = 'block';
            markFormDirty();
        };
        reader.readAsDataURL(file);
    }

    function removeImagePreview() {
        previewImage.src = '';
        uploadPlaceholder.style.display = 'flex';
        imagePreview.style.display = 'none';
        captionGroup.style.display = 'none';
        imageUpload.value = '';
        document.getElementById('imageCaption').value = '';
        markFormDirty();
    }

    function validateForm() {
        let isValid = true;
        
        // Clear previous errors
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Validate title
        if (!postTitle.value.trim()) {
            showFieldError(postTitle, 'Post title is required');
            isValid = false;
        }
        
        // Validate content
        if (!quill.getText().trim()) {
            showMessage('Post content is required', 'error');
            isValid = false;
        }
        
        return isValid;
    }

    function showFieldError(field, message) {
        field.classList.add('error');
        const errorEl = document.createElement('span');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        field.parentElement.appendChild(errorEl);
    }

    function showMessage(message, type = 'info', duration = 5000) {
        const messageContainer = document.getElementById('messageContainer');
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        
        messageEl.innerHTML = `
            <i class="fas fa-${icon}"></i>
            ${message}
            <button class="message-close">&times;</button>
        `;
        
        messageContainer.appendChild(messageEl);
        
        // Auto remove
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, duration);
        
        // Close button
        messageEl.querySelector('.message-close').addEventListener('click', () => {
            messageEl.remove();
        });
    }

    function markFormDirty() {
        isFormDirty = true;
    }

    // Warn about unsaved changes
    window.addEventListener('beforeunload', function(e) {
        if (isFormDirty) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // Category modal functionality
    const categoryModal = document.getElementById('categoryModal');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const closeCategoryModal = document.getElementById('closeCategoryModal');
    const cancelCategory = document.getElementById('cancelCategory');
    const saveCategory = document.getElementById('saveCategory');
    const categoryImageUpload = document.getElementById('categoryThumbnail');
    const categoryImageUploadArea = document.getElementById('categoryImageUploadArea');
    const categoryUploadPlaceholder = document.getElementById('categoryUploadPlaceholder');
    const categoryImagePreview = document.getElementById('categoryImagePreview');
    const categoryPreviewImage = document.getElementById('categoryPreviewImage');
    const removeCategoryImage = document.getElementById('removeCategoryImage');
    
    // Category image upload functionality
    categoryImageUploadArea.addEventListener('click', function() {
        categoryImageUpload.click();
    });

    categoryImageUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
        this.style.backgroundColor = 'var(--light-bg)';
    });

    categoryImageUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = '';
    });

    categoryImageUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.backgroundColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleCategoryImageUpload(files[0]);
        }
    });

    categoryImageUpload.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleCategoryImageUpload(this.files[0]);
        }
    });

    removeCategoryImage.addEventListener('click', function() {
        removeCategoryImagePreview();
    });

    function handleCategoryImageUpload(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            categoryPreviewImage.src = e.target.result;
            categoryUploadPlaceholder.style.display = 'none';
            categoryImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    function removeCategoryImagePreview() {
        categoryPreviewImage.src = '';
        categoryUploadPlaceholder.style.display = 'flex';
        categoryImagePreview.style.display = 'none';
        categoryImageUpload.value = '';
    }
    
    addCategoryBtn.addEventListener('click', () => {
        categoryModal.style.display = 'flex';
    });
    
    closeCategoryModal.addEventListener('click', () => {
        categoryModal.style.display = 'none';
        removeCategoryImagePreview(); // Clear image when closing
    });
    
    cancelCategory.addEventListener('click', () => {
        categoryModal.style.display = 'none';
        removeCategoryImagePreview(); // Clear image when canceling
    });
    
    saveCategory.addEventListener('click', () => {
        const categoryName = document.getElementById('newCategoryName').value.trim();
        if (categoryName) {
            // Add new category to select
            const option = document.createElement('option');
            option.value = categoryName.toLowerCase();
            option.textContent = categoryName;
            document.getElementById('postCategory').appendChild(option);
            document.getElementById('postCategory').value = categoryName.toLowerCase();
            
            showMessage('Category added successfully!', 'success');
            categoryModal.style.display = 'none';
            
            // Clear form
            document.getElementById('newCategoryName').value = '';
            document.getElementById('newCategoryDescription').value = '';
            removeCategoryImagePreview();
        }
    });

    // Initialize
    updateWordCount();
});