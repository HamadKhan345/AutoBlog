document.addEventListener('DOMContentLoaded', function () {
  // --- Initialize Quill Editor ---
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: {
        container: '#toolbar',
        handlers: {
          image: function () {
            openMediaLibrary(function (selectedUrls) {
              if (Array.isArray(selectedUrls)) {
                const range = quill.getSelection(true);
                let index = range ? range.index : quill.getLength();
                selectedUrls.forEach(url => {
                  quill.insertEmbed(index, 'image', url);
                  index++;
                });
              } else if (selectedUrls) {
                const range = quill.getSelection(true);
                quill.insertEmbed(range ? range.index : quill.getLength(), 'image', selectedUrls);
              }
            });
          }
        }
      }
    },
    placeholder: 'Write here...'
  });

  // --- Elements ---
  const postTitle = document.getElementById('postTitle');
  const postContent = document.getElementById('postContent');
  const tagsInput = document.getElementById('postTags');
  const tagsDisplay = document.getElementById('tagsDisplay');
  const hiddenTags = document.getElementById('hiddenTags');
  const captionGroup = document.getElementById('captionGroup');
  const form = document.getElementById('addPostForm');
  const savePostBtn = document.getElementById('savePostBtn');
  const toggleFullscreenBtn = document.getElementById('toggleFullscreen');
  const fullscreenOverlay = document.getElementById('fullscreenOverlay');
  const closeFullscreenBtn = document.getElementById('closeFullscreen');
  const imageUploadArea = document.getElementById('imageUploadArea');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const imagePreview = document.getElementById('imagePreview');
  const previewImage = document.getElementById('previewImage');
  const removeImageBtn = document.getElementById('removeImage');
  const featuredImageUrl = document.getElementById('featuredImageUrl');
  const featuredImageInput = document.getElementById('featuredImageInput');

  let tags = [];
  let isFormDirty = false;
  let isFullscreen = false;

  // --- Character counting for excerpt ---
  const excerptInput = document.getElementById('postExcerpt');
  const excerptCharCount = excerptInput.parentElement.querySelector('.char-count');
  excerptInput.addEventListener('input', function () {
    const length = this.value.length;
    const maxLength = this.getAttribute('maxlength') || 150;
    excerptCharCount.textContent = `${length}/${maxLength} characters`;
    excerptCharCount.style.color = length > maxLength * 0.9 ? '#dc3545' : '';
  });

  // --- Character counting for title ---
  postTitle.addEventListener('input', function () {
    updateCharCount(this, 200);
    markFormDirty();
  });

  // --- Quill editor changes ---
  quill.on('text-change', function () {
    postContent.value = quill.root.innerHTML;
    updateWordCount();
    markFormDirty();
  });

  // --- Fullscreen functionality ---
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

  // --- Tags functionality ---
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

  // --- Utility functions ---
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

  // --- Warn about unsaved changes ---
  window.addEventListener('beforeunload', function (e) {
    if (isFormDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // --- On form submit, update hidden fields and let the form submit normally ---
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

  // --- Featured Image: Upload and Preview ---
  // Open file dialog on click or drag
  imageUploadArea.addEventListener('click', function (e) {
    if (e.target === removeImageBtn) return;
    featuredImageInput.click();
  });
  imageUploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    imageUploadArea.classList.add('dragover');
  });
  imageUploadArea.addEventListener('dragleave', function (e) {
    e.preventDefault();
    imageUploadArea.classList.remove('dragover');
  });
  imageUploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    imageUploadArea.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFeaturedImageFile(e.dataTransfer.files[0]);
    }
  });
  featuredImageInput.addEventListener('change', function (e) {
    if (this.files && this.files[0]) {
      handleFeaturedImageFile(this.files[0]);
    }
  });
  function handleFeaturedImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showMessage('Please select a valid image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image size must be 5MB or less.', 'error');
      featuredImageInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      imagePreview.style.display = 'block';
      uploadPlaceholder.style.display = 'none';
      captionGroup.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
  removeImageBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    featuredImageInput.value = '';
    previewImage.src = '';
    imagePreview.style.display = 'none';
    uploadPlaceholder.style.display = 'block';
    captionGroup.style.display = 'none';
  });

  // --- Media Library Modal Logic (for Quill image insert, multi-select, close on outside click/X) ---
  function openMediaLibrary(onSelect) {
    const overlay = document.getElementById('mediaLibraryOverlay');
    const grid = document.getElementById('mediaLibraryGrid');
    const selectBtn = document.getElementById('selectMediaBtn');
    let selectedUrls = new Set();

    // Reset modal state
    grid.innerHTML = '<div style="text-align:center;width:100%">Loading...</div>';
    selectBtn.disabled = true;
    selectedUrls.clear();
    overlay.style.display = 'flex';

    // Fetch media files from server (expects a JSON endpoint)
    fetch('/admin/dashboard/media_library/list/')
      .then(res => res.json())
      .then(data => {
        grid.innerHTML = '';
        if (!data.files || !data.files.length) {
          grid.innerHTML = '<div style="text-align:center;width:100%">No images found in media library.</div>';
          return;
        }
        data.files.forEach(file => {
          const item = document.createElement('div');
          item.className = 'media-library-item';
          item.tabIndex = 0;
          item.title = file.name;
          item.innerHTML = `<img src="${file.url}" alt="${file.name}">`;
          item.onclick = function (e) {
            if (item.classList.contains('selected')) {
              item.classList.remove('selected');
              selectedUrls.delete(file.url);
            } else {
              item.classList.add('selected');
              selectedUrls.add(file.url);
            }
            selectBtn.disabled = selectedUrls.size === 0;
          };
          grid.appendChild(item);
        });
      })
      .catch(() => {
        grid.innerHTML = '<div style="text-align:center;width:100%">Failed to load media files.</div>';
      });

    selectBtn.onclick = function () {
      if (selectedUrls.size > 0) {
        onSelect(Array.from(selectedUrls));
        overlay.style.display = 'none';
      }
    };
    document.getElementById('closeMediaLibraryModal').onclick = function () {
      overlay.style.display = 'none';
    };
    // Close modal when clicking outside modal content
    overlay.onclick = function (e) {
      if (e.target === overlay) overlay.style.display = 'none';
    };
  }

  // --- Initialize ---
  updateWordCount();
});