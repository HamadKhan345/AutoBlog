document.addEventListener('DOMContentLoaded', function () {
  // --- Initialize CKEditor 5 ---
  let editor;
  
  // CKEditor 5 configuration - clean and simple
  const {
    ClassicEditor,
    Essentials,
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Font,
    Paragraph,
    Heading,
    List,
    Indent,
    Link,
    BlockQuote,
    Table,
    TableToolbar,
    TableProperties,
    TableCellProperties,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    ImageResize,
    ImageUpload,
    FileRepository,
    MediaEmbed,
    CodeBlock,
    HtmlEmbed,
    SourceEditing,
    GeneralHtmlSupport,
    RemoveFormat
  } = CKEDITOR;

  ClassicEditor
    .create(document.querySelector('#editor'), {
      plugins: [
        Essentials, Bold, Italic, Underline, Strikethrough, Font, Paragraph, Heading,
        List, Indent, Link, BlockQuote, Table, TableToolbar, TableProperties, TableCellProperties,
        Image, ImageToolbar, ImageCaption, ImageStyle, ImageResize, ImageUpload, FileRepository, MediaEmbed,
        CodeBlock, HtmlEmbed, SourceEditing, GeneralHtmlSupport, RemoveFormat
      ],
      toolbar: {
        items: [
          'heading', '|',
          'bold', 'italic', 'underline', 'strikethrough', '|',
          'fontSize', 'fontColor', 'fontBackgroundColor', '|',
          'bulletedList', 'numberedList', 'outdent', 'indent', '|',
          'link', 'imageUpload', 'mediaEmbed', '|',
          'insertTable', 'blockQuote', 'codeBlock', '|',
          'removeFormat', 'sourceEditing'
        ],
        shouldNotGroupWhenFull: true
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
          { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
          { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
          { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
        ]
      },
      fontSize: {
        options: ['tiny', 'small', 'default', 'big', 'huge']
      },
      fontColor: {
        columns: 5
      },
      fontBackgroundColor: {
        columns: 5
      },
      image: {
        toolbar: [
          'imageStyle:inline', 'imageStyle:block', 'imageStyle:side', '|',
          'toggleImageCaption', 'imageTextAlternative', '|', 'imageResize'
        ],
        upload: {
          types: [] // Disable default upload types to force our media library
        }
      },
      table: {
        contentToolbar: [
          'tableColumn', 'tableRow', 'mergeTableCells', '|',
          'tableCellProperties', 'tableProperties'
        ],
        defaultHeadings: {
          rows: 1,
          columns: 1
        },
        // Allow the table toolbar to be more flexible
        tableProperties: {
          borderColors: [
            { color: 'hsl(0, 0%, 90%)', label: 'Light grey' },
            { color: 'hsl(0, 0%, 60%)', label: 'Grey' },
            { color: 'hsl(0, 0%, 30%)', label: 'Dark grey' },
            { color: 'hsl(0, 0%, 0%)', label: 'Black' },
            { color: 'hsl(0, 75%, 60%)', label: 'Red' },
            { color: 'hsl(30, 75%, 60%)', label: 'Orange' },
            { color: 'hsl(60, 75%, 60%)', label: 'Yellow' },
            { color: 'hsl(90, 75%, 60%)', label: 'Light green' },
            { color: 'hsl(120, 75%, 60%)', label: 'Green' }
          ],
          backgroundColors: [
            { color: 'hsl(0, 0%, 95%)', label: 'Light grey' },
            { color: 'hsl(0, 0%, 80%)', label: 'Grey' },
            { color: 'hsl(0, 75%, 95%)', label: 'Light red' },
            { color: 'hsl(30, 75%, 95%)', label: 'Light orange' },
            { color: 'hsl(60, 75%, 95%)', label: 'Light yellow' },
            { color: 'hsl(90, 75%, 95%)', label: 'Light green' },
            { color: 'hsl(120, 75%, 95%)', label: 'Light blue' }
          ]
        }
      },
      htmlSupport: {
        allow: [
          { name: /.*/, attributes: true, classes: true, styles: true }
        ]
      },
      placeholder: 'Write here...'
    })
    .then(newEditor => {
      editor = newEditor;
      
      // Set up custom image upload adapter
      const fileRepository = editor.plugins.get('FileRepository');
      fileRepository.createUploadAdapter = (loader) => {
        return new MediaLibraryUploadAdapter(loader);
      };
      
      // Set up image button override
      setupImageButtonOverride();
      
      // Set initial content if editing
      const postContentElement = document.getElementById('postContent');
      if (postContentElement && postContentElement.value.trim()) {
        setTimeout(() => {
          editor.setData(postContentElement.value);
        }, 100);
      }

      // Update hidden textarea on content change
      editor.model.document.on('change:data', () => {
        document.getElementById('postContent').value = editor.getData();
        updateWordCount();
        markFormDirty();
      });

      updateWordCount();
    })
    .catch(error => {
      console.error('CKEditor initialization error:', error);
    });

  // Custom upload adapter for media library
  class MediaLibraryUploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }

    upload() {
      return new Promise((resolve, reject) => {
        openMediaLibrary(function (selectedUrls) {
          if (Array.isArray(selectedUrls) && selectedUrls.length > 0) {
            resolve({ default: selectedUrls[0] });
          } else if (selectedUrls) {
            resolve({ default: selectedUrls });
          } else {
            reject('No image selected from media library');
          }
        });
      });
    }

    abort() {
      // Optional: implement abort functionality
    }
  }

  // Set up image button override to use media library
  function setupImageButtonOverride() {
    setTimeout(() => {
      const toolbars = document.querySelectorAll('.ck-toolbar');
      
      toolbars.forEach(toolbar => {
        const imageButton = toolbar.querySelector('[data-cke-tooltip-text*="Upload image"]') || 
                           toolbar.querySelector('[data-cke-tooltip-text*="Insert image"]');
        
        if (imageButton && !imageButton.hasAttribute('data-media-override')) {
          imageButton.setAttribute('data-media-override', 'true');
          
          imageButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            openMediaLibrary(function (selectedUrls) {
              if (Array.isArray(selectedUrls)) {
                selectedUrls.forEach(url => {
                  editor.model.change(writer => {
                    const imageElement = writer.createElement('imageBlock', { src: url });
                    editor.model.insertContent(imageElement, editor.model.document.selection);
                  });
                });
              } else if (selectedUrls) {
                editor.model.change(writer => {
                  const imageElement = writer.createElement('imageBlock', { src: selectedUrls });
                  editor.model.insertContent(imageElement, editor.model.document.selection);
                });
              }
            });
            
            return false;
          }, true);
        }
      });
    }, 500);
  }

  // --- Elements ---
  const form = document.getElementById('addPostForm');
  const postContent = document.getElementById('postContent');
  const postTitle = document.getElementById('postTitle');
  const excerptInput = document.getElementById('postExcerpt');
  const excerptCharCount = excerptInput.parentElement.querySelector('.char-count');
  const tagsInput = document.getElementById('postTags');
  const tagsDisplay = document.getElementById('tagsDisplay');
  const hiddenTags = document.getElementById('hiddenTags');
  const toggleFullscreenBtn = document.getElementById('toggleFullscreen');
  const closeFullscreenBtn = document.getElementById('closeFullscreen');
  const fullscreenOverlay = document.getElementById('fullscreenOverlay');
  const imageUploadArea = document.getElementById('imageUploadArea');
  const featuredImageInput = document.getElementById('featuredImageInput');
  const uploadPlaceholder = document.getElementById('uploadPlaceholder');
  const imagePreview = document.getElementById('imagePreview');
  const previewImage = document.getElementById('previewImage');
  const removeImageBtn = document.getElementById('removeImage');
  const captionGroup = document.getElementById('captionGroup');

  // --- State ---
  let tags = [];
  let isFormDirty = false;
  let isFullscreen = false;

  // --- Character counting for excerpt ---
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
    
    // Add fullscreen class to body for additional styling control
    document.body.classList.add('ckeditor-fullscreen');
    
    // Re-setup image button override after DOM changes
    setTimeout(() => {
      setupImageButtonOverride();
      
      // Force refresh of CKEditor UI elements and ensure proper z-index stacking
      if (editor) {
        // Refresh the editor view
        editor.ui.focusTracker.isFocused = true;
        editor.editing.view.focus();
        
        // Force refresh of all UI components
        editor.ui.componentFactory._components.forEach((component, name) => {
          if (component.isEnabled !== undefined) {
            component.refresh();
          }
        });
        
        // Ensure balloon panels are properly positioned
        const balloonPanels = document.querySelectorAll('.ck-balloon-panel');
        balloonPanels.forEach(panel => {
          if (panel.style.display !== 'none') {
            panel.style.zIndex = '10000';
          }
        });
        
        // Trigger a refresh of the editor's UI
        editor.ui.update();
        
        // Re-enable all toolbar items
        const toolbarItems = document.querySelectorAll('.ck-toolbar .ck-button, .ck-toolbar .ck-dropdown');
        toolbarItems.forEach(item => {
          if (item.classList.contains('ck-disabled')) {
            item.classList.remove('ck-disabled');
          }
        });
      }
    }, 300);
  }

  function exitFullscreen() {
    const editorContainer = document.querySelector('.editor-container');
    const originalContainer = document.querySelector('.main-content .form-group:last-child');
    originalContainer.appendChild(editorContainer);
    fullscreenOverlay.style.display = 'none';
    toggleFullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    isFullscreen = false;
    
    // Remove fullscreen class from body
    document.body.classList.remove('ckeditor-fullscreen');
    
    // Re-setup image button override after DOM changes
    setTimeout(() => {
      setupImageButtonOverride();
      
      // Force refresh of CKEditor UI elements
      if (editor) {
        // Refresh the editor view
        editor.ui.focusTracker.isFocused = true;
        editor.editing.view.focus();
        
        // Force refresh of all UI components
        editor.ui.componentFactory._components.forEach((component, name) => {
          if (component.isEnabled !== undefined) {
            component.refresh();
          }
        });
        
        // Reset balloon panel z-indexes
        const balloonPanels = document.querySelectorAll('.ck-balloon-panel');
        balloonPanels.forEach(panel => {
          panel.style.zIndex = '';
        });
        
        // Trigger a refresh of the editor's UI
        editor.ui.update();
        
        // Re-enable all toolbar items
        const toolbarItems = document.querySelectorAll('.ck-toolbar .ck-button, .ck-toolbar .ck-dropdown');
        toolbarItems.forEach(item => {
          if (item.classList.contains('ck-disabled')) {
            item.classList.remove('ck-disabled');
          }
        });
      }
    }, 300);
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
    if (!editor) return;
    const text = editor.getData().replace(/<[^>]*>/g, '');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readTime = Math.max(1, Math.ceil(words / 200));
    const wordCount = document.querySelector('.word-count');
    const readTimeEl = document.querySelector('.read-time');
    if (wordCount) wordCount.textContent = `${words} words`;
    if (readTimeEl) readTimeEl.textContent = `${readTime} min read`;
  }
  
  function markFormDirty() { 
    isFormDirty = true; 
  }

  // --- Warn about unsaved changes ---
  window.addEventListener('beforeunload', function (e) {
    if (isFormDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  // --- On form submit ---
  form.addEventListener('submit', function (e) {
    hiddenTags.value = JSON.stringify(tags);
    isFormDirty = false;
  });

  // --- Featured Image functionality ---
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

  // --- Media Library Modal Logic ---
  function openMediaLibrary(onSelect) {
    const overlay = document.getElementById('mediaLibraryOverlay');
    const grid = document.getElementById('mediaLibraryGrid');
    const selectBtn = document.getElementById('selectMediaBtn');
    let selectedUrls = new Set();

    // Add search and pagination controls if not already present
    if (!document.getElementById('mediaLibrarySearch')) {
      const searchDiv = document.createElement('div');
      searchDiv.style = "padding: 0 1.5rem 0.5rem 1.5rem;";
      searchDiv.innerHTML = `<input type="text" id="mediaLibrarySearch" class="form-input" placeholder="Search images..." style="width:100%;margin-bottom:1rem;">`;
      overlay.querySelector('.media-library-modal-content').insertBefore(searchDiv, grid);

      const footer = overlay.querySelector('.media-library-footer');
      const pagDiv = document.createElement('div');
      pagDiv.style = "display:flex;align-items:center;gap:0.5rem;";
      pagDiv.innerHTML = `
        <button type="button" id="mediaLibraryPrev" class="btn btn-secondary" style="display:none;">Prev</button>
        <span id="mediaLibraryPageInfo"></span>
        <button type="button" id="mediaLibraryNext" class="btn btn-secondary" style="display:none;">Next</button>
      `;
      footer.insertBefore(pagDiv, selectBtn);
    }

    const searchInput = document.getElementById('mediaLibrarySearch');
    const prevBtn = document.getElementById('mediaLibraryPrev');
    const nextBtn = document.getElementById('mediaLibraryNext');
    const pageInfo = document.getElementById('mediaLibraryPageInfo');

    let currentPage = 1;
    let currentSearch = '';

    function fetchImages(page = 1, search = '') {
      grid.innerHTML = '<div style="text-align:center;width:100%">Loading...</div>';
      selectBtn.disabled = true;
      selectedUrls.clear();
      let url = `/admin/dashboard/media_library/list/?page=${page}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          grid.innerHTML = '';
          if (!data.files || !data.files.length) {
            grid.innerHTML = '<div style="text-align:center;width:100%">No images found.</div>';
          } else {
            data.files.forEach(file => {
              const item = document.createElement('div');
              item.className = 'media-library-item';
              item.tabIndex = 0;
              item.title = file.name;
              item.innerHTML = `
                <img src="${file.url}" alt="${file.name}">
                <div class="media-filename" style="font-size:12px;text-align:center;word-break:break-all;">${file.name}</div>
              `;
              item.onclick = function () {
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
          }
          currentPage = data.page;
          pageInfo.textContent = `Page ${data.page} of ${data.num_pages}`;
          prevBtn.style.display = data.page > 1 ? '' : 'none';
          nextBtn.style.display = data.page < data.num_pages ? '' : 'none';
        })
        .catch(() => {
          grid.innerHTML = '<div style="text-align:center;width:100%">Failed to load media files.</div>';
          pageInfo.textContent = '';
          prevBtn.style.display = 'none';
          nextBtn.style.display = 'none';
        });
    }

    searchInput.value = '';
    searchInput.oninput = function () {
      currentSearch = this.value.trim();
      fetchImages(1, currentSearch);
    };

    prevBtn.onclick = function () {
      if (currentPage > 1) fetchImages(currentPage - 1, currentSearch);
    };
    nextBtn.onclick = function () {
      fetchImages(currentPage + 1, currentSearch);
    };

    overlay.style.display = 'flex';
    fetchImages(1, '');

    selectBtn.onclick = function () {
      if (selectedUrls.size > 0) {
        onSelect(Array.from(selectedUrls));
        overlay.style.display = 'none';
      }
    };
    document.getElementById('closeMediaLibraryModal').onclick = function () {
      overlay.style.display = 'none';
    };
    overlay.onclick = function (e) {
      if (e.target === overlay) overlay.style.display = 'none';
    };
  }

  function showMessage(message, type) {
    const container = document.getElementById('messageContainer');
    if (container) {
      container.innerHTML = `<div class="alert alert-${type}" style="margin: 1rem 0;">${message}</div>`;
      setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
    }
  }

  // Function to insert HTML content into CKEditor
  window.insertHTMLContent = function(htmlContent) {
    if (editor) {
      editor.setData(htmlContent);
      updateWordCount();
      markFormDirty();
    }
  };

  // --- Initialize ---
  let initialTags = [];
  const initialTagsScript = document.getElementById('initial-tags');
  if (initialTagsScript) {
    try {
      initialTags = JSON.parse(initialTagsScript.textContent);
    } catch (e) {}
  } else if (hiddenTags && hiddenTags.value) {
    try {
      initialTags = JSON.parse(hiddenTags.value);
    } catch (e) {}
  }
  if (Array.isArray(initialTags) && initialTags.length) {
    initialTags.forEach(tag => {
      if (!tags.includes(tag)) tags.push(tag);
    });
    renderTags();
  }

  // Initialize character counts
  if (excerptInput.value) {
    const length = excerptInput.value.length;
    const maxLength = excerptInput.getAttribute('maxlength') || 150;
    excerptCharCount.textContent = `${length}/${maxLength} characters`;
  }

  if (postTitle.value) {
    updateCharCount(postTitle, 200);
  }
});
