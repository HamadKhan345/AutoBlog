document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const form = document.getElementById('aiCreationForm');
    const submitBtn = document.getElementById('submitBtn');
    const loadingModal = document.getElementById('loadingModal');
    const imageInput = document.getElementById('featuredImage');
    const imagePreview = document.querySelector('.image-preview');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    const previewImg = document.getElementById('previewImg');
    const removeImageBtn = document.querySelector('.remove-image');
    
    // Research type radio buttons
    const quickResearchRadio = document.getElementById('quickResearch');
    const deepResearchRadio = document.getElementById('deepResearch');
    const quickLabel = document.querySelector('label[for="quickResearch"]');
    const deepLabel = document.querySelector('label[for="deepResearch"]');
    const researchOptions = document.querySelectorAll('.research-option');

    // Initialize - set default state for quick research
    updateResearchSelection();

    // Handle research type selection
    function updateResearchSelection() {
        if (quickResearchRadio.checked) {
            quickLabel.textContent = 'Selected';
            deepLabel.textContent = 'Select';
            
            // Update visual selection
            document.querySelector('[data-type="quick"]').classList.add('selected');
            document.querySelector('[data-type="deep"]').classList.remove('selected');
        } else if (deepResearchRadio.checked) {
            deepLabel.textContent = 'Selected';
            quickLabel.textContent = 'Select';
            
            // Update visual selection
            document.querySelector('[data-type="deep"]').classList.add('selected');
            document.querySelector('[data-type="quick"]').classList.remove('selected');
        }
    }

    // Add event listeners for research type changes
    quickResearchRadio.addEventListener('change', updateResearchSelection);
    deepResearchRadio.addEventListener('change', updateResearchSelection);

    // Make entire research option clickable
    researchOptions.forEach(option => {
        option.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            if (type === 'quick') {
                quickResearchRadio.checked = true;
            } else if (type === 'deep') {
                deepResearchRadio.checked = true;
            }
            updateResearchSelection();
        });
    });

    // Handle image upload
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showCustomMessage('File size must be less than 5MB', 'error');
                this.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showCustomMessage('Please select a valid image file', 'error');
                this.value = '';
                return;
            }

            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                uploadPlaceholder.style.display = 'none';
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle image removal
    removeImageBtn.addEventListener('click', function() {
        imageInput.value = '';
        uploadPlaceholder.style.display = 'block';
        imagePreview.style.display = 'none';
        previewImg.src = '';
    });

    // Handle drag and drop for image upload
    const imageUploadArea = document.querySelector('.image-upload-area');
    
    imageUploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });

    imageUploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });

    imageUploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            imageInput.files = files;
            imageInput.dispatchEvent(new Event('change'));
        }
    });

    // Form validation and submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        
        // Validate required fields
        const researchType = formData.get('researchType');
        const blogTopic = formData.get('blogTopic');
        const blogCategory = formData.get('blogCategory');
        const blogStatus = formData.get('blogStatus');
        
        if (!researchType) {
            showCustomMessage('Please select a research type', 'error');
            return;
        }
        
        if (!blogTopic || !blogTopic.trim()) {
            showCustomMessage('Please enter a blog topic', 'error');
            return;
        }
        
        if (!blogCategory) {
            showCustomMessage('Please select a category', 'error');
            return;
        }
        
        if (!blogStatus) {
            showCustomMessage('Please select a status', 'error');
            return;
        }

        // Show loading state
        showLoadingState();
        
        // Submit form to Django backend
        submitFormToBackend(formData);
    });

    function showLoadingState() {
        // Update button
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loading').style.display = 'inline-flex';
        
        // Show modal
        loadingModal.style.display = 'flex';
        
        // Start loading stages animation
        updateLoadingStage();
    }

    function hideLoadingState() {
        // Hide modal
        loadingModal.style.display = 'none';
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').style.display = 'inline';
        submitBtn.querySelector('.btn-loading').style.display = 'none';
    }

    function updateLoadingStage() {
        // Just show static loading text without stage progression
        const loadingStage = document.querySelector('.loading-stage');
        if (loadingStage) {
            loadingStage.textContent = 'Processing your request...';
        }
    }

    function submitFormToBackend(formData) {
        // Submit the form using fetch API
        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': formData.get('csrfmiddlewaretoken'),
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (response.redirected) {
                // Django redirected us (likely to all_posts on success)
                window.location.href = response.url;
            } else {
                return response.text();
            }
        })
        .then(html => {
            if (html) {
                hideLoadingState();
                displayDjangoMessagesFromHTML(html);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            hideLoadingState();
            showCustomMessage('Network error occurred. Please check your connection and try again.', 'error');
        });
    }

    // Helper to display Django messages from HTML response
    function displayDjangoMessagesFromHTML(html) {
        // Clear any existing messages first
        const existingMessages = document.querySelector('.messages');
        if (existingMessages) {
            existingMessages.remove();
        }

        // Parse the HTML and extract the entire messages container
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const messagesContainer = doc.querySelector('.messages');
        
        if (messagesContainer) {
            // Clone the entire messages container to preserve exact structure
            const clonedContainer = messagesContainer.cloneNode(true);
            
            // Add event listeners to close buttons in the cloned container
            const closeButtons = clonedContainer.querySelectorAll('.close-alert');
            closeButtons.forEach(closeBtn => {
                closeBtn.addEventListener('click', function() {
                    const alert = this.parentElement;
                    alert.style.opacity = '0';
                    alert.style.transform = 'translateX(-20px)';
                    
                    setTimeout(() => {
                        alert.remove();
                        // Remove entire messages container if no alerts left
                        if (clonedContainer.children.length === 0) {
                            clonedContainer.remove();
                        }
                    }, 300);
                });
            });
            
            // Insert messages at the top of the admin-content area
            const adminContent = document.querySelector('.admin-content');
            if (adminContent) {
                adminContent.insertBefore(clonedContainer, adminContent.firstChild);
            } else {
                // Fallback: insert before the form
                form.parentNode.insertBefore(clonedContainer, form);
            }
            
            // Auto-hide alerts after 5 minutes (matching admin_base.js behavior)
            const alerts = clonedContainer.querySelectorAll('.alert');
            alerts.forEach(alert => {
                setTimeout(() => {
                    const closeBtn = alert.querySelector('.close-alert');
                    if (closeBtn) {
                        closeBtn.click();
                    }
                }, 300000);
            });
            
            // Scroll to top to show the message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Fallback: create error message with proper styling
            showCustomMessage('An error occurred while generating the blog post. Please try again.', 'error');
        }
    }

    // Function to show custom messages with exact admin dashboard styling
    function showCustomMessage(messageText, messageType = 'error') {
        // Clear any existing messages first
        const existingMessages = document.querySelector('.messages');
        if (existingMessages) {
            existingMessages.remove();
        }
        
        // Create messages container
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages';
        
        // Create alert with proper classes (matching admin_base.html structure)
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${messageType}`;
        
        // Add icon (using fa-info-circle like in admin_base.html)
        const icon = document.createElement('i');
        icon.className = 'fas fa-info-circle';
        
        // Add message text
        const textNode = document.createTextNode(' ' + messageText);
        
        // Add close button (matching admin_base.html structure)
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-alert';
        closeBtn.innerHTML = '&times;';
        
        // Add the same close functionality as admin_base.js
        closeBtn.addEventListener('click', function() {
            const alert = this.parentElement;
            alert.style.opacity = '0';
            alert.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                alert.remove();
                // Remove entire messages container if no alerts left
                if (messagesContainer.children.length === 0) {
                    messagesContainer.remove();
                }
            }, 300);
        });
        
        // Assemble the alert (matching admin_base.html structure)
        alertDiv.appendChild(icon);
        alertDiv.appendChild(textNode);
        alertDiv.appendChild(closeBtn);
        messagesContainer.appendChild(alertDiv);
        
        // Insert at the top of admin-content
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.insertBefore(messagesContainer, adminContent.firstChild);
        } else {
            // Fallback: insert before the form
            form.parentNode.insertBefore(messagesContainer, form);
        }
        
        // Auto-hide alert after 5 minutes (matching admin_base.js behavior)
        setTimeout(() => {
            const alert = messagesContainer.querySelector('.alert');
            if (alert) {
                const closeBtnAuto = alert.querySelector('.close-alert');
                if (closeBtnAuto) {
                    closeBtnAuto.click();
                }
            }
        }, 300000);
        
        // Scroll to top to show the message
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Auto-resize textarea if you add one later
    function autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Form field validation feedback
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.add('error');
            } else {
                this.classList.remove('error');
            }
        });

        field.addEventListener('input', function() {
            if (this.classList.contains('error') && this.value.trim() !== '') {
                this.classList.remove('error');
            }
        });
    });

    // Clear loading interval when page unloads
    window.addEventListener('beforeunload', function() {
        if (window.loadingStageInterval) {
            clearInterval(window.loadingStageInterval);
        }
    });
});