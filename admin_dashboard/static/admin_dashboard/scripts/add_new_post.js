document.addEventListener('DOMContentLoaded', function () {
  // Initialize Quill Editor
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: { toolbar: '#toolbar' },
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
  excerptInput.addEventListener('input', function () {
    const length = this.value.length;
    const maxLength = this.getAttribute('maxlength') || 150;
    excerptCharCount.textContent = `${length}/${maxLength} characters`;
    excerptCharCount.style.color = length > maxLength * 0.9 ? '#dc3545' : '';
  });

  // Character counting for title
  postTitle.addEventListener('input', function () {
    updateCharCount(this, 200);
    markFormDirty();
  });

  // Quill editor changes
  quill.on('text-change', function () {
    postContent.value = quill.root.innerHTML;
    updateWordCount();
    markFormDirty();
  });

  // Fullscreen functionality
  toggleFullscreenBtn.addEventListener('click', function () { toggleFullscreen(); });
  closeFullscreenBtn.addEventListener('click', function () { exitFullscreen(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isFullscreen) exitFullscreen();
  });

  function toggleFullscreen() {
    if (!isFullscreen) enterFullscreen();
    else exitFullscreen();
  }
  function enterFullscreen() {
    const editorContainer = document.querySelector('.editor-container');
    const fullscreenEditorContainer = document.querySelector('.fullscreen-editor-container');
    fullscreenEditorContainer.appendChild(editorContainer);
    fullscreenOverlay.style.display = 'flex';
    toggleFullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    isFullscreen = true;
    setTimeout(() => { quill.resize(); }, 100);
  }
  function exitFullscreen() {
    const editorContainer = document.querySelector('.editor-container');
    const originalContainer = document.querySelector('.main-content .form-group:last-child');
    originalContainer.appendChild(editorContainer);
    fullscreenOverlay.style.display = 'none';
    toggleFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    isFullscreen = false;
    setTimeout(() => { quill.resize(); }, 100);
  }

  // Tags functionality
  tagsInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(this.value.trim());
      this.value = '';
    }
  });
  tagsInput.addEventListener('blur', function () {
    if (this.value.trim()) {
      addTag(this.value.trim());
      this.value = '';
    }
  });
  function addTag(tagText) {
    if (!tagText || tags.includes(tagText)) return;
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
    hiddenTags.value = JSON.stringify(tags);
  }
  window.removeTag = removeTag;

  // Image upload functionality
  imageUploadArea.addEventListener('click', function () { imageUpload.click(); });
  imageUploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    this.style.borderColor = 'var(--primary-color)';
    this.style.backgroundColor = 'var(--light-bg)';
  });
  imageUploadArea.addEventListener('dragleave', function (e) {
    e.preventDefault();
    this.style.borderColor = 'var(--border-color)';
    this.style.backgroundColor = '';
  });
  imageUploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    this.style.borderColor = 'var(--border-color)';
    this.style.backgroundColor = '';
    const files = e.dataTransfer.files;
    if (files.length > 0) handleImageUpload(files[0]);
  });
  imageUpload.addEventListener('change', function () {
    if (this.files.length > 0) handleImageUpload(this.files[0]);
  });
  removeImage.addEventListener('click', function () { removeImagePreview(); });
  function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
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

  // Utility functions
  function updateCharCount(element, maxLength) {
    const counter = element.parentElement.querySelector('.char-count');
    if (counter) {
      const current = element.value.length;
      counter.textContent = `${current}/${maxLength} characters`;
      counter.style.color = current > maxLength ? 'var(--danger-color)' : '';
    }
  }
  function updateWordCount() {
    const text = quill.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const wordCount = document.querySelector('.word-count');
    const readTimeEl = document.querySelector('.read-time');
    if (wordCount) wordCount.textContent = `${words} words`;
    if (readTimeEl) readTimeEl.textContent = `${readTime} min read`;
  }
  function markFormDirty() { isFormDirty = true; }

  // Warn about unsaved changes
  window.addEventListener('beforeunload', function (e) {
    if (isFormDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // On form submit, update hidden fields and let the form submit normally
  form.addEventListener('submit', function (e) {
    postContent.value = quill.root.innerHTML;
    hiddenTags.value = JSON.stringify(tags);

    // Require content: check for non-empty text in Quill
    const plainText = quill.getText().trim();
    if (!plainText) {
      alert('Post content is required.');
      e.preventDefault();
      return false;
    }

    isFormDirty = false; // Prevent "leave site" alert after save
  });

  // Initialize
  updateWordCount();
});