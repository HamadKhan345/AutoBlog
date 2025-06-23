document.addEventListener('DOMContentLoaded', function() {
    // Social sharing functionality
    const shareButtons = document.querySelectorAll('.share-btn');
    const currentUrl = window.location.href;
    const postTitle = document.querySelector('.post-title').textContent;
    
    shareButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const platform = this.classList.contains('twitter') ? 'twitter' :
                           this.classList.contains('facebook') ? 'facebook' :
                           this.classList.contains('linkedin') ? 'linkedin' : 'copy';
            
            sharePost(platform, currentUrl, postTitle);
        });
    });
    
    function sharePost(platform, url, title) {
        let shareUrl = '';
        
        switch(platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'copy':
                copyToClipboard(url);
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(function() {
            showToast('Link copied to clipboard!');
        }).catch(function() {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('Link copied to clipboard!');
        });
    }
    
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
    
    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const button = this.querySelector('button');
            const originalText = button.textContent;
            
            button.textContent = 'Subscribing...';
            button.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                showToast('Successfully subscribed to newsletter!');
                this.reset();
                button.textContent = originalText;
                button.disabled = false;
            }, 1500);
        });    }
    
    // Smooth scrolling for popular posts
    const popularItems = document.querySelectorAll('.popular-item');
    popularItems.forEach(item => {
        item.addEventListener('click', function() {
            // In a real implementation, this would navigate to the actual post
            console.log('Navigate to:', this.querySelector('h4').textContent);
        });
    });
    
    // Reading progress indicator
    createReadingProgress();
    
    function createReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #212529, #495057);
            z-index: 9999;
            transition: width 0.1s ease;
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', updateReadingProgress);
    }
    
    function updateReadingProgress() {
        const article = document.querySelector('.blog-post');
        if (!article) return;
        
        const articleTop = article.offsetTop;
        const articleHeight = article.offsetHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.pageYOffset;
        
        const articleStart = articleTop - windowHeight / 2;
        const articleEnd = articleTop + articleHeight - windowHeight / 2;
        
        if (scrollTop >= articleStart && scrollTop <= articleEnd) {
            const progress = (scrollTop - articleStart) / (articleEnd - articleStart);
            const progressBar = document.getElementById('reading-progress');
            progressBar.style.width = Math.min(Math.max(progress * 100, 0), 100) + '%';
        }
    }
    
    // Initialize Quill editor if in edit mode (for admin)
    if (document.getElementById('blog-editor')) {
        const quill = new Quill('#blog-editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    ['link', 'image'],
                    ['clean']
                ]
            }
        });
    }
});