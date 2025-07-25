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
                alert('File size must be less than 5MB');
                this.value = '';
                return;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
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
        const data = Object.fromEntries(formData);
        
        // Validate required fields
        if (!data.researchType) {
            alert('Please select a research type');
            return;
        }
        
        if (!data.blogTopic.trim()) {
            alert('Please enter a blog topic');
            return;
        }
        
        if (!data.blogCategory) {
            alert('Please select a category');
            return;
        }
        
        if (!data.blogStatus) {
            alert('Please select a status');
            return;
        }

        // Show loading state
        showLoadingState();
        
        // Simulate AI generation process
        simulateAIGeneration(data);
    });

    function showLoadingState() {
        // Update button
        submitBtn.disabled = true;
        submitBtn.querySelector('.btn-text').style.display = 'none';
        submitBtn.querySelector('.btn-loading').style.display = 'inline-flex';
        
        // Show modal
        loadingModal.style.display = 'flex';
        
        // Simulate loading stages
        updateLoadingStage();
    }

    function updateLoadingStage() {
        const stages = [
            'Analyzing topic and gathering information...',
            'Researching relevant sources...',
            'Generating content structure...',
            'Writing and optimizing content...',
            'Finalizing blog post...'
        ];
        
        const loadingStage = document.querySelector('.loading-stage');
        let currentStage = 0;
        
        const stageInterval = setInterval(() => {
            if (currentStage < stages.length) {
                loadingStage.textContent = stages[currentStage];
                currentStage++;
            } else {
                clearInterval(stageInterval);
            }
        }, 2000);
    }

    function simulateAIGeneration(data) {
        // This is where you'll later integrate with your FastAPI backend
        console.log('Form data:', data);
        
        // Simulate processing time
        setTimeout(() => {
            // Hide loading
            loadingModal.style.display = 'none';
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.querySelector('.btn-text').style.display = 'inline';
            submitBtn.querySelector('.btn-loading').style.display = 'none';
            
            // Show success message (temporary)
            alert('AI blog generation completed! (This is a simulation - integrate with your FastAPI backend)');
            
            // You can redirect to a success page or blog editor here
            // window.location.href = '/admin/blogs/edit/' + blogId;
            
        }, 10000); // 10 seconds simulation
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
});
